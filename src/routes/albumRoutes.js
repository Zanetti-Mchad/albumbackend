const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
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
} = require("../controllers/albumController");

const router = express.Router();
const formidableUpload = require("../middlewares/formidableUpload");

// Apply authentication middleware to all routes
router.use(authenticate);

// Album routes
router.post("/", formidableUpload(), createAlbum);
router.get("/", getAllAlbums);
router.get("/:id", getAlbumById);
router.put("/:id", updateAlbum);
router.delete("/:id", deleteAlbum);

// Reactions & Comments on Albums
router.post("/:id/like", likeAlbum);
router.delete("/:id/like", unlikeAlbum);
router.get("/:id/reactions", getAlbumReactions);
router.post("/:id/comments", addAlbumComment);
router.get("/:id/comments", getAlbumComments);

// Album Media routes
router.post("/:id/media", formidableUpload(), addMediaToAlbum);
router.delete("/:id/media/:mediaId", removeMediaFromAlbum);
// Media reactions & comments
router.post("/:id/media/:mediaId/like", likeMedia);
router.delete("/:id/media/:mediaId/like", unlikeMedia);
router.get("/:id/media/:mediaId/reactions", getMediaReactions);
router.post("/:id/media/:mediaId/comments", addMediaComment);
router.get("/:id/media/:mediaId/comments", getMediaComments);

module.exports = router;