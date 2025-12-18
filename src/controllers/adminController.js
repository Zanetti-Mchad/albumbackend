const {
	getAllUsers,
	toggleUserStatus,
	deleteUser,
} = require("../services/adminService");
const {
	createTag,
	assignTagToUser,
	assignTagToRole,
	getAllTags,
} = require("../services/tagService");
const { addUser } = require("../services/userService");

const handleGetAllUsers = async (req, res) => {
	try {
		const users = await getAllUsers();
		res.success("SUCCESS", users);
	} catch (error) {
		res.error("400", "Internal Server Error");
	}
};

const handleToggleUserStatus = async (req, res) => {
	try {
		const { userId, isActive } = req.body;

		const user = await toggleUserStatus(userId, isActive);
		res.status(200).json({
			message: `User status updated to ${isActive ? "active" : "inactive"}`,
			user,
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

const handleDeleteUser = async (req, res) => {
	try {
		const { userId } = req.params;

		await deleteUser(userId);
		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

const handleCreateTag = async (req, res) => {
	try {
		const { name } = req.body;

		const tag = await createTag(name);
		res.success("Tag created successfully", tag);
	} catch (error) {
		res.error("400", "Invalid tag name or tag already exists");
	}
};

const handleAddUser = async (req, res) => {
	try {
		const { email, roleId, tagId, name, phone } = req.body;

		const user = await addUser(email, roleId, name, tagId, phone);
		res.success("SUCCESS");
	} catch (error) {
		console.log(error);
		res.error("400", "Internal Server Error");
	}
};

const handleAssignTagToUser = async (req, res) => {
	try {
		const { userId, tagId } = req.body;

		const user = await assignTagToUser(userId, tagId);
		res
			.status(200)
			.json({ message: "Tag assigned to user successfully", user });
	} catch (error) {
		console.log(error);
		res.status(400).json({ error: error.message });
	}
};

const handleAssignTagToRole = async (req, res) => {
	try {
		const { roleId, tagId } = req.body;

		const role = await assignTagToRole(roleId, tagId);
		res
			.status(200)
			.json({ message: "Tag assigned to role successfully", role });
	} catch (error) {
		console.log(error);
		res.status(400).json({ error: error.message });
	}
};

const handleGetAllTags = async (req, res) => {
	try {
		const tags = await getAllTags();
		res.success("Tags retrieved successfully", tags);
	} catch (error) {
		//console.error("Error fetching tags:", error);
		res.error("500", "Internal server error");
	}
};

module.exports = {
	handleGetAllUsers,
	handleToggleUserStatus,
	handleDeleteUser,
	handleCreateTag,
	handleAddUser,
	handleAssignTagToUser,
	handleAssignTagToRole,
	handleGetAllTags,
};
