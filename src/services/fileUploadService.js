const multer = require("multer");
const path = require("path");
const fs = require("fs");

class FileUploadService {
  constructor(uploadDir = "./uploads") {
    this.uploadDir = uploadDir;
    this._initializeUploadDir();
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, this.uploadDir),
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });
  }

  _initializeUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getUploader() {
    return multer({
      storage: this.storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
          cb(null, true);
        } else {
          cb(new Error("Only .jpeg, .jpg, and .png files are allowed!"));
        }
      },
    });
  }

  handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.message });
    } else if (err) {
      res.status(400).json({ error: err.message });
    } else {
      next();
    }
  }
}

module.exports = new FileUploadService();
