import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Users from "../models/userModel.js";


export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.token;
  if (!refreshToken) return res.sendStatus(401);
  const user = await Users.findOne({ refresh_token: refreshToken });
  if (user) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
        const {
          _id: userId,
          firstName,
          lastName,
          email,
          profile_photo: photo,
          isAdmin,
          bio,
        } = user;
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
        res.json({ accessToken });
      }
    );
  } else {
    res.sendStatus(403);
  }
});
