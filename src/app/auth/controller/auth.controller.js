import * as authService from "../service/auth.service.js";
export async function register(req, res, next) {
  try {
    const createdUser = await authService.register(req.body);
    res.status(201).json({
      message: "User Created Successfully",
      success: true,
      data: createdUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyAccount(req, res, next) {
  try {
    const { email, code } = req.body;
    const updatedUser = await authService.verifyAccount(email, code);
    res.json({
      message: "User Verified Successfully",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}
