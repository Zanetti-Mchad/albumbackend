const express = require("express");
const {
	handleCreatePermission,
	handleGetPermissions,
	handleUpdatePermission,
	handleDeletePermission,
} = require("../controllers/permissionController");
const authenticate = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermissions");

const router = express.Router();

router.post(
	"/",
	authenticate,
	checkPermission("manage_permissions"),
	handleCreatePermission
);
router.get(
	"/",
	authenticate,
	checkPermission("view_permissions"),
	handleGetPermissions
);
router.put(
	"/:id",
	authenticate,
	checkPermission("manage_permissions"),
	handleUpdatePermission
);
router.delete(
	"/:id",
	authenticate,
	checkPermission("manage_permissions"),
	handleDeletePermission
);

module.exports = router;
