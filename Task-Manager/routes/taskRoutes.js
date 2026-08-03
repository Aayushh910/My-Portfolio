var express = require("express");
var router = express.Router();
var tasks = require("../data/tasks");
var nextId = 2;

router.get("/", function (req, res) {
  res.status(200).json(tasks);
});

router.post("/", function (req, res) {
  if (!req.body.title || req.body.title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  var newTask = {
    id: nextId,
    title: req.body.title.trim(),
    completed: false
  };

  nextId = nextId + 1;
  tasks.push(newTask);
  res.status(201).json(newTask);
});

router.put("/:id", function (req, res) {
  if (!req.body.title || req.body.title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  var id = parseInt(req.params.id);
  var task = null;

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      task = tasks[i];
      break;
    }
  }

  if (task === null) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.title = req.body.title.trim();
  task.completed = req.body.completed;
  res.status(200).json(task);
});

router.delete("/:id", function (req, res) {
  var id = parseInt(req.params.id);
  var index = -1;

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      index = i;
      break;
    }
  }

  if (index === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  var deletedTask = tasks.splice(index, 1);
  res.status(200).json(deletedTask[0]);
});

module.exports = router;
