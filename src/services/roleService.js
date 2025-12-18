// Import Prisma ORM client for database operations
const prisma = require("../config/prisma");

/**
 * CREATE ROLE SERVICE
 * Creates new role with assigned permissions
 * Core component of Role-Based Access Control (RBAC) system
 * Establishes role-permission relationships in a single transaction
 * @param {string} name - Unique role name (e.g., "admin", "user", "moderator")
 * @param {Array<number>} permissions - Array of permission IDs to assign to this role
 * @returns {Object} - Created role object with permission relationships
 */
const createRole = async (name, permissions) => {
	// Create role and assign permissions in a single database transaction
	const role = await prisma.role.create({
		data: {
			name,                    // Role name (should be unique)
			permissions: {           // Nested creation of role-permission relationships
				create: permissions.map((permissionId) => ({ permissionId })),
				// This creates entries in the role_permissions junction table
				// Each permission ID becomes a separate relationship record
				// Example: permissions = [1, 2, 3] creates 3 role_permission records
			},
		},
	});
	// Transaction ensures atomicity: either role and all permissions are created, or nothing
	// Prevents orphaned roles without permissions or partial permission assignments

	return role;
	// Returns the created role object (without populated permissions)
	// To get role with permissions, would need to include them in the query
};

/**
 * ASSIGN ROLE TO USER SERVICE
 * Links a user to a specific role
 * Grants user all permissions associated with that role
 * Supports multiple roles per user through separate assignments
 * @param {number} userId - User's database ID
 * @param {number} roleId - Role's database ID to assign
 * @returns {Object} - Created user-role relationship object
 */
const assignRoleToUser = async (userId, roleId) => {
	// Create user-role relationship in junction table
	return prisma.userRole.create({
		data: { userId, roleId },
	});
	// This establishes the many-to-many relationship between users and roles
	// User inherits all permissions from the assigned role
	// Multiple roles can be assigned to same user by calling this function multiple times
	// 
	// Example usage:
	// - assignRoleToUser(1, 2) // Assign role ID 2 to user ID 1
	// - User 1 now has all permissions from role 2
	// 
	// Note: Should validate that both userId and roleId exist before assignment
	// Consider adding duplicate assignment checks to prevent redundant records
};

/**
 * GET ALL ROLES SERVICE
 * Retrieves all roles with their associated permissions
 * Used for admin dashboard role management and system overview
 * Provides complete role-permission mapping for RBAC administration
 * @returns {Array} - Array of role objects with populated permission details
 */
const getRoles = async () => {
	// Fetch all roles with nested permission data
	return prisma.role.findMany({
		include: { 
			permissions: {           // Include role-permission relationships
				include: { 
					permission: true // Include actual permission details (name, description)
				} 
			} 
		},
	});
	// Returns structure like:
	// [
	//   {
	//     id: 1,
	//     name: "admin",
	//     permissions: [
	//       {
	//         permissionId: 1,
	//         permission: { id: 1, name: "user:create", description: "Create users" }
	//       },
	//       {
	//         permissionId: 2,
	//         permission: { id: 2, name: "user:delete", description: "Delete users" }
	//       }
	//     ]
	//   }
	// ]
	//
	// Used for:
	// - Admin dashboard role listing
	// - Role editing interfaces
	// - Permission audit and review
	// - System access control visualization
};

// Export all role service functions for use in controllers
module.exports = {
	createRole,        // Create new roles with permission assignments
	assignRoleToUser,  // Link users to roles for access control
	getRoles,          // Retrieve all roles with permission details
};
