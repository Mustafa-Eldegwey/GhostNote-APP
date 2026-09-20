import { config } from "dotenv";
config();

import "./common/db/mongoose.js";
import express from "express";
import userRouter from "./app/user/user.route.js";
import messageRouter from "./app/message/message.route.js";
import authRouter from "./app/auth/auth.route.js";
import { OTP } from "./app/auth/model/otp.model.js";

const app = express();
// parse incoming requests buffer to object
app.use(express.json());

// routes navigates to feature
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/message", messageRouter);

// Global error handler
app.use((err, req, res, next) => {
  res.json({
    message: err.message,
    success: false,
    stack: err.stack,
  });
});
app.listen(3000, () => console.log("Server is running on port 3000"));
