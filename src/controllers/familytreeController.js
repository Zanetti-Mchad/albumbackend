const prisma = require("../config/prisma");

// Helper function to format response
const formatResponse = (statusCode, message, data = null) => ({
  status: {
    returnCode: statusCode,
    returnMessage: message
  },
  ...(data && { data })
});

/**
 * Create or update a complete family tree with all members
 * POST /api/v1/family-tree
 */
const submitFamilyTree = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, rootId, memberCount, members } = req.body;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json(formatResponse(400, 'Members array is required and cannot be empty'));
    }

    if (memberCount !== members.length) {
      return res.status(400).json(formatResponse(400, 'Member count does not match members array length'));
    }

    // Create or get existing family tree
    let familyTree = await prisma.familyTree.findFirst({
      where: { userId },
    });

    if (!familyTree) {
      familyTree = await prisma.familyTree.create({
        data: {
          userId,
          name: name?.trim() || null,
          rootId,
        },
      });
    } else {
      // Delete existing members for this tree to recreate
      await prisma.familyTreeMember.deleteMany({
        where: { treeId: familyTree.id },
      });

      // Update tree
      familyTree = await prisma.familyTree.update({
        where: { id: familyTree.id },
        data: {
          ...(name !== undefined && { name: name?.trim() || null }),
          rootId,
        },
      });
    }

    // Create all members
    const createdMembers = await Promise.all(
      members.map((member) =>
        prisma.familyTreeMember.create({
          data: {
            treeId: familyTree.id,
            externalId: member.externalId,
            name: member.name,
            gender: member.gender,
            birthYear: member.birthYear,
            birthMonth: member.birthMonth,
            deathYear: member.deathYear,
            parentIds: JSON.stringify(member.parentIds || []),
            spouseIds: JSON.stringify(member.spouseIds || []),
            childrenIds: JSON.stringify(member.childrenIds || []),
            relationshipToRoot: member.relationshipToRoot,
          },
        })
      )
    );

    return res.status(201).json(
      formatResponse(201, 'Family tree saved successfully!', {
        treeId: familyTree.id,
        name: familyTree.name,
        rootId: familyTree.rootId,
        memberCount: createdMembers.length,
        members: createdMembers.map(formatMemberForResponse),
      })
    );
  } catch (error) {
    console.error('Error submitting family tree:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to save family tree')
    );
  }
};

/**
 * Get user's family tree with all members
 * GET /api/v1/family-tree
 */
const getFamilyTree = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    const familyTree = await prisma.familyTree.findFirst({
      where: { userId },
      include: {
        members: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!familyTree) {
      return res.status(404).json(formatResponse(404, 'Family tree not found'));
    }

    return res.status(200).json(
      formatResponse(200, 'Family tree retrieved successfully', {
        treeId: familyTree.id,
        name: familyTree.name,
        rootId: familyTree.rootId,
        memberCount: familyTree.members.length,
        members: familyTree.members.map(formatMemberForResponse),
        createdAt: familyTree.createdAt,
        updatedAt: familyTree.updatedAt,
      })
    );
  } catch (error) {
    console.error('Error getting family tree:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to retrieve family tree')
    );
  }
};

/**
 * Get a specific family tree member by ID
 * GET /api/v1/family-tree/member/:memberId
 */
const getFamilyTreeMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { memberId } = req.params;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    const member = await prisma.familyTreeMember.findFirst({
      where: {
        id: memberId,
        tree: { userId },
      },
      include: {
        tree: true,
      },
    });

    if (!member) {
      return res.status(404).json(formatResponse(404, 'Family tree member not found'));
    }

    return res.status(200).json(
      formatResponse(200, 'Member retrieved successfully', formatMemberForResponse(member))
    );
  } catch (error) {
    console.error('Error getting family tree member:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to retrieve member')
    );
  }
};

/**
 * Update a specific family tree member
 * PUT /api/v1/family-tree/member/:memberId
 */
const updateFamilyTreeMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { memberId } = req.params;
    const { name, gender, birthYear, birthMonth, deathYear, parentIds, spouseIds, childrenIds, relationshipToRoot } = req.body;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    // Verify member belongs to user
    const member = await prisma.familyTreeMember.findFirst({
      where: {
        id: memberId,
        tree: { userId },
      },
    });

    if (!member) {
      return res.status(404).json(formatResponse(404, 'Family tree member not found'));
    }

    const updatedMember = await prisma.familyTreeMember.update({
      where: { id: memberId },
      data: {
        ...(name && { name }),
        ...(gender && { gender }),
        ...(birthYear !== undefined && { birthYear }),
        ...(birthMonth !== undefined && { birthMonth }),
        ...(deathYear !== undefined && { deathYear }),
        ...(parentIds && { parentIds: JSON.stringify(parentIds) }),
        ...(spouseIds && { spouseIds: JSON.stringify(spouseIds) }),
        ...(childrenIds && { childrenIds: JSON.stringify(childrenIds) }),
        ...(relationshipToRoot && { relationshipToRoot }),
      },
    });

    return res.status(200).json(
      formatResponse(200, 'Member updated successfully', formatMemberForResponse(updatedMember))
    );
  } catch (error) {
    console.error('Error updating family tree member:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to update member')
    );
  }
};

/**
 * Delete a family tree member
 * DELETE /api/v1/family-tree/member/:memberId
 */
const deleteFamilyTreeMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { memberId } = req.params;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    // Verify member belongs to user
    const member = await prisma.familyTreeMember.findFirst({
      where: {
        id: memberId,
        tree: { userId },
      },
    });

    if (!member) {
      return res.status(404).json(formatResponse(404, 'Family tree member not found'));
    }

    await prisma.familyTreeMember.delete({
      where: { id: memberId },
    });

    return res.status(200).json(
      formatResponse(200, 'Member deleted successfully')
    );
  } catch (error) {
    console.error('Error deleting family tree member:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to delete member')
    );
  }
};

/**
 * Delete entire family tree
 * DELETE /api/v1/family-tree
 */
const deleteFamilyTree = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    const familyTree = await prisma.familyTree.findFirst({
      where: { userId },
    });

    if (!familyTree) {
      return res.status(404).json(formatResponse(404, 'Family tree not found'));
    }

    // Delete all members first before deleting the tree
    await prisma.familyTreeMember.deleteMany({
      where: { treeId: familyTree.id },
    });

    await prisma.familyTree.delete({
      where: { id: familyTree.id },
    });

    return res.status(200).json(
      formatResponse(200, 'Family tree deleted successfully')
    );
  } catch (error) {
    console.error('Error deleting family tree:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to delete family tree')
    );
  }
};

/**
 * Get family tree statistics
 * GET /api/v1/family-tree/stats
 */
const getFamilyTreeStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    const familyTree = await prisma.familyTree.findFirst({
      where: { userId },
      include: {
        members: true,
      },
    });

    if (!familyTree) {
      return res.status(404).json(formatResponse(404, 'Family tree not found'));
    }

    const stats = {
      name: familyTree.name,
      totalMembers: familyTree.members.length,
      maleCount: familyTree.members.filter(m => m.gender === 'male').length,
      femaleCount: familyTree.members.filter(m => m.gender === 'female').length,
      membersWithBirthDate: familyTree.members.filter(m => m.birthYear || m.birthMonth).length,
      membersWithDeathDate: familyTree.members.filter(m => m.deathYear).length,
      rootId: familyTree.rootId,
      createdAt: familyTree.createdAt,
      updatedAt: familyTree.updatedAt,
    };

    return res.status(200).json(
      formatResponse(200, 'Statistics retrieved successfully', stats)
    );
  } catch (error) {
    console.error('Error getting family tree stats:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to retrieve statistics')
    );
  }
};

/**
 * Add a single member to existing family tree
 * POST /api/v1/family-tree/member
 */
const addFamilyTreeMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { externalId, name, gender, birthYear, birthMonth, deathYear, parentIds, spouseIds, childrenIds, relationshipToRoot } = req.body;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    if (!name || !gender || !externalId) {
      return res.status(400).json(formatResponse(400, 'Name, gender, and externalId are required'));
    }

    const familyTree = await prisma.familyTree.findFirst({
      where: { userId },
    });

    if (!familyTree) {
      return res.status(404).json(formatResponse(404, 'Family tree not found. Create one first.'));
    }

    // Check if member already exists
    const existingMember = await prisma.familyTreeMember.findUnique({
      where: {
        treeId_externalId: {
          treeId: familyTree.id,
          externalId,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json(formatResponse(409, 'Member with this external ID already exists'));
    }

    const newMember = await prisma.familyTreeMember.create({
      data: {
        treeId: familyTree.id,
        externalId,
        name,
        gender,
        birthYear,
        birthMonth,
        deathYear,
        parentIds: JSON.stringify(parentIds || []),
        spouseIds: JSON.stringify(spouseIds || []),
        childrenIds: JSON.stringify(childrenIds || []),
        relationshipToRoot,
      },
    });

    return res.status(201).json(
      formatResponse(201, 'Member added successfully', formatMemberForResponse(newMember))
    );
  } catch (error) {
    console.error('Error adding family tree member:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to add member')
    );
  }
};

/**
 * Get all members of a family tree with filtering
 * GET /api/v1/family-tree/members?gender=male&hasChildren=true
 */
const getFamilyTreeMembers = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { gender, relationshipToRoot, limit = 100, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json(formatResponse(401, 'Unauthorized: User not found'));
    }

    const familyTree = await prisma.familyTree.findFirst({
      where: { userId },
    });

    if (!familyTree) {
      return res.status(404).json(formatResponse(404, 'Family tree not found'));
    }

    const where = { treeId: familyTree.id };
    if (gender) where.gender = gender;
    if (relationshipToRoot) where.relationshipToRoot = relationshipToRoot;

    const [members, total] = await Promise.all([
      prisma.familyTreeMember.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.familyTreeMember.count({ where }),
    ]);

    return res.status(200).json(
      formatResponse(200, 'Members retrieved successfully', {
        members: members.map(formatMemberForResponse),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      })
    );
  } catch (error) {
    console.error('Error getting family tree members:', error);
    return res.status(500).json(
      formatResponse(500, error.message || 'Failed to retrieve members')
    );
  }
};

/**
 * Helper function to format member for response (parse JSON fields)
 */
const formatMemberForResponse = (member) => ({
  id: member.id,
  externalId: member.externalId,
  name: member.name,
  gender: member.gender,
  birthYear: member.birthYear,
  birthMonth: member.birthMonth,
  deathYear: member.deathYear,
  parentIds: typeof member.parentIds === 'string' ? JSON.parse(member.parentIds) : member.parentIds,
  spouseIds: typeof member.spouseIds === 'string' ? JSON.parse(member.spouseIds) : member.spouseIds,
  childrenIds: typeof member.childrenIds === 'string' ? JSON.parse(member.childrenIds) : member.childrenIds,
  relationshipToRoot: member.relationshipToRoot,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
});

module.exports = {
  submitFamilyTree,
  getFamilyTree,
  getFamilyTreeMember,
  updateFamilyTreeMember,
  deleteFamilyTreeMember,
  deleteFamilyTree,
  getFamilyTreeStats,
  addFamilyTreeMember,
  getFamilyTreeMembers,
};
