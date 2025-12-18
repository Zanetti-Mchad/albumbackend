const prisma = require("../config/prisma");
const fs = require('fs');
const path = require('path');

// Helper function to format response
const formatResponse = (statusCode, message, data = null) => ({
  status: {
    returnCode: statusCode,
    returnMessage: message
  },
  ...(data && { data })
});

const { uploadFile, isConfigured: isCloudinaryConfigured } = require("../services/cloudinaryService");

// Create a new album (supports JSON URL mode and multipart files mode)
const createAlbum = async (req, res) => {
  try {
    const { title, description } = req.body;
    let { isPublic = true, cover, media: mediaFromBody } = req.body;
    const userId = req.user?.id;

    if (!title) {
      return res.status(400).json(formatResponse(400, 'Album title is required'));
    }

    // Normalize boolean for isPublic (handles 'true'/'false' strings)
    if (typeof isPublic === 'string') {
      isPublic = isPublic.toLowerCase() === 'true';
    } else {
      isPublic = Boolean(isPublic);
    }

    // If media is sent as a JSON string, attempt to parse
    if (typeof mediaFromBody === 'string') {
      try {
        mediaFromBody = JSON.parse(mediaFromBody);
      } catch (_) {
        // ignore parse error; will fallback to files mode
      }
    }

    let media = [];

    // JSON URL mode
    if (Array.isArray(mediaFromBody) && mediaFromBody.length > 0) {
      media = mediaFromBody.map(m => ({
        url: m.url,
        type: m.type === 'video' ? 'video' : 'image',
        thumbnail: m.thumbnail || (m.type === 'image' ? m.url : null),
        size: Number(m.size) || 0,
        mimeType: m.mimeType || (m.type === 'image' ? 'image/jpeg' : 'video/mp4'),
      }));
    } else {
      // Multipart files mode
      const files = req.files?.files || [];
      if (!files.length) {
        return res.status(400).json(formatResponse(400, 'At least one media file is required'));
      }

      media = await Promise.all(
        files.map(async (file) => {
          const uploaded = await uploadFile(file.filepath || file.path, { folder: 'albums' });
          const isImage = (file.mimetype || '').startsWith('image/') || uploaded.resource_type === 'image';
          return {
            url: uploaded.url || (file.path || file.filepath),
            type: isImage ? 'image' : 'video',
            thumbnail: isImage ? (uploaded.thumbnail || uploaded.url || (file.path || file.filepath)) : null,
            size: file.size || uploaded.bytes || 0,
            mimeType: file.mimetype || uploaded.mimeType || null,
          };
        })
      );
    }

    const album = await prisma.album.create({
      data: {
        title,
        description,
        isPublic: Boolean(isPublic),
        cover: cover || media[0]?.url || null,
        userId,
        media: { create: media },
      },
      include: {
        media: true,
        user: { select: { id: true, firstName: true, lastName: true, photo: true } },
      },
    });

    return res.status(201).json(formatResponse(201, 'Album created successfully', { album }));
  } catch (error) {
    console.error('Error creating album:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

// Get all albums with pagination
const getAllAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where: { isPublic: true },
        include: {
          _count: { select: { media: true } },
          media: { take: 1, select: { url: true, type: true } },
          user: {
            select: { id: true, firstName: true, lastName: true, photo: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.album.count()
    ]);

    const formattedAlbums = albums.map(album => ({
      ...album,
      photoCount: album._count.media,
      cover: album.media[0]?.url || null,
      media: undefined,
      _count: undefined
    }));

    return res.status(200).json(
      formatResponse(200, 'Albums retrieved successfully', {
        albums: formattedAlbums,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      })
    );

  } catch (error) {
    console.error('Error fetching albums:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Get album by ID
const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        media: true,
        user: {
          select: { id: true, firstName: true, lastName: true, photo: true }
        },
        _count: { select: { media: { where: { type: 'image' } } } }
      }
    });

    if (!album) {
      return res.status(404).json(
        formatResponse(404, 'Album not found')
      );
    }

    const formattedAlbum = {
      ...album,
      photoCount: album._count.media,
      videoCount: album.media.filter(m => m.type === 'video').length,
      _count: undefined
    };

    return res.status(200).json(
      formatResponse(200, 'Album retrieved successfully', { album: formattedAlbum })
    );

  } catch (error) {
    console.error('Error fetching album:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Update album
const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPublic, coverMediaId } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    if (coverMediaId) {
      const media = await prisma.media.findUnique({
        where: { id: coverMediaId }
      });
      if (media) updateData.cover = media.url;
    }

    const updatedAlbum = await prisma.album.update({
      where: { id },
      data: updateData,
      include: {
        media: true,
        user: {
          select: { id: true, firstName: true, lastName: true, photo: true }
        }
      }
    });

    return res.status(200).json(
      formatResponse(200, 'Album updated successfully', { album: updatedAlbum })
    );

  } catch (error) {
    console.error('Error updating album:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Delete album
const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await prisma.album.findUnique({
      where: { id },
      include: { media: true }
    });

    if (!album) {
      return res.status(404).json(
        formatResponse(404, 'Album not found')
      );
    }

    // Delete associated media files
    album.media.forEach(media => {
      const filePath = path.join(__dirname, '..', '..', media.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (media.thumbnail) {
        const thumbPath = path.join(__dirname, '..', '..', media.thumbnail);
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      }
    });

    await prisma.album.delete({ where: { id } });

    return res.status(200).json(
      formatResponse(200, 'Album deleted successfully')
    );

  } catch (error) {
    console.error('Error deleting album:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Add media to album
const addMediaToAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files?.files || [];

    if (!files.length) {
      return res.status(400).json(
        formatResponse(400, 'No files provided')
      );
    }

    const media = await Promise.all(
      files.map(async (file) => {
        const uploaded = await uploadFile(file.filepath || file.path, { folder: "albums" });
        const isImage = (file.mimetype || "").startsWith('image/') || uploaded.resource_type === 'image';
        return {
          url: uploaded.url || (file.path || file.filepath),
          type: isImage ? 'image' : 'video',
          thumbnail: isImage ? (uploaded.thumbnail || uploaded.url || (file.path || file.filepath)) : null,
          size: file.size || uploaded.bytes || 0,
          mimeType: file.mimetype || uploaded.mimeType || null,
          albumId: id
        };
      })
    );

    await prisma.media.createMany({ data: media });

    // Set first media as cover if no cover exists
    const album = await prisma.album.findUnique({
      where: { id },
      select: { cover: true }
    });

    if (!album.cover && media.length > 0) {
      await prisma.album.update({
        where: { id },
        data: { cover: media[0].url }
      });
    }

    return res.status(201).json(
      formatResponse(201, 'Media added to album successfully', {
        count: media.length
      })
    );

  } catch (error) {
    console.error('Error adding media to album:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Remove media from album
const removeMediaFromAlbum = async (req, res) => {
  try {
    const { id, mediaId } = req.params;

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return res.status(404).json(
        formatResponse(404, 'Media not found')
      );
    }

    if (media.albumId !== id) {
      return res.status(400).json(
        formatResponse(400, 'Media does not belong to this album')
      );
    }

    // Delete media file
    const filePath = path.join(__dirname, '..', '..', media.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (media.thumbnail) {
      const thumbPath = path.join(__dirname, '..', '..', media.thumbnail);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await prisma.media.delete({ where: { id: mediaId } });

    // Update cover if needed
    const album = await prisma.album.findUnique({
      where: { id },
      include: { media: { take: 1, select: { url: true } } }
    });

    if (album.cover === media.url) {
      const newCover = album.media[0]?.url || null;
      await prisma.album.update({
        where: { id },
        data: { cover: newCover }
      });
    }

    return res.status(200).json(
      formatResponse(200, 'Media removed from album successfully')
    );

  } catch (error) {
    console.error('Error removing media from album:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// --- Reactions & Comments: Albums ---
const likeAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(formatResponse(401, 'Unauthorized'));

    // Ensure album exists
    const exists = await prisma.album.findUnique({ where: { id } });
    if (!exists) return res.status(404).json(formatResponse(404, 'Album not found'));

    // Create like if not exists
    await prisma.albumLike.upsert({
      where: { userId_albumId: { userId, albumId: id } },
      create: { userId, albumId: id },
      update: {}
    });

    const [likes, comments] = await Promise.all([
      prisma.albumLike.count({ where: { albumId: id } }),
      prisma.albumComment.count({ where: { albumId: id } }),
    ]);

    return res.status(200).json(formatResponse(200, 'Album liked', { likes, comments }));
  } catch (error) {
    console.error('Error liking album:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

const unlikeAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(formatResponse(401, 'Unauthorized'));

    await prisma.albumLike.deleteMany({ where: { userId, albumId: id } });

    const [likes, comments] = await Promise.all([
      prisma.albumLike.count({ where: { albumId: id } }),
      prisma.albumComment.count({ where: { albumId: id } }),
    ]);

    return res.status(200).json(formatResponse(200, 'Album unliked', { likes, comments }));
  } catch (error) {
    console.error('Error unliking album:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

const getAlbumReactions = async (req, res) => {
  try {
    const { id } = req.params;
    const [likes, comments] = await Promise.all([
      prisma.albumLike.count({ where: { albumId: id } }),
      prisma.albumComment.count({ where: { albumId: id } }),
    ]);
    return res.status(200).json(formatResponse(200, 'Reactions fetched', { likes, comments }));
  } catch (error) {
    console.error('Error fetching album reactions:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

const addAlbumComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { content } = req.body;
    if (!userId) return res.status(401).json(formatResponse(401, 'Unauthorized'));
    if (!content || !content.trim()) return res.status(400).json(formatResponse(400, 'Content is required'));

    const comment = await prisma.albumComment.create({
      data: { userId, albumId: id, content: content.trim() },
      include: { user: { select: { id: true, firstName: true, lastName: true, photo: true } } }
    });
    return res.status(201).json(formatResponse(201, 'Comment added', { comment }));
  } catch (error) {
    console.error('Error adding album comment:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

const getAlbumComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.albumComment.findMany({
      where: { albumId: id },
      include: { user: { select: { id: true, firstName: true, lastName: true, photo: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(formatResponse(200, 'Comments fetched', { comments }));
  } catch (error) {
    console.error('Error fetching album comments:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

// --- Reactions & Comments: Media ---
const likeMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(formatResponse(401, 'Unauthorized'));

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) return res.status(404).json(formatResponse(404, 'Media not found'));

    await prisma.mediaLike.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      create: { userId, mediaId },
      update: {}
    });

    const [likes, comments] = await Promise.all([
      prisma.mediaLike.count({ where: { mediaId } }),
      prisma.mediaComment.count({ where: { mediaId } }),
    ]);
    return res.status(200).json(formatResponse(200, 'Media liked', { likes, comments }));
  } catch (error) {
    console.error('Error liking media:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

const unlikeMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(formatResponse(401, 'Unauthorized'));
    await prisma.mediaLike.deleteMany({ where: { userId, mediaId } });
    const [likes, comments] = await Promise.all([
      prisma.mediaLike.count({ where: { mediaId } }),
      prisma.mediaComment.count({ where: { mediaId } }),
    ]);
    return res.status(200).json(formatResponse(200, 'Media unliked', { likes, comments }));
  } catch (error) {
    console.error('Error unliking media:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

const getMediaReactions = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const [likes, comments] = await Promise.all([
      prisma.mediaLike.count({ where: { mediaId } }),
      prisma.mediaComment.count({ where: { mediaId } }),
    ]);
    return res.status(200).json(formatResponse(200, 'Reactions fetched', { likes, comments }));
  } catch (error) {
    console.error('Error fetching media reactions:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

const addMediaComment = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user?.id;
    const { content } = req.body;
    if (!userId) return res.status(401).json(formatResponse(401, 'Unauthorized'));
    if (!content || !content.trim()) return res.status(400).json(formatResponse(400, 'Content is required'));
    const comment = await prisma.mediaComment.create({
      data: { userId, mediaId, content: content.trim() },
      include: { user: { select: { id: true, firstName: true, lastName: true, photo: true } } }
    });
    return res.status(201).json(formatResponse(201, 'Comment added', { comment }));
  } catch (error) {
    console.error('Error adding media comment:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

const getMediaComments = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const comments = await prisma.mediaComment.findMany({
      where: { mediaId },
      include: { user: { select: { id: true, firstName: true, lastName: true, photo: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(formatResponse(200, 'Comments fetched', { comments }));
  } catch (error) {
    console.error('Error fetching media comments:', error);
    return res.status(500).json(formatResponse(500, 'Internal server error', { error: error.message }));
  }
};

module.exports = {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  addMediaToAlbum,
  removeMediaFromAlbum,
  likeAlbum,
  unlikeAlbum,
  getAlbumReactions,
  addAlbumComment,
  getAlbumComments,
  likeMedia,
  unlikeMedia,
  getMediaReactions,
  addMediaComment,
  getMediaComments,
};