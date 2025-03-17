import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY, 
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload the file to Cloudinary with auto resource type detection.
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });
    // Remove the locally saved temporary file.
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error on Cloudinary upload:", error);
    // Remove the local file even if the upload fails.
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from Cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
