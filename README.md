## Task Management API
A simple REST API for managing workspaces, tasks, and users. Built with Node.js, Express, and MongoDB, and hosted on Render.

### 🚀 Features
- User authentication with JWT
- CRUD operations for Workspaces, Tasks, and Users
- Query tasks by workspace
- Secure and scalable

### 📌 Endpoints

#### Users
- POST /api/users/signup – Create a new user
- POST /api/users/login – Authenticate user
- PATCH /api/users/:id – Update user

#### Workspaces
- POST /api/workspaces – Create a workspace
- GET /api/workspaces/:id – Get a single workspace
- GET /api/workspaces – Get all workspaces
- PATCH /api/workspaces/:id – Update a workspace
- DELETE /api/workspaces/:id – Delete a workspace

#### Tasks
- POST /api/tasks – Create a task
- GET /api/tasks – Get all tasks (with workspace filter)
- PATCH /api/tasks/:id – Update a task
- DELETE /api/tasks/:id – Delete a task

### 🛠 Tech Stack
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Auth: JSON Web Tokens (JWT)
- Hosting: Render
