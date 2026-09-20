import { Router } from "express";
import * as authController from "./controller/auth.controller.js";
const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.patch("/verify-account", authController.verifyAccount);
export default authRouter;
