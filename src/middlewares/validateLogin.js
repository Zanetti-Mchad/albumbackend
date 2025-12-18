const { check, validationResult } = require("express-validator");

// Helper function to format API responses consistently
const formatResponse = (statusCode, message, data = null) => ({
	status: { returnCode: statusCode, returnMessage: message },
	...(data !== null ? { data } : {})
});

const validateLogin = [
	// Check if either email or identifier is provided
	check("password").notEmpty().withMessage("Password is required"),
	(req, res, next) => {
		// Check if either email or identifier is provided
		const { email, identifier } = req.body;
		if (!email && !identifier) {
			return res.status(400).json(
				formatResponse(400, "Email or identifier is required")
			);
		}

		// Check validation errors for password
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(
				formatResponse(400, "Validation failed", { errors: errors.array() })
			);
		}
		next();
	},
];

module.exports = { validateLogin };
