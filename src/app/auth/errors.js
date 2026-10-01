import { AppError } from "../../common/Errors/error.js";

export const otpExpired = new AppError("OTP Expired, Try to resend OTP", 404); // 404
export const invalidCode = new AppError("Invalid Code", 400); // 400
export const invalidPassword = new AppError("Invalid Password", 403); // 403
