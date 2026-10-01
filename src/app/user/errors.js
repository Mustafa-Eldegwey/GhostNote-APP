import { AppError } from "../../common/Errors/error.js";

export const userNotExist = new AppError("User Not Exists.", 404); // 404 Not found
export const userAlreadyExist = new AppError("User Already Exists", 409); // 409 Confliect
export const userAlreadyVerified = new AppError("User Already Verified", 400); // 400 bad request
export const userNotVerified = new AppError("User Not Verified", 403); // 403 Unauthurized-Not allowed
