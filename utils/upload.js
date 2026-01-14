const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "users",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "center" },
    ],
  },
});

const workspaceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "workspaces",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "center" },
    ],
  },
});

const upload = multer({ storage });

module.exports = { upload };
