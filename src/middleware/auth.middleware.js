import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const authVerify = asyncHandler(async function (req, res, next) {
  const acToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!acToken) {
    throw new apiError(401, "Unauthorized: No token provided/user logged Out");
  }

  let decoded;
  try {
    decoded = jwt.verify(acToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new apiError(401, "Unauthorized: Invalid or expired token");
  }

  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new apiError(401, "Unauthorized : User not Found");
  }

  req.user = user;
  next();
});

export { authVerify };
