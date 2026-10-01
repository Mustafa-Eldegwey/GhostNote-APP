export class AppError extends Error{
  // message
  // stack
  // name;
  // cause
  statusCode;
  isOprational;
  constructor(message, statusCode, isOprational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOprational = isOprational;
    Error.captureStackTrace(this, this.constructor);
  }
}
const err = new AppError("message", 404);
