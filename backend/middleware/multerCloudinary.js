import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// cloudinary.v2.config({
//   cloud_name: process.env.cloudinary_name,
//   api_key: process.env.cloudinary_api_key,
//   api_secret: process.env.cloudinary_api_secret
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary.v2,
//   params: {
//     folder: 'school-eassistant',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
//   },
// });

const storage = multer.memoryStorage()

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

export default upload;