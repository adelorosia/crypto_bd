import express from "express";
import {
  FollowUser,
    UnFollowUser,
    blockUser,
  changePassword,
  deleteAccount,
  editProfileInfo,
  getAllUsers,
  loginUser,
  logoutUser,
  registerUser,
  unBlockUser,
} from "../controllers/userController.js";
import { refreshToken } from "../controllers/refreshToken.js";
import { verifyToken } from "../middlewares/tokens/verifyToken.js";

const router = express.Router();

// Token
router.get("/api/token", refreshToken);

// Get All Users
router.get("/api/users", getAllUsers);

//Register And Login And Logout
router.post("/api/users/register", registerUser);
router.post("/api/users/login", loginUser);
router.delete("/api/users/logout", logoutUser);

// Follow And unFollow
router.post("/api/users/follow",verifyToken,FollowUser);
router.post("/api/users/unfollow",verifyToken,UnFollowUser);


// Block and Unblock User
router.put("/api/users/block",verifyToken,blockUser);
router.put("/api/users/unblock",verifyToken,unBlockUser);

// Change Password and Photo
router.put("/api/users/change_password",verifyToken,changePassword);
router.put("/api/users/edit_profile_info",verifyToken,editProfileInfo);

//Delete Account by Admin and User
router.delete("/api/users/delete_account",verifyToken,deleteAccount)

export default router;
