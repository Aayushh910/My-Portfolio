var express = require("express");
var path = require("path");
var fs = require("fs");

var connectDB = require("./config/db");
var logger = require("./middleware/logger");
var errorHandler = require("./middleware/errorHandler");
var taskRoutes = require("./routes/taskRoutes");
var { LOG_FILE_PATH } = require("./middleware/csvLogger");

var app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(logger);

// Serve static assets
app.use("/vendor", express.static(path.join(__dirname, "node_modules")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

// Route to render the React Task management page
app.get("/task", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to download or view the CSV log file directly
app.get("/logs/csv", function (req, res) {
  if (fs.existsSync(LOG_FILE_PATH)) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="task_logs.csv"');
    res.sendFile(LOG_FILE_PATH);
  } else {
    res.status(404).send("No CSV activity log file found yet.");
  }
});

app.use("/tasks", taskRoutes);
app.use(errorHandler);

var PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("Server running on port " + PORT);
  console.log("Activity logs CSV endpoint: http://localhost:" + PORT + "/logs/csv");
});
