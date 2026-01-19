import { v2 as cloudinary } from 'cloudinary';
import { COUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '../db/env.js';

cloudinary.config({
    cloud_name: COUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

export default cloudinary;