// ============================================
// Request Logger Middleware
// ============================================
// This middleware logs every incoming request.
// It prints the HTTP method, URL, and timestamp.

function logger(req, res, next) {
  // Get the current date and time in ISO format
  var timestamp = new Date().toISOString();

  // Print the request details to the console
  console.log(req.method + " " + req.url + " " + timestamp);

  // Call next() to pass control to the next middleware
  next();
}

// Export the logger function
module.exports = logger;
