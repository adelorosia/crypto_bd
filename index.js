import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/dbConnect.js";
import userRouter from "./routes/userRouter.js";
import { errorHandler, notFound } from "./middlewares/errors/errorHandler.js";
import cookieParser from "cookie-parser";

dotenv.config();
dbConnect();

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(userRouter)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 3005;

app.listen(port, () => console.log(`Server is running on Port: ${port}`));
