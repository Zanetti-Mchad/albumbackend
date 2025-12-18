const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authenticate = async (req, res, next) => {
	try {
		// Get the token from the Authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.error("401", "Authentication token is missing or invalid");
		}

		const token = authHeader.split(" ")[1];

		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		///console.log(decoded);

		// Find the user from the database
		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
		});

		if (!user || !user.isActive) {
			return res.error("401", "User not found or inactive");
		}

		// Attach the user and decoded token data to the request object
		req.user = {
			id: user.id,
			email: user.email,
			roles: decoded.roles || [],
			permissions: decoded.permissions || [],
		};

		// Proceed to the next middleware or route handler
		next();
	} catch (error) {
		//console.error("Authentication error:", error);

		const message =
			error.name === "TokenExpiredError"
				? "Token has expired"
				: "Invalid or malformed authentication token";

		return res.error("401", message);
	}
};

module.exports = authenticate;
