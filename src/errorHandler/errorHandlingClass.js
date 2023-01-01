class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.status = "false";
  }
}

module.exports = ErrorHandler;
