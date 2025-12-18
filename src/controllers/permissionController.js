const {
	createPermission,
	getAllPermissions,
	updatePermission,
	deletePermission,
} = require("../services/permissionService");

const handleCreatePermission = async (req, res) => {
	try {
		const permissions = req.body.permissions;

		// Validate input
		if (
			!permissions ||
			!Array.isArray(permissions) ||
			permissions.length === 0
		) {
			return res.error("400", "Invalid or empty permissions array");
		}

		// Process permissions
		const createdPermissions = [];
		for (const { name, description } of permissions) {
			if (!name) {
				return res.error("400", "Permission name is required");
			}
			const permission = await createPermission(name, description);
			createdPermissions.push(permission);
		}

		res.success("Permissions created successfully", createdPermissions);
	} catch (error) {
		console.error("Error creating permissions:", error);
		res.error("400", error.message || "Failed to create permissions");
	}
};

const handleGetPermissions = async (req, res) => {
	try {
		const permissions = await getAllPermissions();
		res.success("SUCCESS", permissions);
	} catch (error) {
		res.error("500", "Internal server error");
	}
};

const handleUpdatePermission = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		const permission = await updatePermission(id, updates);
		res
			.status(200)
			.json({ message: "Permission updated successfully", permission });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

const handleDeletePermission = async (req, res) => {
	try {
		const { id } = req.params;
		await deletePermission(id);
		res.status(200).json({ message: "Permission deleted successfully" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

module.exports = {
	handleCreatePermission,
	handleGetPermissions,
	handleUpdatePermission,
	handleDeletePermission,
};
