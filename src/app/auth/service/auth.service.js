import * as authRepository from "../repository/auth.repo.js";
import * as otpRepository from "../repository/otp.repo.js";
import * as userRepository from "../../user/repository/user.repo.js";
import { sendEmail } from "../../../common/email/nodemailer.js";
import { toMs, toSeconds } from "../../../common/utils/time.js";
import { invalidCode, invalidPassword, otpExpired } from "../errors.js";
import {
  userAlreadyExist,
  userAlreadyVerified,
  userNotExist,
  userNotVerified,
} from "../../user/errors.js";
import { genetareOTPCode } from "../../../common/utils/otp.js";
import { generateToken } from "../utils/token.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../../common/Errors/error.js";

export async function register(userData) {
  // 1. check user existence
  const userExist = await authRepository.checkUserExistByEmail(userData.email);
  // 2. if yes throw an error
  if (userExist) throw userAlreadyExist;
  // 3. prepare data [hash-password]
  userData.password = await hashPassword(userData.password);
  // 4. save user into DB
  const createdUser = await authRepository.createUser(userData);
  // 5. generate and save otp into DB
  const otp = genetareOTPCode();
  await otpRepository.createOTPCode({
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
  if (!user) throw userNotExist;
  // 1.2. if verified = true >> throw error
  if (user.isVerified === true) throw userAlreadyVerified;
  // 2. check otp validation
  const otp = await otpRepository.getOtpByEmail(email);
  // 2.1 not exist into DB
  if (!otp) throw otpExpired;
  // 2.2 otp stored into Db >> code not equal stored code
  if (otp.code !== code) throw invalidCode;
  // 3. Switch your isVerified to true
  const updatedUser = await userRepository.updateUserByEmail(email, {
    isVerified: true,
  });
  // 4. Delete otp from DB
  await otpRepository.deleteOTP(email);
  return updatedUser;
}

export async function login(email, password) {
  // 1. check user exists
  const user = await authRepository.checkUserExistByEmail(email);
  // 1.1 not exist
  if (!user) throw userNotExist;
  // 1.2 not verified
  if (user.isVerified === false) throw userNotVerified;
  // 2. compare password
  const match = await comparePassword(password, user["password"]);
  if (!match) throw invalidPassword;
  // 3. generate access Token
  return generateToken({ id: user._id, name: user.name });
}

export async function sendOtp(email) {
  const user = await authRepository.checkUserExistByEmail(email);
  if (!user) throw userNotExist;

  await otpRepository.deleteOTP(email);

  const code = genetareOTPCode();
  await otpRepository.createOTP({
    code: code,
    email: email,
    expiresAt: Date.now() + toMs(3, "minutes"),
  });

  await sendEmail(email, "New OTP", `<p>Your New OTP Is ${code}</p>`);
}

export async function resetPassword(email, code, newPassword) {
  console.log("Email received:", email);
  // verify code
  const otp = await otpRepository.getOtpByEmail(email);

  console.log("OTP found:", otp);

  if (!otp) throw otpExpired;

  console.log("Code from request:", code);
  console.log("Code from database:", otp.code);

  if (otp.code !== code) throw invalidCode;
  // hash password
  const hashedPassword = await hashPassword(newPassword);

  // updater user password
  await userRepository.updateUserByEmail(email, {
    password: hashedPassword,
  });

  // delete otp
  await otpRepository.deleteOTP(email);
}

export async function loginWithGoogle(idToken) {
  // 1. verify idToken.
  const payload = await verifyGoogleToken(idToken);
  // 2.check user exist by email.
  const user = await authRepository.checkUserExistByEmail(payload.email);
  // 3.if exist >> generate token
  if (user) {
    return generateToken({ id: user._id, email: user.email });
  }
  // 4. if not exist >> create user >> generate token
  const createdUser = await authRepository.createUser({
    name: payload.name,
    email: payload.email,
    provider: "google",
    isVerified: true,
  });
  return generateToken({ id: createdUser._id, email: createdUser.email });
} 
