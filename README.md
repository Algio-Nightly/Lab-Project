# Express & MongoDB MERN Backend Starter

A modern, modular Node.js backend using **Express.js**, **MongoDB**, and **Mongoose**.

---

## 📁 Project Structure

```
├── .env                  # Environment variables
├── .env.example          # Environment variables template
├── .gitignore            # Git ignored files & directories
├── package.json          # Project metadata and dependencies
├── README.md             # Project documentation
└── src/
    ├── app.js            # Express app configuration & middleware
    ├── server.js         # Entry point & DB connection bootstrapper
    ├── config/
    │   └── db.js         # MongoDB connection using Mongoose
    ├── controllers/
    │   └── item.controller.js # CRUD controller functions
    ├── models/
    │   └── item.model.js      # Mongoose Schema & Model
    └── routes/
        └── item.routes.js     # API Route definitions
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already done by default) and customize the `MONGO_URI` if using MongoDB Atlas:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lab_project
```

### 3. Run the Server

**Development Mode (Hot Reload with nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API Information and Route Directory |
| `GET` | `/api/health` | Server Health Status Check |
| `GET` | `/api/items` | Get all items |
| `GET` | `/api/items/:id` | Get item by ID |
| `POST` | `/api/items` | Create a new item (`{ "name": "Sample", "description": "...", "status": "pending" }`) |
| `PUT` | `/api/items/:id` | Update an existing item |
| `DELETE` | `/api/items/:id` | Delete an item |
