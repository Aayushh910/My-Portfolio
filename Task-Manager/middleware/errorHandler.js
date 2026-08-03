// ============================================
// Global Error Handler Middleware
// ============================================
// This middleware catches all errors in the app.
// It must be the LAST middleware registered.
// Express identifies it as an error handler because
// it has exactly 4 parameters: (err, req, res, next).

function errorHandler(err, req, res, next) {
  // Log the error details to the console for debugging
  console.error("Error:", err.message);

  // Send a 500 Internal Server Error response
  res.status(500).json({
    message: "Internal Server Error"
  });
}

// Export the error handler function
module.exports = errorHandler;
