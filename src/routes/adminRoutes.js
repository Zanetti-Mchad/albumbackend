const express = require("express");
const {
	handleGetAllUsers,
	handleToggleUserStatus,
	handleDeleteUser,
	handleCreateTag,
	handleAddUser,
	handleAssignTagToUser,
	handleAssignTagToRole,
	handleGetAllTags,
} = require("../controllers/adminController");
const authenticate = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermissions");

const router = express.Router();

// Admin-only routes
router.get(
	"/users",
	authenticate,
	checkPermission("view_users"),
	handleGetAllUsers
);
router.put(
	"/users/status",
	authenticate,
	checkPermission("manage_users"),
	handleToggleUserStatus
);
router.delete(
	"/users/:userId",
	authenticate,
	checkPermission("manage_users"),
	handleDeleteUser
);
router.post(
	"/tags",
	authenticate,
	checkPermission("manage_tags"),
	handleCreateTag
);
router.get(
	"/tags",
	authenticate,
	checkPermission("view_tags"),
	handleGetAllTags
);
/**router.post(
	"/users",
	authenticate,
	checkPermission("manage_users"),
	handleAddUser
);**/
router.post(
	"/tags/assign-to-user",
	authenticate,
	checkPermission("manage_users"),
	handleAssignTagToUser
);
router.post(
	"/tags/assign-to-role",
	authenticate,
	checkPermission("manage_users"),
	handleAssignTagToRole
);

module.exports = router;
