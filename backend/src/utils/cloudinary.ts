import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import type { UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Convert buffer to base64
const bufferToBase64 = (buffer: Buffer): string => {
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
};

// Helper function for uploading buffer to Cloudinary
export const uploadToCloudinary = async (buffer: Buffer): Promise<string> => {
  try {
    const base64Image = bufferToBase64(buffer);
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'products',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true
    }) as UploadApiResponse;
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Helper function for uploading multiple buffers
export const uploadMultipleToCloudinary = async (buffers: Buffer[]): Promise<string[]> => {
  try {
    const uploadPromises = buffers.map(buffer => uploadToCloudinary(buffer));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple files upload error:', error);
    throw error;
  }
};

export default cloudinary;