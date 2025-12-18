const prisma = require("../config/prisma");

// Helper function to format response
const formatResponse = (statusCode, message, data = null) => ({
  status: {
    returnCode: statusCode,
    returnMessage: message
  },
  ...(data && { data })
});

// Create Family Member - NOTE: This now UPDATES a user with family details.
const createFamilyMember = async (req, res) => {
  try {
    const {
      userId, // Expecting userId from the registration step
      firstName,
      lastName,
      relationship,
      birthOrder = 'N/A',
      dateOfBirth,
      photo,
      email,
      phone
    } = req.body;

    // Validate required fields
    if (!userId || !firstName || !relationship) {
      return res.status(400).json(
        formatResponse(400, 'userId, firstName, and relationship are required fields')
      );
    }

    // Update user with family member details
    const updateData = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(relationship !== undefined && { relationship }),
      ...(birthOrder !== undefined && { birthOrder }),
      ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
      ...(photo !== undefined && { photo }),
      // Only set email if a valid new value is provided (not null or empty)
      ...(email !== undefined && email !== null && email !== '' && { email }),
      // Only set phone if a valid new value is provided
      ...(phone !== undefined && phone !== null && phone !== '' && { phone }),
    };

    const updatedUserAsMember = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        relationship: true,
        birthOrder: true,
        dateOfBirth: true,
        email: true,
        phone: true,
        photo: true,
        createdAt: true
      }
    });

    // Format date for response
    const responseData = {
      ...updatedUserAsMember,
      name: `${updatedUserAsMember.firstName} ${updatedUserAsMember.lastName || ''}`.trim(),
      dateOfBirth: updatedUserAsMember.dateOfBirth ? updatedUserAsMember.dateOfBirth.toISOString().split('T')[0] : null,
      createdBy: req.user?.name || 'System'
    };

    return res.status(201).json(
      formatResponse(201, 'Family member details added successfully', responseData)
    );

  } catch (error) {
    console.error('Error creating family member:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Get All Family Members
const getAllFamilyMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          relationship: true,
          birthOrder: true,
          dateOfBirth: true,
          email: true,
          phone: true,
          photo: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Format dates for response
    const formattedMembers = members.map(member => ({
      ...member,
      name: `${member.firstName} ${member.lastName || ''}`.trim(),
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.toISOString().split('T')[0] : null,
      createdBy: 'System' // You might want to join with user table to get actual creator
    }));

    return res.status(200).json(
      formatResponse(200, 'Family members retrieved successfully', {
        members: formattedMembers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      })
    );

  } catch (error) {
    console.error('Error fetching family members:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Get Family Member by ID
const getFamilyMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        relationship: true,
        birthOrder: true,
        dateOfBirth: true,
        email: true,
        phone: true,
        photo: true,
        createdAt: true
      }
    });

    if (!member) {
      return res.status(404).json(
        formatResponse(404, 'Family member not found')
      );
    }

    // Format date for response
    const responseData = {
      ...member,
      name: `${member.firstName} ${member.lastName || ''}`.trim(),
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.toISOString().split('T')[0] : null,
      createdBy: 'System' // You might want to join with user table to get actual creator
    };

    return res.status(200).json(
      formatResponse(200, 'Family member retrieved successfully', responseData)
    );

  } catch (error) {
    console.error('Error fetching family member:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Update Family Member
const updateFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      relationship,
      birthOrder,
      dateOfBirth,
      photo,
      email,
      phone
    } = req.body;

    // Check if member exists
    const existingMember = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!existingMember) {
      return res.status(404).json(
        formatResponse(404, 'Family member not found')
      );
    }

    const updatedMember = await prisma.user.update({
      where: { id: id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(relationship !== undefined && { relationship }),
        ...(birthOrder !== undefined && { birthOrder }),
        ...(dateOfBirth !== undefined && {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
        }),
        ...(photo !== undefined && { photo }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        relationship: true,
        birthOrder: true,
        dateOfBirth: true,
        email: true,
        phone: true,
        photo: true,
        updatedAt: true
      }
    });

    // Format date for response
    const responseData = {
      ...updatedMember,
      name: `${updatedMember.firstName} ${updatedMember.lastName || ''}`.trim(),
      dateOfBirth: updatedMember.dateOfBirth ?
        updatedMember.dateOfBirth.toISOString().split('T')[0] : null
    };

    return res.status(200).json(
      formatResponse(200, 'Family member updated successfully', responseData)
    );

  } catch (error) {
    console.error('Error updating family member:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

// Delete Family Member
const deleteFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if member exists
    const existingMember = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!existingMember) {
      return res.status(404).json(
        formatResponse(404, 'Family member not found')
      );
    }

    await prisma.user.delete({
      where: { id: id }
    });

    return res.status(200).json(
      formatResponse(200, 'Family member deleted successfully')
    );

  } catch (error) {
    console.error('Error deleting family member:', error);
    return res.status(500).json(
      formatResponse(500, 'Internal server error', { error: error.message })
    );
  }
};

module.exports = {
  createFamilyMember,
  getAllFamilyMembers,
  getFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember
};