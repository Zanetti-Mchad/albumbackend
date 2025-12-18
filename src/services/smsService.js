const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

// Initialize Twilio client if credentials are provided
if (accountSid && authToken) {
	client = twilio(accountSid, authToken);
}

const sendSMS = async (to, text) => {
	try {
		// If Twilio is not configured, fall back to console logging
		if (!client || !twilioPhoneNumber) {
			console.log(`[SMS MOCK] Sending SMS to: ${to}`);
			console.log(`[SMS MOCK] Text: ${text}`);
			console.log(`[SMS MOCK] Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER for real SMS delivery`);
			return { success: true, mock: true };
		}

		// Format phone number to E.164 format if needed
		const formattedTo = formatPhoneNumber(to);
		
		// Send SMS via Twilio
		const message = await client.messages.create({
			body: text,
			from: twilioPhoneNumber,
			to: formattedTo,
		});

		console.log(`[SMS SUCCESS] Message sent to ${formattedTo}, SID: ${message.sid}`);
		
		return {
			success: true,
			messageId: message.sid,
			status: message.status,
			to: formattedTo
		};

	} catch (error) {
		console.error(`[SMS ERROR] Failed to send SMS to ${to}:`, error.message);
		
		// Return error details for handling
		return {
			success: false,
			error: error.message,
			code: error.code || 'SMS_SEND_FAILED'
		};

	}
};

// Helper function to format phone number to E.164 format
const formatPhoneNumber = (phoneNumber) => {
	// Remove all non-digit characters
	const cleaned = phoneNumber.replace(/\D/g, '');
	
	// If number doesn't start with country code, assume it's a local number
	// You may need to adjust this based on your target market
	if (!cleaned.startsWith('1') && !cleaned.startsWith('234') && !cleaned.startsWith('254')) {
		// Add default country code (adjust as needed)
		// Example: For US numbers, prepend '1'
		// For Nigeria, prepend '234'
		// For Kenya, prepend '254'
		return `+1${cleaned}`;
	}
	
	return `+${cleaned}`;
};

// Function to send bulk SMS (useful for notifications)
const sendBulkSMS = async (recipients, text) => {
	const results = [];
	
	for (const recipient of recipients) {
		const result = await sendSMS(recipient, text);
		results.push({
			recipient,
			...result
		});
		
		// Add small delay to avoid rate limiting
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	
	return results;
};

// Function to send templated SMS with variables
const sendTemplatedSMS = async (to, template, variables = {}) => {
	let message = template;
	
	// Replace variables in template
	Object.keys(variables).forEach(key => {
		const placeholder = `{{${key}}}`;
		message = message.replace(new RegExp(placeholder, 'g'), variables[key]);
	});
	
	return await sendSMS(to, message);
};

module.exports = {
	sendSMS,
	sendBulkSMS,
	sendTemplatedSMS,
};
