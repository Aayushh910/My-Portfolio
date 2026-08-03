# Task Management REST API

A simple REST API built with Node.js and Express for managing tasks. This project stores all data in-memory using a JavaScript array.

---

## Requirements

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

---

## Installation

1. Open a terminal in the project folder.

2. Install dependencies:

```bash
npm install
```

---

## Run the Server

```bash
node server.js
```

You should see:

```
Server running on port 3000
```

---

## Project Structure

```
TaskManagementAPI/
├── package.json
├── server.js
├── routes/
│   └── taskRoutes.js
├── middleware/
│   ├── logger.js
│   └── errorHandler.js
├── data/
│   └── tasks.js
├── README.md
└── MATURITY.md
```

---

## API Endpoints

| Method | URL            | Description       | Status Code |
|--------|----------------|-------------------|-------------|
| GET    | /tasks         | Get all tasks     | 200         |
| POST   | /tasks         | Create a new task | 201         |
| PUT    | /tasks/:id     | Update a task     | 200         |
| DELETE | /tasks/:id     | Delete a task     | 200         |

---

## Example Requests and Responses

### 1. GET /tasks — Get all tasks

**Request:**

```
GET http://localhost:3000/tasks
```

**Response (200):**

```json
[
  {
    "id": 1,
    "title": "Learn Node",
    "completed": false
  }
]
```

---

### 2. POST /tasks — Create a new task

**Request:**

```
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Practice Express"
}
```

**Response (201):**

```json
{
  "id": 2,
  "title": "Practice Express",
  "completed": false
}
```

**If title is missing or empty (400):**

```json
{
  "message": "Title is required"
}
```

---

### 3. PUT /tasks/1 — Update a task

**Request:**

```
PUT http://localhost:3000/tasks/1
Content-Type: application/json

{
  "title": "Updated Task",
  "completed": true
}
```

**Response (200):**

```json
{
  "id": 1,
  "title": "Updated Task",
  "completed": true
}
```

**If title is missing or empty (400):**

```json
{
  "message": "Title is required"
}
```

**If task not found (404):**

```json
{
  "message": "Task not found"
}
```

---

### 4. DELETE /tasks/1 — Delete a task

**Request:**

```
DELETE http://localhost:3000/tasks/1
```

**Response (200):**

```json
{
  "id": 1,
  "title": "Learn Node",
  "completed": false
}
```

**If task not found (404):**

```json
{
  "message": "Task not found"
}
```

---

## Testing with Postman

1. Open **Postman**.
2. Use the following requests:

| Method | URL                           | Body (JSON)                                      |
|--------|-------------------------------|--------------------------------------------------|
| GET    | http://localhost:3000/tasks    | —                                                |
| POST   | http://localhost:3000/tasks    | `{ "title": "Practice Express" }`                |
| PUT    | http://localhost:3000/tasks/1  | `{ "title": "Updated Task", "completed": true }` |
| DELETE | http://localhost:3000/tasks/1  | —                                                |

> **Note:** For POST and PUT requests, set the Body type to **raw** and format to **JSON** in Postman.

---

## Middleware

### Logger Middleware

Logs every incoming request with the HTTP method, URL, and timestamp.

Example console output:

```
GET /tasks 2026-08-03T10:20:30.000Z
POST /tasks 2026-08-03T10:21:15.000Z
```

### Error Handler Middleware

Catches all unhandled errors and returns a 500 status code.

Response:

```json
{
  "message": "Internal Server Error"
}
```

---

## Status Codes Used

| Code | Meaning               | Used In          |
|------|-----------------------|------------------|
| 200  | OK                    | GET, PUT, DELETE |
| 201  | Created               | POST             |
| 400  | Bad Request           | POST, PUT        |
| 404  | Not Found             | PUT, DELETE      |
| 500  | Internal Server Error | Error Handler    |

---

## Screenshots

> Add Postman screenshots here after testing.

- GET /tasks — Screenshot
- POST /tasks — Screenshot
- PUT /tasks/1 — Screenshot
- DELETE /tasks/1 — Screenshot
