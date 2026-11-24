# Employee Leave Management System API

A comprehensive Node.js + Express + MongoDB RESTful API for employee attendance, leave applications, approvals, and balance management.

---

## 👥 Team Responsibilities & Ownership

| Team Member | Role | Assigned Files & Responsibilities |
| :--- | :--- | :--- |
| **Soumabha** *(Leader)* | Foundation, Auth & Profile | • Architecture, Config, Error Handling, Shared Utils<br>• `models/User.js`<br>• `middleware/auth.js`<br>• `controllers/authController.js`<br>• `controllers/profileController.js`<br>• `routes/authRoutes.js`, `routes/profileRoutes.js` |
| **Soumyajit** | Attendance Management | • `models/Attendance.js`<br>• `controllers/attendanceController.js`<br>• `routes/attendanceRoutes.js` (`/api/attendance/check-in`, `/api/attendance/check-out`, `/api/attendance`) |
| **Souvojit** | Leave Applications | • `models/Leave.js`<br>• `controllers/leaveController.js`<br>• `routes/leaveRoutes.js` (`POST /api/leaves`, `GET /api/leaves`) |
| **Sohan** | Leave Review & Balances | • `models/LeaveBalance.js`<br>• `controllers/leaveReviewController.js`<br>• `controllers/leaveBalanceController.js`<br>• `routes/leaveReviewRoutes.js` (`GET /all`, `PUT /:id/approve`, `PUT /:id/reject`)<br>• `routes/leaveBalanceRoutes.js` (`GET /api/leave-balance`) |

---

## 📁 Project Structure

```text
├── config/
│   ├── constants.js          # Frozen global constants (ROLES, LEAVE_TYPES, STATUS, etc.)
│   └── db.js                 # MongoDB connection handler
├── controllers/
│   ├── attendanceController.js
│   ├── authController.js
│   ├── leaveBalanceController.js
│   ├── leaveController.js
│   ├── leaveReviewController.js
│   └── profileController.js
├── docs/
│   ├── agents.md             # AI Agent rules & team boundaries
│   └── logs.md               # Development milestone & test verification logs
├── middleware/
│   ├── auth.js               # JWT authentication & role-based authorization
│   ├── errorHandler.js       # Central error handling middleware
│   └── notFound.js           # 404 handler for unmatched routes
├── models/
│   ├── Attendance.js
│   ├── Leave.js
│   ├── LeaveBalance.js
│   └── User.js
├── Requirement/
│   └── GT 3.pdf              # Group Task 3 requirements document
├── routes/
│   ├── attendanceRoutes.js
│   ├── authRoutes.js
│   ├── leaveBalanceRoutes.js
│   ├── leaveReviewRoutes.js
│   ├── leaveRoutes.js
│   └── profileRoutes.js
├── utils/
│   ├── AppError.js           # Operational error class
│   ├── asyncHandler.js       # Async wrapper for Express routes
│   ├── dates.js              # Timezone-aware date parsing (Asia/Kolkata)
│   ├── pagination.js         # Query pagination and sort validation
│   └── validators.js         # ObjectId, string sanitization & regex helpers
├── .env.example
├── app.js                    # Express app initialization & route mounting
├── package.json
└── server.js                 # HTTP server bootstrap & graceful startup
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas URI)

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `.env` with your settings:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/leave_management
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### 4. Running the Server
```bash
# Development mode with auto-reload:
npm run dev

# Production start:
npm start
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Access | Owner | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Soumabha | Register new employee |
| `POST` | `/api/auth/login` | Public | Soumabha | Authenticate user & get JWT |
| `GET` | `/api/profile` | Private | Soumabha | Get authenticated user profile |
| `POST` | `/api/attendance/check-in` | Private | Soumyajit | Employee daily check-in |
| `PUT` | `/api/attendance/check-out` | Private | Soumyajit | Employee daily check-out |
| `GET` | `/api/attendance` | Private | Soumyajit | Attendance records (with pagination/date filters) |
| `POST` | `/api/leaves` | Private | Souvojit | Apply for leave |
| `GET` | `/api/leaves` | Private | Souvojit | View personal leave history |
| `GET` | `/api/leaves/all` | Admin / HR | Sohan | View all leave requests (paginated) |
| `PUT` | `/api/leaves/:id/approve` | Admin / HR | Sohan | Approve leave & deduct balance |
| `PUT` | `/api/leaves/:id/reject` | Admin / HR | Sohan | Reject leave request |
| `GET` | `/api/leave-balance` | Private | Sohan | Get current employee leave balance |
