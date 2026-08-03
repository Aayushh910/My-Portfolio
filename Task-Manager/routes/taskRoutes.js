// ============================================
// Task Routes
// ============================================
// This file defines all the API endpoints for tasks.
// It uses Express Router to organize routes.

// Import Express
var express = require("express");

// Create a new Router instance
var router = express.Router();

// Import the in-memory tasks array
var tasks = require("../data/tasks");

// Variable to track the next task ID
// Start from 2 because we already have one task with id 1
var nextId = 2;

// ------------------------------------------
// GET /tasks - Get all tasks
// ------------------------------------------
// Returns the complete list of tasks.
// Status Code: 200 (OK)
router.get("/", function (req, res) {
  res.status(200).json(tasks);
});

// ------------------------------------------
// POST /tasks - Create a new task
// ------------------------------------------
// Expects a JSON body with a "title" field.
// Automatically generates an id.
// Sets completed to false by default.
// Status Code: 201 (Created) or 400 (Bad Request)
router.post("/", function (req, res) {
  // Validate: title must be provided and not empty
  if (!req.body.title || req.body.title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  // Create the new task object
  var newTask = {
    id: nextId,
    title: req.body.title.trim(),
    completed: false
  };

  // Increment the ID counter for the next task
  nextId = nextId + 1;

  // Add the new task to the tasks array
  tasks.push(newTask);

  // Return the created task with status 201
  res.status(201).json(newTask);
});

// ------------------------------------------
// PUT /tasks/:id - Update a task
// ------------------------------------------
// Updates the title and completed fields.
// If title is empty, returns 400.
// If task is not found, returns 404.
// Status Code: 200 (OK), 400 (Bad Request), or 404 (Not Found)
router.put("/:id", function (req, res) {
  // Validate: title must be provided and not empty
  if (!req.body.title || req.body.title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  // Get the task ID from the URL parameter
  // parseInt converts the string to a number
  var id = parseInt(req.params.id);

  // Find the task in the array
  var task = null;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      task = tasks[i];
      break;
    }
  }

  // If task was not found, return 404
  if (task === null) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Update the task fields with the new values from the request body
  task.title = req.body.title.trim();
  task.completed = req.body.completed;

  // Return the updated task with status 200
  res.status(200).json(task);
});

// ------------------------------------------
// DELETE /tasks/:id - Delete a task
// ------------------------------------------
// Removes a task from the array.
// If task is not found, returns 404.
// Status Code: 200 (OK) or 404 (Not Found)
router.delete("/:id", function (req, res) {
  // Get the task ID from the URL parameter
  var id = parseInt(req.params.id);

  // Find the index of the task in the array
  var index = -1;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      index = i;
      break;
    }
  }

  // If task was not found, return 404
  if (index === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Remove the task from the array using splice
  // splice(index, 1) removes 1 element at the given index
  var deletedTask = tasks.splice(index, 1);

  // Return the deleted task with status 200
  res.status(200).json(deletedTask[0]);
});

// Export the router
module.exports = router;
