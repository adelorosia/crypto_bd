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
  const { firstName, lastName, email, password, gender } = req.body;
  const userExist = await Users.findOne({ email });
  if (userExist)
    throw new Error("Oops! Looks like this email is already in our system");
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

//CHANGE PASSWORD WENN USER IST LOGIN
export const changePassword = asyncHandler(async (req, res) => {});
