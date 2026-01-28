import cloudinary from "../lib/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const storage = new CloudinaryStorage({
    cloudinary,
    folder: "avatars",
    allowedFormats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "fill" }]
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
});