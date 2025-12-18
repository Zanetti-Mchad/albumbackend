const prisma = require("../config/prisma");

const checkPermission = (requiredPermission) => {
	return async (req, res, next) => {
		try {
			const userId = req.user.id; // Assuming user info is added to `req` after authentication

			const userWithRoles = await prisma.user.findUnique({
				where: { id: userId },
				include: {
					roles: {
						include: {
							role: {
								include: {
									permissions: {
										include: {
											permission: true,
										},
									},
								},
							},
						},
					},
				},
			});

			if (!userWithRoles) {
				return res.error("403", "Access denied! No roles found");
			}

			const userPermissions = userWithRoles.roles
				.flatMap((userRole) => userRole.role.permissions)
				.map((permission) => permission.permission.name);

			if (!userPermissions.includes(requiredPermission)) {
				return res.error("403", "Access denied! Insufficient Permissions");
			}

			next();
		} catch (error) {
			console.error(error);
			res.error("500", "Internal server error");
		}
	};
};

module.exports = checkPermission;
