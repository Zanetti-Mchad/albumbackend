// Import Prisma ORM client for database operations
const prisma = require("../config/prisma");

/**
 * CREATE TAG SERVICE
 * Creates new tag in the system
 * Tags are used for categorization and organization of users and roles
 * Provides flexible labeling system for enhanced data management
 * @param {string} name - Tag name (e.g., "VIP", "Premium", "Department-IT", "Location-Kampala")
 * @returns {Object} - Created tag object
 */
const createTag = async (name) => {
	// Create new tag in database
	return prisma.tag.create({
		data: { name },
	});
	// Tags can be used for various purposes:
	// - User categorization: "VIP", "Premium", "Trial"
	// - Department grouping: "IT", "HR", "Finance", "Marketing"
	// - Location tagging: "Kampala", "Nairobi", "Remote"
	// - Status indicators: "Active", "Suspended", "Pending"
	// - Custom classifications: "Beta-Tester", "Early-Adopter"
};

/**
 * ASSIGN TAG TO USER SERVICE
 * Links a tag to a specific user for categorization
 * Enables user classification and filtering based on tags
 * Supports organizational and administrative grouping
 * @param {number} userId - User's database ID
 * @param {number} tagId - Tag's database ID to assign
 * @returns {Object} - Updated user object with tag relationship
 */
const assignTagToUser = async (userId, tagId) => {
	// Update user record to connect with specified tag
	return prisma.user.update({
		where: { id: userId },
		data: {
			Tag: { connect: { id: tagId } },  // Establish user-tag relationship
		},
	});
	// This creates a one-to-many relationship (one tag, many users)
	// Use cases:
	// - Mark VIP users: assignTagToUser(123, vipTagId)
	// - Department assignment: assignTagToUser(456, itDeptTagId)
	// - Location tagging: assignTagToUser(789, kampalaTagId)
	// - Status classification: assignTagToUser(101, activeTagId)
	//
	// Note: Current implementation suggests one tag per user
	// For multiple tags per user, would need many-to-many relationship
};

/**
 * ASSIGN TAG TO ROLE SERVICE
 * Links a tag to a specific role for categorization
 * Enables role classification and organizational grouping
 * Useful for role management and administrative purposes
 * @param {number} roleId - Role's database ID
 * @param {number} tagId - Tag's database ID to assign
 * @returns {Object} - Updated role object with tag relationship
 */
const assignTagToRole = async (roleId, tagId) => {
	// Update role record to connect with specified tag
	return prisma.role.update({
		where: { id: roleId },
		data: {
			Tag: { connect: { id: tagId } },  // Establish role-tag relationship
		},
	});
	// This creates a one-to-many relationship (one tag, many roles)
	// Use cases:
	// - Department roles: assignTagToRole(adminRoleId, itDeptTagId)
	// - Access level grouping: assignTagToRole(managerRoleId, seniorTagId)
	// - Location-based roles: assignTagToRole(localAdminId, kampalaTagId)
	// - Functional grouping: assignTagToRole(supportRoleId, customerServiceTagId)
	//
	// Benefits:
	// - Easier role management and filtering
	// - Organizational structure visualization
	// - Bulk operations on tagged roles
	// - Reporting and analytics by tag categories
};

/**
 * GET ALL TAGS SERVICE
 * Retrieves all tags from database with selected fields
 * Used for admin dashboard tag management and selection interfaces
 * Provides complete tag listing for assignment and management operations
 * @returns {Array} - Array of tag objects with basic information
 */
const getAllTags = async () => {
	// Fetch all tags with specific field selection
	return prisma.tag.findMany({
		select: {
			id: true,          // Tag's unique identifier
			name: true,        // Tag name/label
			createdAt: true,   // Tag creation timestamp
			updatedAt: true,   // Last update timestamp
		},
	});
	// Excludes any sensitive or unnecessary fields
	// Returns clean data structure for:
	// - Admin dashboard tag listing
	// - Tag selection dropdowns/interfaces
	// - Tag management operations
	// - System tag auditing and reporting
	//
	// Could be enhanced with:
	// - Usage counts (how many users/roles have each tag)
	// - Tag categories or hierarchies
	// - Active/inactive status filtering
	// - Search and pagination for large tag sets
};

// Export all tag service functions for use in controllers
module.exports = { 
	createTag,         // Create new tags for system categorization
	assignTagToUser,   // Link tags to users for classification
	assignTagToRole,   // Link tags to roles for organization
	getAllTags         // Retrieve all tags for management interfaces
};
