import express from "express";
import { getAllUsers, loginUser, registerUser } from "../controllers/userController.js";
import { refreshToken } from "../controllers/refreshToken.js";

const router = express.Router();

router.get("/api/token",refreshToken)
router.get("/api/users",getAllUsers)
router.post("/api/users/register", registerUser);
router.post("/api/users/login", loginUser);

export default router;
