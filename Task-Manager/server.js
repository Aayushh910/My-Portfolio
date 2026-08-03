var express = require("express");
var logger = require("./middleware/logger");
var errorHandler = require("./middleware/errorHandler");
var taskRoutes = require("./routes/taskRoutes");

var app = express();

app.use(express.json());
app.use(logger);

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

app.use("/tasks", taskRoutes);
app.use(errorHandler);

var PORT = 3000;

app.listen(PORT, function () {
  console.log("Server running on port " + PORT);
});
