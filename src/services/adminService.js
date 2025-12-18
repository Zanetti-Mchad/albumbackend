// Import Prisma ORM client for database operations
const prisma = require("../config/prisma");

/**
 * GET ALL USERS SERVICE
 * Retrieves all users from database with selected fields
 * Used for admin dashboard user management
 * Excludes sensitive data like passwords and personal details
 * @returns {Array} - Array of user objects with basic information
 */
const getAllUsers = async () => {
	// Query all users with specific field selection for security
	return prisma.user.findMany({
		select: {
			id: true,              // User's unique identifier
			email: true,           // User's email address
			phone: true,           // User's phone number
			isActive: true,        // Account status (active/inactive)
			emailVerified: true,   // Email verification status
			createdAt: true,       // Account creation timestamp
			updatedAt: true,       // Last update timestamp
		},
		// Note: Excludes sensitive fields like password, personal details, etc.
		// This provides admin overview without exposing private information
	});
};

/**
 * TOGGLE USER STATUS SERVICE
 * Activates or deactivates user accounts
 * Used for admin user management (suspend/restore accounts)
 * Does not delete user data, just changes access status
 * @param {number} userId - User's database ID
 * @param {boolean} isActive - New status (true = active, false = inactive)
 * @returns {Object} - Updated user object
 */
const toggleUserStatus = async (userId, isActive) => {
	// Update user's active status in database
	return prisma.user.update({
		where: { id: userId },    // Find user by ID
		data: { isActive },       // Set new active status
	});
	// When isActive = false: User cannot login but data is preserved
	// When isActive = true: User can login normally
	// This is safer than deletion for temporary suspensions
};

/**
 * DELETE USER SERVICE
 * Permanently removes user from database
 * Includes safety checks to prevent data integrity issues
 * Checks for associated records before deletion
 * @param {number} userId - User's database ID to delete
 * @returns {Object} - Deleted user object
 * @throws {Error} - If user has associated records that prevent deletion
 */
const deleteUser = async (userId) => {
	// Safety check: Look for associated records that would prevent deletion
	const hasAssociatedRecords = await prisma.userRole.findFirst({
		where: { userId },
	});
	// This checks if user has roles assigned in the system
	// Could be extended to check other relationships like:
	// - Orders, transactions, logs, etc.
	// - Any foreign key relationships that depend on this user

	// Prevent deletion if user has associated data
	if (hasAssociatedRecords) {
		throw new Error(
			"User cannot be deleted because they have associated roles or records"
		);
	}
	// This prevents orphaned records and maintains database integrity
	// Admin should remove associated records first, then delete user

	// Proceed with deletion if no associated records found
	return prisma.user.delete({
		where: { id: userId },
	});
	// WARNING: This is permanent and irreversible
	// Consider using soft deletion (isDeleted flag) instead for audit trails
};

// Export all admin service functions for use in controllers
module.exports = { 
	getAllUsers,        // Retrieve all users for admin dashboard
	toggleUserStatus,   // Activate/deactivate user accounts
	deleteUser          // Permanently delete user accounts (with safety checks)
};
