const prisma = require("../config/prisma");

// Enumerations aligned with prisma schema for validation
const VALID_ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "PASSWORD_RESET",
  "PROFILE_UPDATE",
  "PERMISSION_CHANGE",
  "ACCOUNT_CREATE",
  "DATA_ACCESS",
  "DATA_MODIFY",
];

const VALID_STATUSES = ["SUCCESS", "FAILURE", "WARNING", "INFO"];

// Function to log security actions
const logSecurityAction = async (req, res) => {
  try {
    const { userId, action, status, description } = req.body;

    if (!userId || !action || !status) {
      return res.status(400).json({ error: "userId, action and status are required" });
    }

    const normalizedAction = String(action).toUpperCase();
    const normalizedStatus = String(status).toUpperCase();

    if (!VALID_ACTIONS.includes(normalizedAction)) {
      return res.status(400).json({ error: `Invalid action. Allowed: ${VALID_ACTIONS.join(", ")}` });
    }
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` });
    }

    const log = await prisma.log.create({
      data: {
        userId: userId,
        action: normalizedAction,
        status: normalizedStatus,
        description: description || null,
      },
    });

    return res.status(201).json({
      status: {
        returnCode: "00",
        returnMessage: "Log created successfully",
      },
      log: log,
    });
  } catch (error) {
    console.error("Error logging security action:", error);
    return res.status(500).json({
      status: {
        returnCode: "99",
        returnMessage: "Internal server error",
      },
    });
  }
};

const getSecurityLogs = async (req, res) => {
  const { userId } = req.params;
  try {
    const logs = await prisma.log.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({
      status: {
        returnCode: "00",
        returnMessage: "Logs fetched successfully",
      },
      data: logs,
    });
  } catch (error) {
    console.error("Error fetching security logs:", error);
    return res.status(500).json({
      status: {
        returnCode: "99",
        returnMessage: "Internal server error",
      },
    });
  }
};

module.exports = {
  logSecurityAction,
  getSecurityLogs,
};