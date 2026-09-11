function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  error.errorCode = "NOT_FOUND";
  next(error);
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || "Server Error",
    errorCode: error.errorCode || "SERVER_ERROR",
  });
}

module.exports = { notFound, errorHandler };
