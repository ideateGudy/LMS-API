import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "assignment_submissions",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "pdf",
      "docx",
      "pptx",
      "zip",
      "xls",
      "xlsx",
    ],
    public_id: (req, file) => {
      const nameWithoutExt = path.parse(file.originalname).name;
      return `${Date.now()}-${nameWithoutExt}`;
    },
  },
});

export default cloudinary;
