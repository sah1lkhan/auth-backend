import { Router } from "express";
import {
  logInUser,
  registerUser,
  logOutUser,
  getCurrentUser,
  refreshAccessRefreshTokens,
  updatePassword,
  updateUserDetails,
  updateAvatar,
  updateCover,
  getUserProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authVerify } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(logInUser);
router.route("/logout").post(authVerify, logOutUser);
router.route("/get-user").get(authVerify, getCurrentUser);
router.route("/refresh-tokens").post(refreshAccessRefreshTokens);
router.route("/update-password").post(authVerify, updatePassword);
router.route("/update-details").patch(authVerify, updateUserDetails);
router
  .route("/update-avatar")
  .patch(authVerify, upload.single("avatar"), updateAvatar);

router
  .route("/update-coverImage")
  .patch(authVerify, upload.single("coverImage"), updateCover);

router.route("/id/:username").get(authVerify, getUserProfile);
router.route("/watch-history").get(authVerify, getWatchHistory);

export default router;
