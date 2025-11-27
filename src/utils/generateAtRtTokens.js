import { User } from "../models/user.models.js";
import { apiError } from "./apiError.js";

const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new apiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Failed to generate tokens:", error.message);
    throw new apiError(500, "Failed to generate tokens");
  }
};

export { generateAccessRefreshToken };
