import * as authRepository from "../repository/auth.repo.js";
import * as otpRepository from "../repository/otp.repo.js";
import * as userRepository from "../../user/repository/user.repo.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "../../../common/email/nodemailer.js";
import { toMs, toSeconds } from "../../../common/utils/time.js";

export async function register(userData) {
  // 1. check user existence
  const userExist = await authRepository.checkUserExistByEmail(userData.email);
  // 2. if yes throw an error
  if (userExist) throw new Error("User Already Exist");
  // 3. prepare data [hash-password]
  userData.password = await bcrypt.hash(userData.password, 10);
  // 4. save user into DB
  const createdUser = await authRepository.createUser(userData);
  // 5. generate and save otp into DB
  const otp = crypto.randomInt(100000, 999999).toString();
  await otpRepository.createOTP({
    code: otp,
    email: userData.email,
    expiresAt: new Date(Date.now() + toMs(5, "minutes")),
  });
  // 6. send email verification OTP
  await sendEmail(
    userData.email,
    "Verification Code",
    `<h1>Your verification code is ${otp}</h1>`,
  );
  return createdUser;
}

export async function verifyAccount(email, code) {
  // 1. check user exist
  const user = await authRepository.checkUserExistByEmail(email);
  // 1.1. if user doesn't exist >> throw error
  if (!user) throw new Error("User Not Exists.");
  // 1.2. if verified = true >> throw error
  if (user.verified === true) throw new Error("User Already Verified");
  // 2. check otp validation
  const otp = await otpRepository.getOtpByEmail(email);
  // 2.1 not exist into DB
  if (!otp) throw new Error("OTP Expired, Try to resend OTP");
  // 2.2 otp stored into Db >> code not equal stored code
  if (otp.code !== code) throw new Error("Invalid Code");
  // 3. Switch your isVerified to true
  const updatedUser = await userRepository.updateUserByEmail(email, {
    isVerified: true,
  });
  // 4. Delete otp from DB
  await otpRepository.deleteOTP(email);
  return updatedUser;
}
