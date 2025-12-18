const prisma = require("../config/prisma");
const { sendEmail } = require("./emailService");
const { sendSMS } = require("./smsService");
const bcrypt = require("bcrypt");

const addUser = async (email, roleId, name, tagId, phone) => {
	try {
		// Validate the tag ID
		/**const tagExists = await prisma.tag.findUnique({
			where: { id: tagId },
		});
		if (!tagExists) {
			throw new Error("Invalid tag ID");
		}**/

		// Validate the role ID
		const roleExists = await prisma.role.findUnique({
			where: { id: roleId },
		});
		if (!roleExists) {
			throw new Error("Invalid role ID");
		}

		// Create the user
		const user = await prisma.user.create({
			data: {
				email,
				password: await bcrypt.hash("tempPassword123", 10), // Temporary password
				emailVerified: false,
				name,
				phone,
			},
		});

		// Create the relationship in the UserTag table
		/**await prisma.userTag.create({
			data: { userId: user.id },
		});**/

		// Assign role to the user via the UserRole table
		await prisma.userRole.create({
			data: { userId: user.id, roleId },
		});

		// Send notification
		await sendEmail(
			user.email,
			"Account Created",
			`Hello ${name}, your account has been created. Your username is ${email}. Please reset your password.`
		);

		await sendSMS(
			user.phone,
			`Hello ${name}, your account has been created. Your username is ${phone}. Please reset your password.`
		);

		return user;
	} catch (error) {
		console.error("Error adding user:", error);
		throw new Error(error.message || "Failed to add user");
	}
};

module.exports = { addUser };
