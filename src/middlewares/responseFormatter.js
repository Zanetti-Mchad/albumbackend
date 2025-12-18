// src/middleware/responseFormatter.js
const responseFormatter = (req, res, next) => {
	res.success = (message = "SUCCESS", data = null) => {
		const response = {
			status: {
				returnCode: "00",
				returnMessage: message,
			},
		};

		if (data) response.data = data;

		res.status(200).json(response);
	};

	res.error = (errorCode, errorMessageKey) => {
		res.status(200).json({
			status: {
				returnCode: errorCode,
				returnMessage: errorMessageKey,
			},
		});
	};

	function extractPrismaError(error) {
		if (error.code === "P2002") {
			return `Unique constraint failed on field: ${
				error.meta?.target || "unknown field"
			}`;
		}

		if (error.code === "P2003") {
			return `Foreign key constraint failed on field: ${
				error.meta?.field_name || "unknown field"
			}`;
		}

		if (error.code === "P2000") {
			return `Value is too long for field: ${
				error.meta?.column_name || "unknown field"
			}`;
		}

		if (error.code === "P2025") {
			return `Record not found: ${error.meta?.cause || "Unknown reason"}`;
		}

		const match = error.message.match(/Invalid value for argument `.*?`: (.*)/);
		if (match) {
			return match[1];
		}

		return error.message || "An unknown error occurred";
	}

	res.dbError = (msg) => {
		const error = extractPrismaError(msg);
		res.status(200).json({
			status: {
				returnCode: 400,
				returnMessage: error,
			},
		});
	};

	next();
};

module.exports = responseFormatter;
