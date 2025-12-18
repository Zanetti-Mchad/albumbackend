// Import Prisma ORM client for database operations
const prisma = require("../config/prisma");

/**
 * CREATE PERMISSION SERVICE
 * Creates new permission in the system
 * Used for role-based access control (RBAC) setup
 * Ensures permission names are unique across the system
 * @param {string} name - Unique permission name (e.g., "user:read", "admin:delete")
 * @param {string} description - Human-readable description of the permission
 * @returns {Object} - Created permission object
 * @throws {Error} - If permission name already exists
 */
const createPermission = async (name, description) => {
	// Check if permission with same name already exists
	const existingPermission = await prisma.permission.findUnique({
		where: { name },
	});

	// Prevent duplicate permission names to maintain system integrity
	if (existingPermission) {
		throw new Error("Permission name must be unique");
	}
	// Permission names should follow consistent naming convention:
	// - Format: "resource:action" (e.g., "user:create", "order:read")
	// - Lowercase with colons for separation
	// - Clear and descriptive for easy understanding

	// Create new permission in database
	return prisma.permission.create({
		data: { name, description },
	});
	// Example permissions:
	// - name: "user:read", description: "View user information"
	// - name: "admin:delete", description: "Delete system resources"
	// - name: "order:create", description: "Create new orders"
};

/**
 * GET ALL PERMISSIONS SERVICE
 * Retrieves all permissions from database
 * Used for admin dashboard permission management
 * Provides complete list for role assignment and system overview
 * @returns {Array} - Array of all permission objects
 */
const getAllPermissions = async () => {
	// Fetch all permissions without filtering
	return prisma.permission.findMany();
	// Returns all fields: id, name, description, createdAt, updatedAt
	// Used for:
	// - Admin dashboard permission listing
	// - Role creation/editing interfaces
	// - System permission auditing
	// - Permission assignment to roles
};

/**
 * UPDATE PERMISSION SERVICE
 * Updates existing permission information
 * Allows modification of permission details without changing assignments
 * Used for permission maintenance and description updates
 * @param {number} id - Permission's database ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Object} - Updated permission object
 * @throws {Error} - If permission ID doesn't exist
 */
const updatePermission = async (id, updates) => {
	// Update permission with provided data
	return prisma.permission.update({
		where: { id },        // Find permission by unique ID
		data: updates,        // Apply all provided updates
	});
	// Common update scenarios:
	// - Description clarification: { description: "Updated description" }
	// - Name standardization: { name: "standardized:format" }
	// - Bulk updates for system-wide permission restructuring
	// Note: Changing permission names may affect role assignments
};

/**
 * DELETE PERMISSION SERVICE
 * Permanently removes permission from database
 * WARNING: This will affect all roles that have this permission assigned
 * Should be used carefully to avoid breaking role-based access control
 * @param {number} id - Permission's database ID to delete
 * @returns {Object} - Deleted permission object
 * @throws {Error} - If permission ID doesn't exist or has dependencies
 */
const deletePermission = async (id) => {
	// Permanently delete permission from database
	return prisma.permission.delete({
		where: { id },
	});
	// IMPORTANT CONSIDERATIONS:
	// - This will cascade delete or cause errors if roles reference this permission
	// - Should check for role dependencies before deletion
	// - Consider soft deletion (isDeleted flag) for audit trails
	// - May require role permission cleanup after deletion
	// 
	// Safer approach would be:
	// 1. Check for role assignments first
	// 2. Remove from all roles before deletion
	// 3. Or use soft deletion to preserve audit history
};

// Export all permission service functions for use in controllers
module.exports = {
	createPermission,    // Create new permissions for RBAC system
	getAllPermissions,   // Retrieve all permissions for admin management
	updatePermission,    // Update permission details and descriptions
	deletePermission,    // Remove permissions (use with caution)
};
