const {
	createRole,
	assignRoleToUser,
	getRoles,
} = require("../services/roleService");

const handleCreateRole = async (req, res) => {
	try {
		const { name, permissions } = req.body;

		const role = await createRole(name, permissions);
		res.success("Role created successfully", role);
	} catch (error) {
		res.error("400", "Failed to create role");
	}
};

const handleAssignRole = async (req, res) => {
	try {
		const { userId, roleId } = req.body;

		const userRole = await assignRoleToUser(userId, roleId);
		res.status(200).json({ message: "Role assigned successfully", userRole });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

const handleGetRoles = async (req, res) => {
	try {
		const roles = await getRoles();
		res.success("SUCCESS", roles);
	} catch (error) {
		res.error("500", "Internal server error");
	}
};

module.exports = {
	handleCreateRole,
	handleAssignRole,
	handleGetRoles,
};
