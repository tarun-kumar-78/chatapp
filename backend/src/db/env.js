import dotenv from "dotenv";
dotenv.config();

export const { PORT, MONGO_DB_URI, JWT_SECRET, NODE_ENV, COUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, REFRESH_TOKEN_SECRET } = process.env;
