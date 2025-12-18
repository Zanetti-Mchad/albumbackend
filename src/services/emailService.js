// Import nodemailer for email functionality
const nodemailer = require('nodemailer');

// Global email transporter variable - will be configured based on environment
let transporter;

/**
 * EMAIL TRANSPORTER INITIALIZATION
 * Configures email service based on available environment variables
 * Supports multiple email providers with fallback options
 */

// Primary configuration: Custom SMTP server (Gmail, Outlook, etc.)
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
	transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,           // SMTP server (smtp.gmail.com)
		port: process.env.EMAIL_PORT || 587,   // SMTP port (587 for TLS, 465 for SSL)
		secure: process.env.EMAIL_PORT == 465, // SSL for port 465, TLS for others
		auth: {
			user: process.env.EMAIL_USER,       // Email address (mahadnyanzi@gmail.com)
			pass: process.env.EMAIL_PASS,       // App password (pgxl afdb xqxz prgs)
		},
	});
} else if (process.env.SENDGRID_API_KEY) {
	// Alternative configuration: SendGrid email service
	transporter = nodemailer.createTransport({
		service: 'SendGrid',                    // SendGrid service
		auth: {
			user: 'apikey',                     // SendGrid requires 'apikey' as username
			pass: process.env.SENDGRID_API_KEY, // SendGrid API key
		},
	});
}
// If no email configuration found, transporter remains undefined (fallback to console logging)

/**
 * CORE EMAIL SENDING FUNCTION
 * Handles actual email delivery with error handling and fallback
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} body - HTML email body content
 * @returns {Object} - Success/failure status with details
 */
const sendEmail = async (to, subject, body) => {
	try {
		// Fallback: If no email service configured, log to console (development mode)
		if (!transporter) {
			console.log(`[EMAIL MOCK] Sending email to: ${to}`);
			console.log(`[EMAIL MOCK] Subject: ${subject}`);
			console.log(`[EMAIL MOCK] Body: ${body}`);
			console.log(`[EMAIL MOCK] Configure EMAIL_HOST, EMAIL_USER, EMAIL_PASS or SENDGRID_API_KEY for real email delivery`);
			return { success: true, mock: true };
		}

		// Configure email options
		const mailOptions = {
			from: `"${process.env.EMAIL_FROM_NAME || 'Qualiworth Hike'}" <${process.env.EMAIL_USER}>`, // Sender info
			to: to,           // Recipient email
			subject: subject, // Email subject
			html: body,       // HTML email content
		};

		// Send email using configured transporter
		const info = await transporter.sendMail(mailOptions);
		
		// Log successful delivery
		console.log(`[EMAIL SUCCESS] Email sent to ${to}, MessageId: ${info.messageId}`);
		
		// Return success response with delivery details
		return {
			success: true,
			messageId: info.messageId,  // Unique message ID from email provider
			response: info.response     // Provider response details
		};

	} catch (error) {
		// Log email delivery failure
		console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
		
		// Return error response
		return {
			success: false,
			error: error.message,
			code: error.code || 'EMAIL_SEND_FAILED'
		};
	}
};

/**
 * EMAIL VERIFICATION FUNCTION
 * Sends beautiful HTML email for account verification
 * Used during user registration process
 * @param {string} email - User's email address
 * @param {string} token - 6-digit verification OTP
 * @returns {Object} - Email delivery status
 */
const sendVerificationEmail = async (email, token) => {
	// Generate verification link for frontend
	const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sign-in/verify-email?token=${token}`;
	const subject = "Verify Your Email Address - Qualiworth Hike";
	
	// HTML email template with styling
	const body = `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				/* Email styling for better presentation */
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
				.content { padding: 20px; background-color: #f9f9f9; }
				.button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<!-- Email header with branding -->
				<div class="header">
					<h1>Welcome to Qualiworth Hike!</h1>
				</div>
				<!-- Main email content -->
				<div class="content">
					<h2>Verify Your Email Address</h2>
					<p>Thank you for registering with Qualiworth Hike. To complete your registration, please verify your email address by clicking the button below:</p>
					
					<!-- Verification button -->
					<div style="text-align: center;">
						<a href="${verificationLink}" class="button">Verify Email Address</a>
					</div>
					
					<!-- Alternative verification link -->
					<p>Or copy and paste this link into your browser:</p>
					<p style="word-break: break-all; background-color: #eee; padding: 10px;">${verificationLink}</p>
					
					<!-- Manual OTP code -->
					<p><strong>Your verification code is: ${token}</strong></p>
					
					<!-- Security notice -->
					<p>This verification link will expire in 5 minutes for security reasons.</p>
					
					<!-- Security disclaimer -->
					<p>If you didn't create an account with us, please ignore this email.</p>
				</div>
				<!-- Email footer -->
				<div class="footer">
					<p>&copy; 2024 Qualiworth Hike. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`;

	// Send the verification email
	return await sendEmail(email, subject, body);
};

/**
 * PASSWORD RESET EMAIL FUNCTION
 * Sends password reset link via email
 * Used when user requests password reset via email
 * @param {string} email - User's email address
 * @param {string} resetLink - Password reset URL with token
 * @returns {Object} - Email delivery status
 */
const sendPasswordResetEmail = async (email, resetLink) => {
	const subject = "Password Reset Request - Qualiworth Hike";
	
	// HTML email template with red theme for security alerts
	const body = `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				/* Email styling with red theme for security */
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #FF6B6B; color: white; padding: 20px; text-align: center; }
				.content { padding: 20px; background-color: #f9f9f9; }
				.button { display: inline-block; padding: 12px 24px; background-color: #FF6B6B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<!-- Security-themed header -->
				<div class="header">
					<h1>Password Reset Request</h1>
				</div>
				<!-- Main content -->
				<div class="content">
					<h2>Reset Your Password</h2>
					<p>We received a request to reset your password for your Qualiworth Hike account.</p>
					
					<!-- Reset button -->
					<div style="text-align: center;">
						<a href="${resetLink}" class="button">Reset Password</a>
					</div>
					
					<!-- Alternative reset link -->
					<p>Or copy and paste this link into your browser:</p>
					<p style="word-break: break-all; background-color: #eee; padding: 10px;">${resetLink}</p>
					
					<!-- Security notice -->
					<p>This password reset link will expire in 30 minutes for security reasons.</p>
					
					<!-- Security disclaimer -->
					<p><strong>If you didn't request this password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
				</div>
				<!-- Footer -->
				<div class="footer">
					<p>&copy; 2024 Qualiworth Hike. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`;

	// Send the password reset email
	return await sendEmail(email, subject, body);
};

/**
 * LOGIN OTP EMAIL FUNCTION (LEGACY)
 * Sends styled HTML email with OTP for login verification
 * Note: Currently replaced by sendSimpleOTPEmail for consistency
 * @param {string} email - User's email address
 * @param {string} otp - 6-digit login OTP
 * @returns {Object} - Email delivery status
 */
const sendLoginOTPEmail = async (email, otp) => {
	const subject = "Your Login OTP - Qualiworth Hike";
	
	// HTML email template with blue theme for login
	const body = `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				/* Email styling with blue theme for login */
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
				.content { padding: 20px; background-color: #f9f9f9; }
				.otp-code { font-size: 32px; font-weight: bold; text-align: center; background-color: #2196F3; color: white; padding: 20px; margin: 20px 0; border-radius: 10px; letter-spacing: 5px; }
				.footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<!-- Login-themed header -->
				<div class="header">
					<h1>Login Verification</h1>
				</div>
				<!-- Main content -->
				<div class="content">
					<h2>Your Login OTP Code</h2>
					<p>Use the following One-Time Password (OTP) to complete your login:</p>
					
					<!-- Large, prominent OTP display -->
					<div class="otp-code">${otp}</div>
					
					<!-- Security notice -->
					<p><strong>This OTP will expire in 5 minutes</strong> for security reasons.</p>
					
					<!-- Security disclaimer -->
					<p>If you didn't attempt to log in, please ignore this email and consider changing your password.</p>
				</div>
				<!-- Footer -->
				<div class="footer">
					<p>&copy; 2024 Qualiworth Hike. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`;

	// Send the login OTP email
	return await sendEmail(email, subject, body);
};

/**
 * SIMPLE OTP EMAIL FUNCTION (CURRENT STANDARD)
 * Sends plain text OTP email similar to SMS format
 * Used for login, registration, and password reset OTPs
 * Provides consistent user experience across email and SMS
 * @param {string} email - User's email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} purpose - Purpose of OTP (login, registration, password reset)
 * @returns {Object} - Email delivery status
 */
const sendSimpleOTPEmail = async (email, otp, purpose = "login") => {
	const subject = `Your ${purpose} OTP - Qualiworth Hike`;
	
	// Simple plain text message like SMS format
	// Keeps consistency between email and SMS delivery
	const body = `Your ${purpose} OTP is: ${otp}. This code expires in 5 minutes.`;

	// Send the simple OTP email
	return await sendEmail(email, subject, body);
};

// Export all email functions for use in other services
module.exports = {
	sendEmail,              // Core email sending function
	sendVerificationEmail,  // Account verification (registration)
	sendPasswordResetEmail, // Password reset via email link
	sendLoginOTPEmail,      // Login OTP (legacy, styled HTML)
	sendSimpleOTPEmail,     // Simple OTP (current standard, SMS-like)
};
