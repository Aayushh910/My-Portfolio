// ============================================
// In-Memory Task Data Store
// ============================================
// This array stores all tasks in memory.
// Data will be lost when the server restarts.
// Each task has: id, title, completed

const tasks = [
  {
    id: 1,
    title: "Learn Node",
    completed: false
  }
];

// Export the tasks array so other files can use it
module.exports = tasks;
