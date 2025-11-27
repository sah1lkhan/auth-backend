import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { apiError } from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUpload = async (filePath) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    throw new apiError(500, "failed to upload file/image");
  } finally {
    try {
      if (filePath) {
        await fs.unlink(filePath).catch(() => {});
      }
    } catch (error) {
      console.log("failed to delete file ");
    }
  }
};

const cloudinaryDelete = async (fileId, type = "image") => {
  try {
    if (!fileId) return null;
    const res = await cloudinary.uploader.destroy(fileId, {
      resource_type: type,
    });
    if (res.result !== "ok" && res.result !== "not found") {
      throw new apiError(
        500,
        `failed to delete file : ${type === "raw" ? "file" : type}`
      );
    }
    return res;
  } catch (error) {
    throw new apiError(500, "failed to file/image");
  }
};

export { cloudinaryUpload, cloudinaryDelete };
