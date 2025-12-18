const { IncomingForm } = require("formidable");
const path = require("path");
const fs = require("fs");

// Parses multipart/form-data and normalizes files into req.files.files[]
// Each file has: filepath, originalFilename, mimetype, size
module.exports = function formidableUpload() {
  return (req, res, next) => {
    if (!req.headers["content-type"] || !req.headers["content-type"].includes("multipart/form-data")) {
      return next();
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form = new IncomingForm({
      multiples: true,
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return next(err);

      // Normalize to req.body and req.files.files
      req.body = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

      const incoming = files.files || files.file || files.media || null;
      const asArray = Array.isArray(incoming) ? incoming : incoming ? [incoming] : [];
      req.files = { files: asArray.map(f => ({
        filepath: f.filepath || f.path,
        originalFilename: f.originalFilename || f.name,
        mimetype: f.mimetype || f.type,
        size: f.size,
      })) };

      next();
    });
  };
}


