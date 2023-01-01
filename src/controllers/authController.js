const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const User = require("../models/userModel");
const ErrorHandler = require("../errorHandler/errorHandlingClass");

exports.authentication = function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorHandler(401, "Please login to get access."));
  }

  const decodedToken = jwt.verify(token, "group-16-password");
  req.user_Id = decodedToken.userId;

  next();
};

exports.authorization = async function (req, res, next) {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return next(new ErrorHandler(400, "Invalid user ID"));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler(404, "No user exist with this ID"));
  }

  if (req.user_Id !== userId) {
    return next(
      new ErrorHandler(403, "You are not authorized to perform this action")
    );
  }

  next();
};
