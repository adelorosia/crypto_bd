import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Users from "../models/userModel.js";

// GET ALL USERS
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const user = await Users.find();
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

// REGISTER USER
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, gender } =
    req.body;
  const userExist = await Users.findOne({ email });
  if (userExist)
    throw new Error("Oops! Looks like this email is already in our system");
  if (password !== confirmPassword) {
    throw new Error("Password and Confirm Password do not match.");
  }
  try {
    await Users.create({
      firstName,
      lastName,
      email,
      password,
      gender,
    });
    res.json("You have successfully registered.");
  } catch (error) {
    res.json(error);
  }
});

// LOGIN USER
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userFound = await Users.findOne({ email });
  if (userFound && (await userFound.isPasswordMatched(password))) {
    const {
      _id: userId,
      firstName,
      lastName,
      email,
      profile_photo: photo,
      isAdmin,
      bio,
    } = userFound;
    const accessToken = jwt.sign(
      {
        userId,
        firstName,
        lastName,
        email,
        photo,
        isAdmin,
        bio,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    const refreshToken = jwt.sign(
      {
        userId,
        firstName,
        lastName,
        email,
        photo,
        isAdmin,
        bio,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await Users.findByIdAndUpdate(userId, { refresh_token: refreshToken });
    res.cookie("token", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Incorrect username or password.");
  }
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) throw new Error("No token provided. Unable to logout.");
  const user = await Users.findOne({ refresh_token: token });
  if (!user) throw new Error("User not found. Unable to logout.");
  user.refresh_token = undefined;
  await user.save();
  res.clearCookie("token");
  res.json("Logout successful.");
});

//CHANGE PASSWORD WENN USER IST LOGIN
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await Users.findById(userId);
  if (await user.isPasswordMatched(currentPassword)) {
    if (newPassword !== confirmPassword) {
      throw new Error("Password and Confirm Password do not match.");
    }
    user.password = newPassword;
    await user.save();
    res.json("Your password has been successfully changed.");
  } else {
    res.json("Please enter your password correctly");
  }
});

//Block User
export const blockUser = asyncHandler(async (req, res) => {
  const loginUserId = req.userId;
  const targetUserId = req.body.targetUserId;
  const loginUser = await Users.findById(loginUserId);
  const targetUser = await Users.findById(targetUserId);
  if (loginUser.isAdmin) {
    await Users.findByIdAndUpdate(targetUserId, { isBlocked: true });
    res.json(
      `${
        targetUser.firstName + " " + targetUser.lastName
      } has been successfully blocked`
    );
  } else {
    res.json("You are not allowed to block this user.");
  }
});

//unBlock User
export const unBlockUser = asyncHandler(async (req, res) => {
  const loginUserId = req.userId;
  const targetUserId = req.body.targetUserId;
  const loginUser = await Users.findById(loginUserId);
  const targetUser = await Users.findById(targetUserId);
  if (loginUser.isAdmin) {
    await Users.findByIdAndUpdate(targetUserId, { isBlocked: false });
    res.json(
      `${
        targetUser.firstName + " " + targetUser.lastName
      } has been successfully unblocked`
    );
  } else {
    res.json("You are not allowed to unblock this user.");
  }
});

// Delete Account
export const deleteAccount = asyncHandler(async (req, res) => {
  const loginUserId = req.userId;
  const targetUserId = req.body.targetUserId;
  const loginUser = await Users.findById(loginUserId);
  if (loginUser.isAdmin || loginUserId === targetUserId) {
    await Users.findByIdAndDelete(targetUserId);
    res.json("Account successfully deleted.");
  } else {
    res.json("You do not have permission to delete this account.");
  }
});

// Edit User Info
export const editProfileInfo = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, gender, bio } = req.body;
    const loginUserId = req.userId;
    await Users.findByIdAndUpdate(loginUserId, {
      firstName,
      lastName,
      gender,
      bio,
    });
    res.json({ message: "Profile information updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Follow User
export const FollowUser = asyncHandler(async (req, res) => {
  const loginUserId = req.userId;
  const targetUserId = req.body.targetUserId;
  const targetUser = await Users.findById(targetUserId);
  const followers = targetUser.followers.find(
    (user) => user.toString() === loginUserId.toString()
  );
  if (followers) throw new Error("You are already following this user.");
  await Users.findByIdAndUpdate(
    targetUserId,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );
  await Users.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: targetUserId },
    },
    { new: true }
  );
  res.json("You are now following the user.");
});

// UnFollow User
export const UnFollowUser = asyncHandler(async (req, res) => {
  const loginUserId = req.userId;
  const targetUserId = req.body.targetUserId;
  const targetUser = await Users.findById(targetUserId);
  const followers = targetUser.followers.find(
    (user) => user.toString() === loginUserId.toString()
  );
  if (!followers) throw new Error("You are not following this user.");
  await Users.findByIdAndUpdate(
    targetUserId,
    {
      $pull: { followers: loginUserId },
      isFollowing: false,
    },
    { new: true }
  );
  await Users.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: targetUserId },
    },
    { new: true }
  );
  res.json("You have unfollowed the user.");
});
