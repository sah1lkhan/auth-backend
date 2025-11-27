import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes importing
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);



import { errorHandler } from "./middleware/error.middleware.js";
// error 
app.use(errorHandler)
export { app };
