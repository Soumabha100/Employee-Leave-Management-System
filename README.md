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

---

## 📮 Step-by-Step Postman Testing Guide (Authentication & Profile)

Ensure your server is running with `npm run dev` on `http://localhost:5000`.

### 1. Register a New Employee
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "name": "Soumabha Majumder",
    "email": "soumabha@example.com",
    "password": "Password123!"
  }
  ```
- **Expected Status**: `201 Created`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": {
        "id": "6743...",
        "name": "Soumabha Majumder",
        "email": "soumabha@example.com",
        "role": "employee",
        "createdAt": "2026-11-24T..."
      }
    }
  }
  ```
- **Verification Checklist**:
  - [x] Status is `201 Created`.
  - [x] No `password` field exists in the response.
  - [x] In MongoDB Atlas, verify the document in `users` has its password stored as a bcrypt hash starting with `$2b$10$`.
  - [x] In MongoDB Atlas, verify a corresponding document exists in `leavebalances` for this user with `sick: 10, casual: 8, annual: 15`.

---

### 2. Duplicate Registration Rejection
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (same email as Step 1):
  ```json
  {
    "name": "Duplicate Attempt",
    "email": "soumabha@example.com",
    "password": "DifferentPassword123!"
  }
  ```
- **Expected Status**: `409 Conflict`
- **Expected Response**:
  ```json
  {
    "success": false,
    "message": "Email already registered"
  }
  ```

---

### 3. Role Privilege Tampering Defense
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "name": "Privilege Escalation Test",
    "email": "hacker@example.com",
    "password": "Password123!",
    "role": "admin"
  }
  ```
- **Expected Status**: `201 Created`
- **Verification Checklist**:
  - [x] `role` in the response is `"employee"`.
  - [x] In MongoDB, verify the stored `role` is `"employee"`, ignoring the client-supplied `"admin"`.

---

### 4. Input Validation & NoSQL Injection Rejection
Send each of the following requests to `POST http://localhost:5000/api/auth/register`:

| Test Scenario | Request Body | Expected Status | Expected Message |
| :--- | :--- | :---: | :--- |
| **Missing Name** | `{"email": "valid@email.com", "password": "password123"}` | `400` | `"name must be a string"` |
| **Short Password** | `{"name": "User", "email": "valid@email.com", "password": "123"}` | `400` | `"password must be at least 6 characters long"` |
| **Invalid Email** | `{"name": "User", "email": "notanemail", "password": "password123"}` | `400` | `"Invalid email format"` |
| **NoSQL Injection** | `{"name": "User", "email": {"$gt": ""}, "password": "password123"}` | `400` | `"email must be a string"` |

---

### 5. Login with Valid Credentials
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "email": "soumabha@example.com",
    "password": "Password123!"
  }
  ```
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "6743...",
        "name": "Soumabha Majumder",
        "email": "soumabha@example.com",
        "role": "employee",
        "createdAt": "2026-11-24T..."
      }
    }
  }
  ```
- **Action**: Copy the `token` string for use in subsequent tests.

---

### 6. Login Failure Scenarios
Send each of the following to `POST http://localhost:5000/api/auth/login`:

- **Wrong Password**:
  - Body: `{"email": "soumabha@example.com", "password": "wrongPassword123"}`
  - Status: `401 Unauthorized`
  - Message: `"Invalid email or password"`
- **Unknown Email**:
  - Body: `{"email": "nonexistent@example.com", "password": "Password123!"}`
  - Status: `401 Unauthorized`
  - Message: `"Invalid email or password"` (identical error message and timing mitigation)
- **NoSQL Injection Attempt**:
  - Body: `{"email": {"$gt": ""}, "password": "Password123!"}`
  - Status: `400 Bad Request`
  - Message: `"email must be a string"`

---

### 7. Access Protected Profile
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/profile`
- **Headers**:
  - `Authorization`: `Bearer <paste_your_token_from_step_5>`
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6743...",
        "name": "Soumabha Majumder",
        "email": "soumabha@example.com",
        "role": "employee",
        "createdAt": "2026-11-24T..."
      }
    }
  }
  ```
- **Verification Checklist**:
  - [x] Status is `200 OK`.
  - [x] Authenticated profile data returned without password or internal fields.

---

### 8. Access Protected Profile Without Token / Invalid Token
- **No Token**: Remove the `Authorization` header.
  - Status: `401 Unauthorized`
  - Message: `"Authentication required"`
- **Invalid Token**: Set `Authorization: Bearer invalid_or_tampered_token`.
  - Status: `401 Unauthorized`
  - Message: `"Invalid token"`

---

## 🔒 Security Architecture Highlights

1. **Password Defense-in-Depth**:
   - `models/User.js` has `select: false` on the `password` field.
   - Passwords hashed using bcryptjs with 10 salt rounds prior to persistence.
   - `toJSON` schema transform deletes `password` and `__v` as an automatic safety net.
2. **Timing-Attack Mitigation**:
   - Failed logins on unknown emails perform a constant-time dummy bcrypt comparison against a precomputed 60-character bcrypt hash, ensuring execution times do not leak user existence.
3. **NoSQL Injection Blocking**:
   - All string inputs (name, email, password) pass through `requireString()`, rejecting MongoDB query operators such as `{"$gt": ""}` with a 400 Bad Request.
4. **Denial-of-Service Defense**:
   - JSON request bodies capped at `10kb` (`express.json({ limit: '10kb' })`).
5. **Role-Based Authorization & Token Integrity**:
   - `protect` middleware verifies JWT signatures and fetches the user from MongoDB to enforce the database role, preventing spoofed role claims in forged tokens.
6. **Centralized Error Sanitization**:
   - Non-operational stack traces and raw Mongo errors are never exposed to clients; clients only receive consistent standard error envelopes.
