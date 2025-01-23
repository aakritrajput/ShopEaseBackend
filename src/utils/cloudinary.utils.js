import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import ApiError from "./ApiError.utils.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath) return null;
        const image = await cloudinary.uploader.upload(filePath, {
            folder: "shopEase",
            resource_type: "auto"
        });
        fs.unlinkSync(filePath);
        return image;
    }catch(error){
        fs.unlinkSync(filePath);
        console.log(` error uploading on cloudenary ${error}`)
        return null;
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        cloudinary.uploader.destroy(publicId, function(result) { 
            console.log(result); 
        });
    } catch (error) {
        throw new ApiError(500, "unable to delete video from cloudinary")
    }
}

const deleteMultipleFiles = async (publicIds) => {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      console.log('Deleted files:', result);
      return result;
    } catch (error) {
      console.error('Error deleting files:', error);
      throw error;
    }
};

export {uploadOnCloudinary, deleteFromCloudinary, deleteMultipleFiles};