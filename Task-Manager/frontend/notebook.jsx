import React, { useState, useEffect } from 'react';

/**
 * Task Notebook React Component
 * Simple, elegant notebook interface for managing tasks connected to MongoDB REST API.
 */
export default function Notebook() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch all tasks from backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await fetch('/tasks');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks');
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    try {
      setErrorMessage('');
      const res = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Render structured validation error if present
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          throw new Error(firstError || data.message || 'Validation error');
        }
        throw new Error(data.message || 'Failed to create task');
      }

      setTasks([data, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // Toggle Task Completion
  const handleToggleComplete = async (task) => {
    try {
      setErrorMessage('');
      const res = await fetch(`/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update task');

      setTasks(tasks.map((t) => (t._id === task._id ? data : t)));
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // Start Editing
  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  // Cancel Editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  // Save Edit
  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) {
      setErrorMessage('Title cannot be empty');
      return;
    }

    try {
      setErrorMessage('');
      const res = await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          throw new Error(firstError || data.message || 'Validation error');
        }
        throw new Error(data.message || 'Failed to save changes');
      }

      setTasks(tasks.map((t) => (t._id === id ? data : t)));
      cancelEdit();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    try {
      setErrorMessage('');
      const res = await fetch(`/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete task');

      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📖 Task Notebook</h1>
        <p style={styles.subtitle}>Simple & Clean Task Management with MongoDB</p>
      </header>

      {errorMessage && (
        <div style={styles.errorBanner}>
          <span>⚠️ {errorMessage}</span>
          <button style={styles.closeBtn} onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} style={styles.form}>
        <h2 style={styles.formTitle}>Add New Task</h2>
        <input
          type="text"
          placeholder="Task Title (Required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        <textarea
          placeholder="Task Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
          rows={2}
        />
        <button type="submit" style={styles.submitBtn}>➕ Add Task</button>
      </form>

      {/* Filter Tabs */}
      <div style={styles.filterContainer}>
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              ...(filter === f ? styles.activeFilterBtn : {}),
            }}
          >
            {f.toUpperCase()} ({
              f === 'all' ? tasks.length :
                f === 'active' ? tasks.filter(t => !t.completed).length :
                  tasks.filter(t => t.completed).length
            })
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <p style={styles.loading}>Loading tasks from database...</p>
      ) : filteredTasks.length === 0 ? (
        <p style={styles.empty}>No tasks found in notebook.</p>
      ) : (
        <div style={styles.taskList}>
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              style={{
                ...styles.taskCard,
                ...(task.completed ? styles.completedCard : {}),
              }}
            >
              {editingId === task._id ? (
                <div style={styles.editForm}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={styles.input}
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={styles.textarea}
                    rows={2}
                  />
                  <div style={styles.actionRow}>
                    <button style={styles.saveBtn} onClick={() => handleSaveEdit(task._id)}>Save</button>
                    <button style={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.taskContent}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      style={styles.checkbox}
                    />
                    <div style={styles.textGroup}>
                      <h3
                        style={{
                          ...styles.taskTitle,
                          ...(task.completed ? styles.strikethrough : {}),
                        }}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p style={styles.taskDesc}>{task.description}</p>
                      )}
                      <span style={styles.dateText}>
                        Created: {new Date(task.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={styles.actionRow}>
                    <button style={styles.editBtn} onClick={() => startEdit(task)}>✏️ Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDeleteTask(task._id)}>🗑️ Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '30px auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#2d3748',
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '10px',
  },
  title: { margin: 0, color: '#1a202c', fontSize: '28px' },
  subtitle: { margin: '5px 0 0 0', color: '#718096', fontSize: '14px' },
  errorBanner: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    border: '1px solid #feb2b2',
    borderRadius: '6px',
    padding: '10px 15px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#e53e3e',
    cursor: 'pointer',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '20px',
  },
  formTitle: { margin: '0 0 10px 0', fontSize: '16px', color: '#2d3748' },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  submitBtn: {
    backgroundColor: '#3182ce',
    color: '#ffffff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  filterBtn: {
    padding: '6px 12px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  activeFilterBtn: {
    backgroundColor: '#3182ce',
    color: '#ffffff',
    borderColor: '#3182ce',
  },
  taskList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  taskCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedCard: { opacity: 0.7, backgroundColor: '#f8fafc' },
  taskContent: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  checkbox: { marginTop: '4px', transform: 'scale(1.2)', cursor: 'pointer' },
  textGroup: { display: 'flex', flexDirection: 'column' },
  taskTitle: { margin: 0, fontSize: '16px', color: '#1a202c' },
  strikethrough: { textDecoration: 'line-through', color: '#a0aec0' },
  taskDesc: { margin: '4px 0 0 0', fontSize: '13px', color: '#4a5568' },
  dateText: { fontSize: '11px', color: '#a0aec0', marginTop: '4px' },
  actionRow: { display: 'flex', gap: '6px' },
  editBtn: {
    border: '1px solid #cbd5e0',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteBtn: {
    border: '1px solid #feb2b2',
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  editForm: { width: '100%' },
  saveBtn: {
    backgroundColor: '#38a169',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '6px',
  },
  cancelBtn: {
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  loading: { textAlign: 'center', color: '#718096' },
  empty: { textAlign: 'center', color: '#a0aec0', fontStyle: 'italic' },
};
