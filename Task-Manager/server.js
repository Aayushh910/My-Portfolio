// ============================================
// Task Management REST API - Main Server File
// ============================================
// This is the entry point of the application.
// It sets up Express, registers middleware, and starts the server.

// Step 1: Import Express
var express = require("express");

// Step 2: Create an Express application
var app = express();

// Step 3: Import middleware
var logger = require("./middleware/logger");
var errorHandler = require("./middleware/errorHandler");

// Step 4: Import routes
var taskRoutes = require("./routes/taskRoutes");

// Step 5: Use express.json() to parse JSON request bodies
// This allows us to read req.body in POST and PUT requests
app.use(express.json());

// Step 6: Use the logger middleware for every request
// This must come BEFORE the routes
app.use(logger);

// Step 7: Homepage route
// Displays a simple informational HTML page at http://localhost:3000/
app.get("/", function (req, res) {
  var html =
    "<!DOCTYPE html>" +
    "<html lang='en'>" +
    "<head>" +
    "<meta charset='UTF-8'>" +
    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
    "<title>Task Management REST API</title>" +
    "<style>" +
    "body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f5f5f5; }" +
    "h1 { color: #333; }" +
    "h2 { color: #555; margin-top: 20px; }" +
    ".status { color: green; font-weight: bold; }" +
    "ul { list-style: none; padding: 0; }" +
    "li { padding: 6px 0; font-family: monospace; font-size: 14px; }" +
    "p.note { color: #777; margin-top: 20px; font-style: italic; }" +
    "</style>" +
    "</head>" +
    "<body>" +
    "<h1>Task Management REST API</h1>" +
    "<h2>Server Status</h2>" +
    "<p class='status'>Running Successfully</p>" +
    "<h2>Available Endpoints</h2>" +
    "<ul>" +
    "<li>GET /tasks</li>" +
    "<li>POST /tasks</li>" +
    "<li>PUT /tasks/:id</li>" +
    "<li>DELETE /tasks/:id</li>" +
    "</ul>" +
    "<p class='note'>Use Postman to test CRUD APIs.</p>" +
    "</body>" +
    "</html>";

  res.status(200).send(html);
});

// Step 8: Use the task routes
// All routes defined in taskRoutes will be prefixed with /tasks
app.use("/tasks", taskRoutes);

// Step 9: Use the error handler middleware
// This must be the LAST middleware registered
app.use(errorHandler);

// Step 10: Define the port number
var PORT = 3000;

// Step 11: Start the server
app.listen(PORT, function () {
  console.log("Server running on port " + PORT);
});
