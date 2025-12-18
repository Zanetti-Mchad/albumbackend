// controllers/auth.controller.js
const {
	register,
	login,
	verifyEmailToken,
	generateOtp,
	verifyOtp,
	generateAccessToken,
	requestPasswordReset,
	requestPasswordResetOTP,
	resetPassword,
	updateUserDetails,
} = require("../services/authService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { sendEmail, sendSimpleOTPEmail } = require("../services/emailService");

// Consistent API response envelope with numeric codes
const formatResponse = (statusCode, message, data = null) => ({
	status: { returnCode: statusCode, returnMessage: message },
	...(data !== null ? { data } : {})
});

// USER REGISTRATION
const registerUser = async (req, res) => {
	try {
		const { email, password, firstName, lastName, phone, role } = req.body;
		
		// Validate required fields
		if (!email || !password || !firstName) {
			return res.status(400).json(formatResponse(400, "Email, password, and firstName are required"));
		}

		// Check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: { 
				OR: [
					{ email },
					...(phone ? [{ phone }] : [])
				]
			}
		});

		if (existingUser) {
			return res.status(409).json(formatResponse(409, "User already exists"));
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Prepare user data - only include role if it's provided and not empty
		// If role is not provided, let the schema default handle it, or explicitly set to 'user'
		const userData = {
			email,
			password: hashedPassword,
			firstName,
			lastName: lastName || null,
			phone: phone || null,
			isActive: true
		};

		// Only set role if it's provided and not empty string
		if (role && role.trim() !== '') {
			userData.role = role.trim();
		}

		// Create new user
		const user = await prisma.user.create({
			data: userData
		});

		// Prepare safe user data
		const safeUser = {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			name: [user.firstName, user.lastName].filter(Boolean).join(" "),
			email: user.email,
			phone: user.phone,
			role: user.role,
			isActive: user.isActive,
			createdAt: user.createdAt
		};

		return res.status(201).json(formatResponse(201, "User registered successfully", { user: safeUser }));
	} catch (error) {
		console.error("Registration error:", error);
		return res.status(400).json(formatResponse(400, error.message));
	}
};

// EMAIL VERIFICATION (OTP)
const verifyEmail = async (req, res) => {
	try {
		const { token } = req.body;
		if (!token) {
			return res.status(400).json(formatResponse(400, "Token is required"));
		}
		const user = await verifyEmailToken(token);
		return res.status(200).json(formatResponse(200, "Email verified successfully", { user }));
	} catch (error) {
		return res.status(400).json(formatResponse(400, error.message));
	}
};

// LOGIN (email/phone + password)
const loginUser = async (req, res) => {
	try {
		const { email, identifier, password } = req.body;
		const loginIdentifier = email || identifier;
		if (!loginIdentifier || !password) {
			return res.status(400).json(formatResponse(400, "Email/identifier and password are required"));
		}

		// First find user in database
		const user = await prisma.user.findFirst({
			where: { OR: [{ email: loginIdentifier }, { phone: loginIdentifier }] }
		});
		
		if (!user) {
			return res.status(401).json(formatResponse(401, "Invalid credentials"));
		}

		// Verify password
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return res.status(401).json(formatResponse(401, "Invalid credentials"));
		}

		// Check if account is active
		if (user.isActive === false) {
			return res.status(403).json(formatResponse(403, "Account is deactivated"));
		}

		// Update last login timestamp
		await prisma.user.update({
			where: { id: user.id },
			data: { lastLogin: new Date() }
		});

		// Create a login log entry
		try {
			await prisma.log.create({
				data: {
					userId: user.id,
					action: "LOGIN",
					status: "SUCCESS",
					description: "User logged in successfully",
				},
			});
		} catch (logError) {
			console.error("Failed to create login log:", logError);
		}

		const accessToken = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		const refreshToken = jwt.sign(
			{ id: user.id, email: user.email },
			process.env.JWT_REFRESH_SECRET,
			{ expiresIn: "7d" }
		);

		// Expose tokens via headers and body
		res.set("Authorization", `Bearer ${accessToken}`);
		res.set("X-Access-Token", accessToken);
		res.set("Access-Control-Expose-Headers", "Authorization, X-Access-Token");

		const safeUser = {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			name: [user.firstName, user.lastName].filter(Boolean).join(" "),
			email: user.email,
			phone: user.phone,
			role: user.role,
			isActive: user.isActive,
			lastLogin: user.lastLogin,
			createdAt: user.createdAt
		};

		return res.status(200).json({
			...formatResponse(200, "Login successful", { user: safeUser }),
			accessToken,
			refreshToken,
			expiresIn: 3600
		});
	} catch (error) {
		console.error("Login error:", error);
		return res.status(500).json(formatResponse(500, "Internal server error"));
	}
};

// VERIFY LOGIN OTP (if you require OTP flow)
const verifyLoginOtp = async (req, res) => {
	try {
		const { identifier, otp } = req.body;
		if (!identifier || !otp) {
			return res.status(400).json(formatResponse(400, "Identifier and OTP are required"));
		}

		// Find user by identifier (email or phone)
		const user = await prisma.user.findFirst({
			where: { OR: [{ email: identifier }, { phone: identifier }] }
		});

		if (!user) {
			return res.status(400).json(formatResponse(400, "User not found"));
		}

		const { accessToken, refreshToken, roles, permissions, name } = await verifyOtp(user.id, otp);

		res.set("Authorization", `Bearer ${accessToken}`);
		res.set("X-Access-Token", accessToken);
		res.set("Access-Control-Expose-Headers", "Authorization, X-Access-Token");

		return res.status(200).json({
			...formatResponse(200, "OTP verified successfully", {
				user: { id: user.id, name, roles, permissions }
			}),
			accessToken,
			refreshToken,
			expiresIn: 3600
		});
	} catch (error) {
		console.error("Error verifying OTP:", error);
		return res.status(400).json(formatResponse(400, "Invalid or expired OTP"));
	}
};

// REFRESH TOKEN
const refreshToken = async (req, res) => {
	try {
		const { refreshToken: incomingRefresh } = req.body;
		if (!incomingRefresh) {
			return res.status(400).json(formatResponse(400, "Refresh token is required"));
		}

		const decoded = jwt.verify(incomingRefresh, process.env.JWT_REFRESH_SECRET);
		const newAccessToken = await generateAccessToken(decoded.id);

		res.set("Authorization", `Bearer ${newAccessToken}`);
		res.set("X-Access-Token", newAccessToken);
		res.set("Access-Control-Expose-Headers", "Authorization, X-Access-Token");

		return res.status(200).json({
			...formatResponse(200, "Token refreshed successfully", null),
			accessToken: newAccessToken,
			expiresIn: 3600
		});
	} catch (error) {
		console.error("Error refreshing token:", error);
		const message = error.name === "TokenExpiredError"
			? "Refresh token has expired"
			: "Invalid or malformed refresh token";
		return res.status(401).json(formatResponse(401, message));
	}
};

// REQUEST PASSWORD RESET (email or phone)
const handlePasswordResetRequest = async (req, res) => {
	try {
		const { identifier, type, baseUrl } = req.body;
		const cleanedIdentifier = (identifier ?? "").toString().trim();
		if (!identifier) {
			return res.status(400).json(formatResponse(400, "Identifier is required"));
		}

		// Use type if provided, otherwise auto-detect
		const isEmail = type === "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedIdentifier);
		const response = isEmail
			? await requestPasswordReset(cleanedIdentifier, baseUrl)
			: await requestPasswordResetOTP(cleanedIdentifier);

		return res.status(200).json(formatResponse(200, "Password reset initiated", response));
	} catch (error) {
		console.error("Password reset request error:", error);
		return res.status(400).json(formatResponse(400, "Invalid username provided"));
	}
};

// RESET PASSWORD USING OTP/TOKEN
const handleResetPassword = async (req, res) => {
	try {
		const { token, identifier, newPassword } = req.body;
		if (!token || !newPassword) {
			return res.status(400).json(formatResponse(400, "Token and newPassword are required"));
		}
		
		// Optional: Validate identifier if provided
		if (identifier) {
			const user = await prisma.user.findFirst({
				where: { OR: [{ email: identifier }, { phone: identifier }] }
			});
			if (!user) {
				return res.status(400).json(formatResponse(400, "User not found"));
			}
		}
		
		const response = await resetPassword(token, newPassword);
		return res.status(200).json(formatResponse(200, "Password reset successful", response));
	} catch (error) {
		return res.status(400).json(formatResponse(400, "Invalid or expired token provided"));
	}
};

// GET CURRENT USER PROFILE (authenticated)
const getCurrentUser = async (req, res) => {
	try {
		const userId = req.user.id;
		
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				phone: true,
				photo: true,
				role: true,
				createdAt: true,
				updatedAt: true
			}
		});

		if (!user) {
			return res.status(404).json(formatResponse(404, "User not found"));
		}

		return res.status(200).json(formatResponse(200, "User profile retrieved successfully", { user }));
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return res.status(500).json(formatResponse(500, "Internal server error"));
	}
};

// UPDATE USER PROFILE (authenticated)
const handleUpdateUserDetails = async (req, res) => {
	try {
		const userId = req.user.id;
		const updates = { ...req.body };
		delete updates.password;

		const updatedUser = await updateUserDetails(userId, updates);
		return res.status(200).json(formatResponse(200, "User details updated successfully", { user: updatedUser }));
	} catch (error) {
		return res.status(400).json(formatResponse(400, error.message));
	}
};

module.exports = {
	registerUser,
	loginUser,
	verifyEmail,
	verifyLoginOtp,
	handlePasswordResetRequest,
	handleResetPassword,
	handleUpdateUserDetails,
	getCurrentUser,
	refreshToken
};