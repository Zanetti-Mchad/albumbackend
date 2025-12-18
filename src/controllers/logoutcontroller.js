const prisma = require("../config/prisma");

const logLogoutAction = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const incomingStatus = req.body.status || "SUCCESS";
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const normalizedStatus = String(incomingStatus).toUpperCase();
    if (!["SUCCESS", "FAILURE", "WARNING", "INFO"].includes(normalizedStatus)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const log = await prisma.log.create({
      data: {
        userId: userId,
        action: "LOGOUT",
        status: normalizedStatus,
        description: null,
      },
    });

    return res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Error logging logout action:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  logLogoutAction,
};