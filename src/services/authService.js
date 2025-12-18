const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { sendVerificationEmail, sendEmail, sendPasswordResetEmail, sendSimpleOTPEmail } = require("./emailService");
// SMS only for password reset OTP
// const { sendSMS, sendTemplatedSMS } = require("./smsService-africastalking");

/**
 * USER REGISTRATION SERVICE
 * Creates new user account with email verification
 * Sends simple OTP email for verification (6-digit code)
 * @param {string} email - User's email address
 * @param {string} password - Plain text password (will be hashed)
 * @param {string} name - User's full name
 * @param {string} phone - User's phone number
 * @returns {Object} - Created user object
 */
const register = async (email, password, name, phone) => {
	// Check if user already exists by email
	const existingUser = await prisma.user.findUnique({ where: { email } });
	if (existingUser) {
		throw new Error("User already exists");
	}

	// Check if user already exists by phone number
	const existingUserByPhone = await prisma.user.findUnique({
		where: { phone },
	});
	if (existingUserByPhone) {
		throw new Error("User already exists");
	}

	// Hash password with salt rounds of 10 for security
	const hashedPassword = await bcrypt.hash(password, 10);

	// Create new user in database
	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			phone,
			name,
			isActive: true,           // User is active by default
			emailVerified: false,     // Email needs verification
		},
	});

	// Generate 6-digit OTP for email verification
	const token = await generateEmailVerificationToken(user.id);

	// Send simple OTP email for verification (like SMS format)
	const emailResult = await sendSimpleOTPEmail(email, token, "email verification");
	
	// Log email delivery status for debugging
	if (!emailResult.success) {
		console.error(`Failed to send verification email to ${email}:`, emailResult.error);
	}

	return user;
};

/**
 * EMAIL VERIFICATION TOKEN GENERATOR
 * Creates 6-digit OTP for email verification
 * Stores token in database with 5-minute expiry
 * @param {number} userId - User's database ID
 * @returns {string} - 6-digit OTP token
 */
const generateEmailVerificationToken = async (userId) => {
	// Legacy code (commented out): Used long hex tokens
	/**const token = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Token valid for 1 hour

	// Save the token in the database
	await prisma.emailVerificationToken.create({
		data: {
			userId,
			token,
			expiresAt,
		},
	});**/
	
	// Current implementation: Generate 6-digit OTP (100000-999999)
	const token = crypto.randomInt(100000, 999999).toString();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

	// Debug: log OTP for email verification
	console.log(`[OTP][EmailVerification] userId=${userId} token=${token} expiresAt=${expiresAt.toISOString()}`);

	// Store OTP in database with expiry time
	await prisma.emailVerificationToken.create({
		data: {
			userId,
			token,
			expiresAt,
		},
	});

	return token;
};

/**
 * EMAIL VERIFICATION SERVICE
 * Verifies 6-digit OTP and activates user account
 * Deletes token after successful verification
 * @param {string} token - 6-digit OTP from user
 * @returns {Object} - Verified user object
 */
const verifyEmailToken = async (token) => {
	// Find the verification token in database with user data
	const verificationToken = await prisma.emailVerificationToken.findUnique({
		where: { token },
		include: { user: true },
	});

	// Check if token exists and is not expired
	if (!verificationToken || verificationToken.expiresAt < new Date()) {
		throw new Error("Invalid or expired token");
	}

	// Mark user's email as verified
	await prisma.user.update({
		where: { id: verificationToken.userId },
		data: { emailVerified: true },
	});

	// Clean up: Delete the token after successful verification
	await prisma.emailVerificationToken.delete({ where: { token } });

	return verificationToken.user;
};

/**
 * USER LOGIN SERVICE
 * Validates user credentials (email/phone + password)
 * Supports login with either email or phone number
 * @param {string} identifier - Email address or phone number
 * @param {string} password - Plain text password
 * @returns {Object} - Authenticated user object with role information
 */
const login = async (identifier, password) => {
	// Determine if identifier is email or phone using regex
	const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

	// Find user by email or phone number
	const user = await prisma.user.findUnique({
		where: isEmail ? { email: identifier } : { phone: identifier }
	});

	// Check if user exists
	if (!user) {
		throw new Error("Invalid login credentials");
	}

	// Verify password using bcrypt comparison
	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		throw new Error("Invalid login credentials");
	}

	// Check if user is active instead of hasAccess (which doesn't exist in the schema)
	if (!user.isActive) {
		throw new Error("Account is deactivated");
	}

	// If user has no role, assign default role
	if (!user.role) {
		// Update user with default role
		await prisma.user.update({
			where: { id: user.id },
			data: { role: "user" }
		});
		// Fetch the updated user
		const updatedUser = await prisma.user.findUnique({
			where: { id: user.id }
		});
		return updatedUser;
	}

	return user;
};

/**
 * OTP GENERATION SERVICE
 * Creates 6-digit OTP for login verification
 * Stores OTP in user record with 5-minute expiry
 * @param {number} userId - User's database ID
 * @returns {string} - 6-digit OTP
 */
const generateOtp = async (userId) => {
	// Generate random 6-digit OTP (100000-999999)
	const otp = crypto.randomInt(100000, 999999).toString();
	const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

	// Debug: log OTP for login
	console.log(`[OTP][Login] userId=${userId} otp=${otp} expiresAt=${otpExpiresAt.toISOString()}`);

	// Store OTP and expiry time in user record
	await prisma.user.update({
		where: { id: userId },
		data: { otp, otpExpiresAt },
	});

	return otp;
};

/**
 * OTP VERIFICATION SERVICE
 * Verifies login OTP and generates authentication tokens
 * Clears OTP after successful verification
 * @param {number} userId - User's database ID
 * @param {string} otp - 6-digit OTP from user
 * @returns {Object} - Access token, refresh token, and user data
 */
const verifyOtp = async (userId, otp) => {
	// Find user and check OTP validity
	const user = await prisma.user.findUnique({ where: { id: userId } });

	// Validate OTP and expiry time
	if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
		throw new Error("Invalid or expired OTP");
	}

	// Clear OTP after successful verification (security measure)
	await prisma.user.update({
		where: { id: userId },
		data: { otp: null, otpExpiresAt: null },
	});

	// Legacy role/permission system (commented out)
	// Currently simplified without role-based access control
	/**const rolesWithPermissions = await prisma.userRole.findMany({
		where: { userId },
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
	});

	const roles = rolesWithPermissions.map((roleWithPerm) => ({
		role_name: roleWithPerm.role.name,
		permissions: roleWithPerm.role.permissions.map((rp) => rp.permission.name),
	}));

	const permissions = roles.flatMap((role) => role.permissions);**/

	// Generate JWT access token (23 hours expiry)
	const accessToken = await generateAccessToken(userId);

	// Generate JWT refresh token (7 days expiry)
	const refreshToken = jwt.sign(
		{
			id: user.id,
			email: user.email,
		},
		process.env.JWT_REFRESH_SECRET,
		{ expiresIn: "7d" } // Refresh token expires in 7 days
	);

	return { accessToken, refreshToken, user };
};

/**
 * ACCESS TOKEN GENERATOR
 * Creates JWT access token with user information
 * Token expires in 23 hours for security
 * @param {number} userId - User's database ID
 * @returns {string} - JWT access token
 */
const generateAccessToken = async (userId) => {
	// Fetch current user data
	const user = await prisma.user.findUnique({ where: { id: userId } });

	if (!user) {
		throw new Error("User not found");
	}

	// Create JWT with user information
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			isActive: user.isActive,
		},
		process.env.JWT_SECRET,
		{ expiresIn: "23h" } // Access token expires in 23 hours
	);
};

/**
 * PASSWORD RESET REQUEST (EMAIL)
 * Sends password reset OTP via email
 * Uses simple OTP format (6-digit code) instead of long tokens
 * @param {string} email - User's email address
 * @param {string} frontendUrl - Frontend URL (optional, not used in current implementation)
 * @returns {Object} - Success message, OTP, and expiry time
 */
const requestPasswordReset = async (email, frontendUrl = null) => {
	// Find user by email
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		throw new Error("User not found");
	}

	// Generate 6-digit OTP instead of long token for consistency
	const token = crypto.randomInt(100000, 999999).toString();
	const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Token valid for 30 minutes

	// Debug: log OTP for password reset via email
	console.log(`[OTP][PasswordReset][Email] email=${email} token=${token} expiresAt=${expiresAt.toISOString()}`);

	// Store reset token in database
	await prisma.passwordResetToken.create({
		data: { token, userId: user.id, expiresAt },
	});

	// Send simple OTP email for password reset (consistent with SMS format)
	const emailResult = await sendSimpleOTPEmail(user.email, token, "password reset");

	// Handle email delivery errors
	if (!emailResult.success) {
		console.error(`Failed to send password reset email to ${user.email}:`, emailResult.error);
		throw new Error("Failed to send email. Please try again.");
	}

	console.log(`Password reset email sent successfully to ${user.email}`);
	
	// Return OTP in response just like we do with SMS
	// This makes the frontend handling consistent between email and phone
	return { 
		message: "Password reset email sent",
		otp: token,  // Include OTP in response for frontend verification
		expiresAt: expiresAt.getTime() // Send expiry timestamp for frontend
	};
};

/**
 * PASSWORD RESET REQUEST (SMS)
 * Sends password reset OTP via SMS using EgoSMS
 * Returns OTP in response for frontend fallback
 * @param {string} phone - User's phone number
 * @returns {Object} - Success message and OTP for frontend
 */
const requestPasswordResetOTP = async (phone) => {
	// Normalize common phone formats to stored form
	const raw = (phone ?? "").toString().trim();
	const candidates = new Set([raw]);
	// Uganda example formats: 078..., +25678..., 25678...
	if (/^\+?256/.test(raw)) {
		candidates.add(raw.replace(/^\+?256/, "0"));
	}
	if (/^0\d{9}$/.test(raw)) {
		candidates.add(raw.replace(/^0/, "+256"));
		candidates.add(raw.replace(/^0/, "256"));
	}

	// Try to find a user by any candidate format
	let user = null;
	for (const candidate of candidates) {
		user = await prisma.user.findFirst({ where: { phone: candidate } });
		if (user) break;
	}
	if (!user) {
		throw new Error("User not found");
	}

	// Generate 6-digit OTP for SMS
	const token = crypto.randomInt(100000, 999999).toString();
	const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Token valid for 30 minutes

	// Debug: log OTP for password reset via SMS
	console.log(`[OTP][PasswordReset][SMS] phone=${phone} token=${token} expiresAt=${expiresAt.toISOString()}`);

	// Store reset token in database
	await prisma.passwordResetToken.create({
		data: { token, userId: user.id, expiresAt },
	});

	// Return OTP in response for frontend (EgoSMS)
	return { 
		message: "Password reset OTP generated",
		otp: token, // Include OTP in response for frontend
		expiresAt: expiresAt.getTime() // Send expiry timestamp for frontend
	};
};

/**
 * PASSWORD RESET EXECUTION
 * Resets user password using OTP token
 * Works for both email OTP and SMS OTP
 * @param {string} token - 6-digit OTP from user
 * @param {string} newPassword - New plain text password
 * @returns {string} - Success message
 */
const resetPassword = async (token, newPassword) => {
	// Find reset token with user data
	const resetToken = await prisma.passwordResetToken.findUnique({
		where: { token },
		include: { user: true },
	});

	// Validate token and expiry
	if (!resetToken || resetToken.expiresAt < new Date()) {
		throw new Error("Invalid or expired token");
	}

	// Hash new password with bcrypt
	const hashedPassword = await bcrypt.hash(newPassword, 10);

	// Update user password
	await prisma.user.update({
		where: { id: resetToken.userId },
		data: { password: hashedPassword },
	});

	// Clean up: Delete the reset token after successful password reset
	await prisma.passwordResetToken.delete({ where: { token } });

	return "Password reset successfully";
};

/**
 * USER PROFILE UPDATE SERVICE
 * Updates user profile information with validation
 * Prevents duplicate email addresses
 * @param {number} userId - User's database ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Object} - Updated user object
 */
const updateUserDetails = async (userId, updates) => {
	// Extract email separately for validation
	const { email, ...otherUpdates } = updates;

	// Check if email is being updated and ensure uniqueness
	if (email) {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser && existingUser.id !== userId) {
			throw new Error("Email is already in use");
		}
	}

	// Update user profile in database
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			...otherUpdates,
			email,
		},
	});

	return updatedUser;
};

/**
 * ADMIN USER CREATION SERVICE
 * Creates user account with extensive profile information
 * Used for admin/staff user creation with detailed fields
 * @param {string} email - User's email address
 * @param {string} phone - User's phone number
 * @param {string} role - User's role/position
 * @param {string} password - Optional password (generates random if not provided)
 * @param {...string} Additional profile fields (name, address, salary, etc.)
 * @returns {Object} - Success status and user data
 */
const addUser = async (
	email,
	phone,
	role,
	password,
	first_name,
	last_name,
	middle_name,
	initials,
	address,
	salary,
	utility,
	gender,
	date_joined,
	name_of_bank,
	account_number,
	mobile_money_number,
	registered_name,
	staff_photo,
	section,
	hasAccess
) => {
	// Check for existing user by email
	const existingUser = await prisma.user.findUnique({ where: { email } });
	if (existingUser) {
		return { success: false, msg: "Email is already in use" };
	}

	// Check for existing user by phone
	const existingUserByPhone = await prisma.user.findUnique({
		where: { phone },
	});
	if (existingUserByPhone) {
		return { success: false, msg: "Phone number is already in use" };
	}

	// Generate random password if not provided
	let hashedPassword = await bcrypt.hash(generateRandomPassword(), 10);

	// Use provided password if available
	if (password) {
		hashedPassword = await bcrypt.hash(password, 10);
	}

	// Create comprehensive user profile
	const user = await prisma.user.create({
		data: {
			email,
			first_name,
			last_name,
			middle_name,
			initials,
			phone,
			password: hashedPassword,
			role,
			address,
			salary: String(salary || ''),
			utility: String(utility || ''),
			gender,
			date_joined,
			name_of_bank,
			account_number,
			mobile_money_number,
			registered_name,
			staff_photo,
			section,
			hasAccess,
		},
	});

	// Generate verification token
	const token = await generateEmailVerificationToken(user.id);

	// Return token in response for frontend (EgoSMS)
	return { success: true, data: user, token: token }; // Include token in response for frontend
};

/**
 * RANDOM PASSWORD GENERATOR
 * Creates secure random password with mixed characters
 * Used when admin creates user without specifying password
 * @param {number} length - Password length (default: 12)
 * @returns {string} - Random password
 */
function generateRandomPassword(length = 12) {
	// Character set including letters, numbers, and special characters
	const charset =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*()=+";
	let password = "";
	
	// Generate random password character by character
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		password += charset[randomIndex];
	}
	return password;
}

// Export all authentication service functions
module.exports = {
	register,                    // User registration with email verification
	login,                       // User login with credential validation
	generateEmailVerificationToken, // Email verification token generation
	verifyEmailToken,            // Email verification process
	generateOtp,                 // Login OTP generation
	verifyOtp,                   // Login OTP verification
	requestPasswordReset,        // Password reset via email
	requestPasswordResetOTP,     // Password reset via SMS
	resetPassword,               // Password reset execution
	updateUserDetails,           // User profile updates
	generateAccessToken,         // JWT access token generation
	addUser,                     // Admin user creation
};
