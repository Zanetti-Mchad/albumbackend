const express = require("express");
const {
	handleCreateRole,
	handleAssignRole,
	handleGetRoles,
} = require("../controllers/roleController");
const authenticate = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermissions");

const router = express.Router();

router.post(
	"/",
	authenticate,
	checkPermission("manage_roles"),
	handleCreateRole
);
router.post(
	"/assign-role",
	authenticate,
	checkPermission("manage_users"),
	handleAssignRole
);
router.get("/", authenticate, checkPermission("view_roles"), handleGetRoles);

module.exports = router;
