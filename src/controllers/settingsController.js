const prisma = require("../config/prisma");

// Update family profile settings
const updateFamilyProfile = async (req, res) => {
  try {
    const { familyName, familyBio, familyPhoto } = req.body;

    // Validate required fields
    if (!familyName || !familyBio) {
      return res.status(400).json({
        status: {
          returnCode: 400,
          returnMessage: "Family name and bio are required"
        }
      });
    }

    // Find existing settings
    const existingSettings = await prisma.familySettings.findFirst();

    const settingsData = {
      familyName,
      familyBio,
      familyPhoto: familyPhoto || '/default-family.jpg',
      updatedAt: new Date()
    };

    let result;
    if (existingSettings) {
      // Update existing settings
      result = await prisma.familySettings.update({
        where: { id: existingSettings.id },
        data: settingsData
      });
    } else {
      // Create new settings
      result = await prisma.familySettings.create({
        data: settingsData
      });
    }

    return res.status(200).json({
      status: {
        returnCode: 200,
        returnMessage: "Family profile updated successfully"
      },
      data: result
    });

  } catch (error) {
    console.error('Error updating family profile:', error);
    return res.status(500).json({
      status: {
        returnCode: 500,
        returnMessage: "Internal server error"
      },
      error: error.message
    });
  }
};

// Get family profile settings
const getFamilyProfile = async (req, res) => {
  try {
    const settings = await prisma.familySettings.findFirst();
    
    // Return default values if no settings exist
    if (!settings) {
      return res.status(200).json({
        status: {
          returnCode: 200,
          returnMessage: "Using default family settings"
        },
        data: {
          familyName: "The Smith Family",
          familyBio: "Our family memories since 2010",
          familyPhoto: "/default-family.jpg"
        }
      });
    }

    return res.status(200).json({
      status: {
        returnCode: 200,
        returnMessage: "Family profile retrieved successfully"
      },
      data: settings
    });
  } catch (error) {
    console.error('Error fetching family profile:', error);
    return res.status(500).json({
      status: {
        returnCode: 500,
        returnMessage: "Internal server error"
      },
      error: error.message
    });
  }
};

module.exports = {
  updateFamilyProfile,
  getFamilyProfile
};