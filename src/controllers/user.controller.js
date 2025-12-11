import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import {
  cloudinaryUpload,
  cloudinaryDelete,
} from "../utils/cloudinaryUtils.js";
import { generateAccessRefreshToken } from "../utils/generateAtRtTokens.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "all fields are required please fill all ");
  }

  const avatarPath = req.files.avatar[0].path;

  let coverImagePath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagePath = req.files.coverImage[0].path;
  }

  if (!email.includes("@")) {
    throw new apiError(400, "@ is required in email field ");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new apiError(401, "User is already registered");
  }

  if (!avatarPath) {
    throw new apiError(400, "avatar is required ");
  }

  const avatar = await cloudinaryUpload(avatarPath);

  if (!avatar) {
    throw new apiError(400, "avatar is failed to upload ");
  }

  const coverImage = await cloudinaryUpload(coverImagePath);

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    avatar: avatar?.url,
    avatarPublicId: avatar?.public_id,
    coverImage: coverImage?.url || "",
    coverImagePublicId: coverImage?.public_id || "",
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password,-refreshToken"
  );

  if (!createdUser) {
    throw new apiError(501, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "user successfully registered "));
});

const logInUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, "Please enter username or email ");
  }

  if(email && !email.includes("@")){
    throw new apiError(400, "Enter a valid email/@");
  }

  if (!password) {
    throw new apiError(400, "Please enter the password");
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existingUser) {
    throw new apiError(400, "user not found check the credentials");
  }

  const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(401, "Password is wrong");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    existingUser._id
  );

  const cookiesOptions = { httpOnly: true, secure: true };

  const user = await User.findById(exitingUser._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new apiResponse(
        200,
        { user, refreshToken, accessToken },
        "user logged in successfully"
      )
    );
  // send tokens if in case developing a mobile app
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: null },
    },
    {
      new: true,
    }
  );
  const cookiesOptions = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", cookiesOptions)
    .clearCookie("refreshToken", cookiesOptions)
    .json(new apiResponse(200, {}, "logout Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "Current User Fetched"));
});

const refreshAccessRefreshTokens = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new apiError(401, "Unauthorized: No token provided");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new apiError(401, "Unauthorized: Invalid or expired token");
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new apiError(401, "Unauthorized: user not found");
  }

  if (incomingToken !== user.refreshToken) {
    throw new apiError(401, "Unauthorized: invalid refresh token");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        { accessToken, refreshToken },
        "Token refreshed successfully"
      )
    );
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new apiError(400, "Please Enter the credentials ");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new apiError(401, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Password is wrong please check the password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password update Successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { username, fullName, email } = req.body;
  if (!username || !fullName || !email) {
    throw new apiError(400, "Please Fill the Updated Details");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: username.toLowerCase(),
        fullName: fullName.toLowerCase(),
        email: email.toLowerCase(),
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponse(200, user, "User Details Updated Successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file.path;

  if (!avatarPath) {
    throw new apiError(500, "avatar file is needed to update avatar");
  }

  const user = await User.findById(req.user._id).select(
    "-password,-refreshToken"
  );

  if (!user) {
    throw new apiError(500, "Unauthorized : user is logged out");
  }
  const old_Public_id = user.avatarPublicId;
  console.log(old_Public_id);

  const avatar = await cloudinaryUpload(avatarPath);

  if (!avatar.url) {
    throw new apiError(500, "Failed to upload file. Please try again.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar?.url,
        avatarPublicId: avatar?.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    await cloudinaryDelete(avatar.public_id);
    throw new apiError(500, "Failed to update avatar");
  }

  if (old_Public_id) {
    await cloudinaryDelete(old_Public_id).catch(() => {});
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedUser, "avatar update successfully"));
});

const updateCover = asyncHandler(async (req, res) => {
  const coverImagePath = req.file?.path;

  if (!coverImagePath) {
    throw new apiError(500, "Cover Image not found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new apiError(500, "User not found , Login to update CoverImage");
  }

  const old_CoverImage_Id = user.coverImagePublicId;

  const coverImage = await cloudinaryUpload(coverImagePath);

  if (!coverImage) {
    throw new apiError(500, "failed to upload coverImage");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage?.url,
        coverImagePublicId: coverImage?.public_id,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    await cloudinaryDelete(coverImage.public_id);
    throw new apiError (500, "failed to update coverImage");
  }

  if (old_CoverImage_Id) {
    await cloudinaryDelete(old_CoverImage_Id);
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedUser, "CoverImage Updated Successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new apiError(500, "username not found");
  }

  const user = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribingToCount: {
          $size: "$subscribeTo",
        },
        isSubscribe: {
          $cond: {
            if: { $in: [req.user._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        avatarPublicId: 1,
        coverImage: 1,
        coverImagePath: 1,
        coverImagePublicId: 1,
        subscribersCount: 1,
        subscribingToCount: 1,
        isSubscribe: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new apiResponse(200, user[0], "Profile Fetched Successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const watchHistory = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
    {
      $project: {
        watchHistory: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new apiResponse(200, watchHistory[0], "WatchHistory Successfully Fetch")
    );
});

export {
  registerUser,
  logInUser,
  logOutUser,
  getCurrentUser,
  refreshAccessRefreshTokens,
  updatePassword,
  updateUserDetails,
  updateAvatar,
  updateCover,
  getUserProfile,
  getWatchHistory,
};
