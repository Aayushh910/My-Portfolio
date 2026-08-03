# Richardson Maturity Model Evaluation

## What is the Richardson Maturity Model?

The Richardson Maturity Model is a way to evaluate how RESTful an API is. It has 4 levels (0 to 3). Higher levels mean the API follows REST principles more closely.

---

## Evaluation Table

| Level | Criteria        | Does API satisfy? | Evidence                           |
|-------|-----------------|-------------------|------------------------------------|
| 0     | Single endpoint | No                | Multiple endpoints exist           |
| 1     | Resources       | Yes               | Uses /tasks                        |
| 2     | HTTP verbs      | Yes               | GET, POST, PUT, DELETE             |
| 3     | HATEOAS         | No                | Links not implemented              |

---

## Current Level

**Level 2**

---

## Reason

This API uses **resources** (`/tasks`) and **proper HTTP methods** (GET, POST, PUT, DELETE) with appropriate status codes. However, it does **not implement HATEOAS** (Hypermedia as the Engine of Application State), which is required for Level 3.

---

## What Would Level 3 Look Like?

To reach Level 3, the API would need to include hypermedia links in its responses. These links tell the client what actions are available next.

### Example HATEOAS Response (Not Implemented)

```json
{
  "id": 1,
  "title": "Learn Express",
  "completed": false,
  "_links": {
    "self": "/tasks/1",
    "delete": "/tasks/1"
  }
}
```

In this example, the `_links` object provides:

- **self** — The URL to access this specific task.
- **delete** — The URL to delete this specific task.

> **Note:** This is shown only as documentation. HATEOAS is **not** implemented in this project.

---

## Future Improvement

To reach **Level 3**, implement HATEOAS links in all API responses. Each task response should include a `_links` object containing URLs for related actions (`self`, `update`, `delete`). This would make the API fully RESTful and self-discoverable.
