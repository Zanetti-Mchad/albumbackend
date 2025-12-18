let cloudinary;
try {
  // Lazy require to avoid crashing if dependency is not installed
  cloudinary = require("cloudinary").v2;
} catch (_) {
  cloudinary = null;
}

const isConfigured = () => {
  return !!(
    cloudinary &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadFile(localPath, options = {}) {
  if (!isConfigured()) {
    // Fallback: return local path
    return { url: localPath, thumbnail: options.thumbnail || null, resource_type: null };
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(localPath, { folder: options.folder || "albums", resource_type: "auto" }, (err, result) => {
      if (err) return reject(err);
      resolve({ url: result.secure_url, thumbnail: result.secure_url, resource_type: result.resource_type, bytes: result.bytes, format: result.format, mimeType: result.resource_type });
    });
  });
}

module.exports = { uploadFile, isConfigured };


