const ErrorHandler = require("./errorHandlingClass");

const ValidationError = (err) => {
  const message = `Invalid input data. ${err.message}`;
  return new ErrorHandler(400, message);
};

const JsonError = (err) => {
  const message = "Please provide valid JSON";
  return new ErrorHandler(400, message);
};

const InvalidToken = (err) => {
  const message = `Invalid token, please provide a valid token: ${err.message}`;
  return new ErrorHandler(400, message);
};

const ExpiredToken = (err) => {
  const message = `Token expired, please login again: ${err.message}`;
  return new ErrorHandler(400, message);
};

const DuplicateError = (err) => {
  const message = `Duplicate value provided at ${Object.keys(
    err.keyValue
  )}: ${Object.values(err.keyValue)}`;
  return new ErrorHandler(400, message);
};

const CastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ErrorHandler(400, message);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = "false";
  if (err.name === "CastError") err = CastError(err);
  if (err.code === 11000) err = DuplicateError(err);
  if (err.name === "ValidationError") err = ValidationError(err);
  if (err.message === "invalid signature") err = InvalidToken(err);
  if (err.message === "invalid token") err = InvalidToken(err);
  if (err.message === "jwt expired") err = ExpiredToken(err);
  if (err.message.includes("JSON")) err = JsonError(err);
  return res
    .status(err.statusCode)
    .send({ status: err.status, message: err.message });
};
