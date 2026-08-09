function errorHandler(err, req, res, next) {
  console.error("Error encountered:", err.name, err.message);

  // Mongoose Validation Error (e.g. missing title)
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });

    return res.status(400).json({
      status: "fail",
      message: "Validation Error",
      errors: errors
    });
  }

  // Mongoose Cast Error (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: "fail",
      message: `Invalid format for field '${err.path}'`
    });
  }

  // Default internal server error
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
}

module.exports = errorHandler;
