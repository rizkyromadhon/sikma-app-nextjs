import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

export const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err || !result) return reject(err || new Error("Upload gagal"));
        resolve(result);
      })
      .end(buffer);
  });
};
