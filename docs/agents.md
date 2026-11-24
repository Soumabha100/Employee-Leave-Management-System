# Agent Collaboration & Development Guidelines

This document outlines the strict operating procedures, architecture contracts, and boundaries for any AI agent or contributor working on the **Employee Leave Management API**.

---

## 🛡️ Core Rules & Safety Guardrails

1. **Never Deviate From Assigned Scope**:
   - Work **ONLY** within your assigned feature scope and on your assigned files.
   - Do **NOT** modify or delete base architecture files (`app.js`, `server.js`, `config/`, `middleware/errorHandler.js`, `utils/`) unless explicitly instructed by the foundation owner (Soumabha).
   - Do **NOT** touch other teammates' controllers, routes, or models.
   - Never commit directly to `main`. Always create a feature branch (`feat/<feature-name>`).

2. **No Extraneous Dependencies**:
   - Only the following packages are approved and installed:
     - Runtime: `express`, `mongoose`, `dotenv`, `bcryptjs`, `jsonwebtoken`
     - Dev: `nodemon`
   - Do **NOT** install additional packages (such as `cors`, `joi`, `supertest`, `passport`, `axios`, etc.) without unanimous team approval. Use built-in Node.js modules (`crypto`, `http`, `net`, `fetch`).

3. **Database & Secrets Safety**:
   - **NEVER commit `.env`**. Verify `.env` is listed in `.gitignore` and `git check-ignore -v .env` returns `.gitignore:2:.env`.
   - Never log passwords, tokens, hashes, or database connection strings containing credentials.
   - When `MONGO_URI` is not set locally, `server.js` starts in decoupled mode (skipping DB connection) so route tests still run cleanly.

4. **Response Contract Consistency**:
   - Every Express handler or middleware that terminates a response MUST use the exact syntax:
     ```javascript
     return res.status(<code >).json(<payload>);
     ```
   - Success shape:
     ```json
     { "success": true, "message": "Optional message", "data": { ... } }
     ```
   - Error shape (handled centrally by `middleware/errorHandler.js`):
     ```json
     { "success": false, "message": "Error description", "errors": [{ "field": "fieldName", "message": "error" }] }
     ```
   - Never send raw Error objects or MongoDB stack traces to clients.

5. **Shared Utilities Protocol**:
   - All errors must be thrown as `new AppError(message, statusCode, errors?)`.
   - All async controllers and route middleware must be wrapped in `asyncHandler(fn)`.
   - Date calculations in business logic must use `utils/dates.js` (office timezone: Asia/Kolkata, UTC+5:30).
   - Pagination queries must use `parsePagination(req.query)` and `buildPaginationMeta(...)`.
   - Sort queries must use `parseSort(req.query, allowedFields, defaultField, defaultOrder)`.
   - All string inputs from request body/params must be validated using `requireString(...)` or `validateObjectId(...)` to block NoSQL object injection attacks (e.g. `{ "$gt": "" }`).

---

## 👥 Team Ownership Matrix

| Member | Branch Convention | Files Allowed to Edit | Out of Bounds |
| :--- | :--- | :--- | :--- |
| **Soumabha** *(Leader)* | `feat/foundation-auth` | `models/User.js`<br>`middleware/auth.js`<br>`middleware/role.js`<br>`utils/token.js`<br>`controllers/authController.js`<br>`controllers/profileController.js`<br>`routes/authRoutes.js`<br>`routes/profileRoutes.js` | Attendance, Leaves, Reviews, Balances |
| **Soumyajit** | `feat/attendance` | `models/Attendance.js`<br>`controllers/attendanceController.js`<br>`routes/attendanceRoutes.js` | Auth, Leaves, Reviews, Balances |
| **Souvojit** | `feat/leave-apply` | `models/Leave.js`<br>`controllers/leaveController.js`<br>`routes/leaveRoutes.js` | Auth, Attendance, Reviews, Balances |
| **Sohan** | `feat/leave-review` | `models/LeaveBalance.js`<br>`controllers/leaveReviewController.js`<br>`controllers/leaveBalanceController.js`<br>`routes/leaveReviewRoutes.js`<br>`routes/leaveBalanceRoutes.js` | Auth, Attendance, Leave apply |

---

## 🧪 Testing & Verification Mandate

Before submitting any work:
1. **Run Unit & Integration Verifications**:
   - Agents must write and execute non-destructive automated test scripts verifying all edge cases, input validations, error scenarios, and authentication/authorization checks.
2. **Clean Up Scratch Files**:
   - Never commit throwaway test scripts. Delete them immediately after successful verification.
3. **Log the Results**:
   - Agents must append a detailed log entry to `docs/logs.md` detailing:
     - Date & branch worked on
     - Features implemented
     - Verification tests executed and results (pass/fail)
     - Security and design considerations
     - Signatures of any newly exported functions
