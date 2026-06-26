# ProjektHaus Backend API Documentation

Complete reference for the ProjektHaus server — architecture, setup, middleware, data models, and all REST APIs.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Architecture & Request Flow](#architecture--request-flow)
7. [Authentication](#authentication)
8. [Response & Error Formats](#response--error-formats)
9. [Rate Limiting](#rate-limiting)
10. [Role-Based Access & Middleware](#role-based-access--middleware)
11. [Health Check](#health-check)
12. [Authentication APIs](#authentication-apis)
13. [Project APIs](#project-apis)
14. [Notes APIs](#notes-apis)
15. [Task APIs](#task-apis)
16. [Subtask APIs](#subtask-apis)
17. [Data Models Reference](#data-models-reference)
18. [External Services](#external-services)
19. [Quick API Summary](#quick-api-summary)

---

## Overview

ProjektHaus is a project management backend built with **Express.js 5** and **MongoDB** (Mongoose). All APIs are versioned under `/api/v1/`.

| Module       | Base Path             |
| ------------ | --------------------- |
| Health Check | `/api/v1/healthcheck` |
| Auth         | `/api/v1/auth`        |
| Projects     | `/api/v1/project`     |
| Notes        | `/api/v1/notes`       |
| Tasks        | `/api/v1/task`        |
| Subtasks     | `/api/v1/subtask`     |

**Request body limit:** JSON and URL-encoded payloads are limited to **16 KB**.

**File upload limit:** Multer accepts files up to **10 MB** each; task/subtask file endpoints accept up to **5 files** per request.

**Static files:** Files in the `public/` folder are served at the server root (e.g. `/html/joinCreate.html`).

**Temporary tokens** (email verification, password reset, project invite) expire after **20 minutes**.

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Runtime        | Node.js (ES modules)                            |
| Framework      | Express 5                                       |
| Database       | MongoDB via Mongoose 9                          |
| Auth           | JWT (`jsonwebtoken`) + HTTP-only cookies          |
| Password hash  | `bcryptjs`                                      |
| Validation     | `express-validator`                             |
| File uploads   | `multer` (disk) → `cloudinary`                  |
| Email          | `nodemailer` + `mailgen`                        |
| Rate limiting  | `express-rate-limit`                            |
| CORS           | `cors` (configurable origins)                   |

---

## Project Structure

```
server/
├── public/
│   ├── html/
│   │   └── joinCreate.html      # Invite registration form (served by project controller)
│   └── tmp/                     # Temporary multer upload directory
├── src/
│   ├── index.js                 # Entry point — loads env, connects DB, starts server
│   ├── app/
│   │   └── app.js               # Express app setup, middleware, route mounting
│   ├── db/
│   │   └── database.js          # MongoDB connection
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── notes.routes.js
│   │   ├── task.route.js
│   │   ├── subtask.route.js
│   │   └── healthcheck.route.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── notes.controller.js
│   │   ├── task.controller.js
│   │   ├── subtask.controller.js
│   │   └── healthcheck.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   ├── notes.model.js
│   │   ├── task.model.js
│   │   ├── subtask.model.js
│   │   ├── taskfile.model.js
│   │   └── subtaskFile.model.js
│   ├── middlewares/
│   │   ├── auth.middleware.js       # verifyJWT
│   │   ├── project.middleware.js  # Role & ownership checks
│   │   ├── validate.middleware.js # express-validator result handler
│   │   ├── multer.middleware.js   # File upload config
│   │   └── error.middleware.js    # Global error handler
│   ├── validators/
│   │   └── user.validator.js
│   └── utils/
│       ├── api-response.js
│       ├── apiErrorResponse.js
│       ├── aysncHandler.js
│       ├── cloudinary.js
│       ├── mail.js
│       └── rateLimiter.js
├── package.json
└── documentation.md               # This file
```

---

## Getting Started

```bash
cd server
npm install
npm run dev    # development (nodemon)
npm start      # production
```

Default port: `process.env.PORT` or **3000**.

Create a `.env` file in the `server/` directory (see [Environment Variables](#environment-variables)).

Example base URL:

```
http://localhost:3000/api/v1
```

---

## Environment Variables

| Variable                   | Required | Purpose                                              |
| -------------------------- | -------- | ---------------------------------------------------- |
| `PORT`                     | No       | Server port (default: 3000)                          |
| `MONGO_URL`                | Yes      | MongoDB connection string                            |
| `CORS_ORIGIN`              | Yes      | Comma-separated allowed origins (e.g. `http://localhost:5173`) |
| `ACCESS_TOKEN_SECREAT`     | Yes      | JWT access token secret                              |
| `ACCESS_TOKEN_EXPIRY`      | Yes      | Access token expiry (e.g. `1d`)                      |
| `REFRESH_TOKEN_SECREAT`    | Yes      | JWT refresh token secret                             |
| `REFRESH_TOKEN_EXPIRY`     | Yes      | Refresh token expiry (e.g. `10d`)                    |
| `emailVerificationAddress` | Yes      | Base URL for email verification links                |
| `forgetpassword`           | Yes      | Base URL for password reset links                    |
| `projectDomain`            | Yes      | Base URL for project invite/join links               |
| `SITE_MAIN_URL`            | Yes      | Frontend base URL used in task/subtask assignment emails |
| `CLOUDNARY_NAME`           | Yes      | Cloudinary cloud name                                |
| `CLOUDNARY_APIKEY`         | Yes      | Cloudinary API key                                   |
| `CLOUDNARY_APIPASSWORD`    | Yes      | Cloudinary API secret                                |
| `MAILTRAP_HOST`            | Yes      | SMTP host for nodemailer                             |
| `MAILTRAP_PORT`            | Yes      | SMTP port                                            |
| `MAILTRAP_USER`            | Yes      | SMTP username                                        |
| `MAILTRAP_PASS`            | Yes      | SMTP password                                        |
| `NODE_ENV`                 | No       | Set to `development` to include error stack traces   |

---

## Architecture & Request Flow

```
Client Request
    │
    ▼
CORS → JSON/urlencoded parser (16kb) → static files
    │
    ▼
globalLimiter (200 req / 10 min per IP)
    │
    ▼
cookieParser → Route handler
    │              │
    │              ├─ authLimiter (5 req / 10 min) on /api/v1/auth
    │              ├─ verifyJWT (protected routes)
    │              ├─ project middleware (role checks)
    │              ├─ multer (file uploads)
    │              ├─ express-validator + validate
    │              └─ controller (asyncHandler)
    │
    ▼
errorHandler (global) → JSON error response
```

**Entry point** (`src/index.js`): loads `.env`, connects to MongoDB via `connectDB()`, then starts the Express server.

**App setup** (`src/app/app.js`): configures middleware, mounts all `/api/v1/*` routes, and registers the global `errorHandler` last.

---

## Authentication

Protected routes require a valid **access token**, provided in one of two ways:

1. **HTTP-only cookie** (set automatically on login):
   - Cookie name: `accessToken`

2. **Authorization header**:
   ```
   Authorization: Bearer <access_token>
   ```

### Token refresh

The `refreshTokens` endpoint accepts the refresh token via:

- Cookie: `refreshToken`
- Header: `Authorization: Bearer <refresh_token>`

On successful login or token refresh, both `accessToken` and `refreshToken` cookies are set (`httpOnly: true`, `secure: true`).

Use **GET `/me`** to validate an existing session on app startup before rendering protected routes (returns the same user object shape as login).

### JWT payload

Both access and refresh tokens encode:

```json
{ "_id": "<userId>", "username": "...", "email": "..." }
```

### Temporary tokens

Used for email verification, password reset, and project invites. Generated via `user.generateTempararyTokens()`:

- 20-byte random hex string (sent to user unhashed)
- SHA-256 hash stored in the database
- Expires **20 minutes** after creation

---

## Response & Error Formats

### Success response (`ApiResponse`)

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Human-readable message",
  "success": true
}
```

- `success` is `true` when `statusCode < 400`.

### Error response (`ApiError`)

```json
{
  "statusCode": 400,
  "error": [],
  "message": "Error description"
}
```

- Validation errors return `statusCode: 400` with field-level errors in the `error` array.
- Unhandled Mongoose validation errors are normalized to **400** by the global error handler.
- In `NODE_ENV=development`, the error response also includes a `stack` trace.

### Rate limit response

Both limiters return HTTP **429**. Messages differ by scope:

| Limiter        | Message                                              |
| -------------- | ---------------------------------------------------- |
| `globalLimiter`| `"Too many requests. Please try again later."`       |
| `authLimiter`  | `"Too many requests. Please apply later."`           |

```json
{
  "statusCode": 429,
  "data": null,
  "message": "Too many requests. Please try again later.",
  "success": false
}
```

---

## Rate Limiting

| Limiter        | Scope              | Window    | Max requests |
| -------------- | ------------------ | --------- | ------------ |
| `globalLimiter`| All routes         | 10 minutes| 200 per IP   |
| `authLimiter`  | `/api/v1/auth/*`   | 10 minutes| 5 per IP     |

Both return HTTP **429** when exceeded.

---

## Role-Based Access & Middleware

### Project roles

Roles are stored on the **Project** document as arrays of user ObjectIds:

| Role                | Field in Project  | Permissions                                                                 |
| ------------------- | ----------------- | --------------------------------------------------------------------------- |
| **Admin**           | `admins`          | Full project control; notes CRUD, member management, project updates        |
| **Project Manager** | `projectManagers` | Create/update/delete tasks & subtasks, assign members, attach/delete files  |
| **Member**          | `members`         | View tasks/subtasks/notes, update assigned task/subtask progress, view files |

The project creator is automatically added to `admins` on creation.

### Middleware reference

| Middleware                     | Attaches        | Description                                                                 |
| ------------------------------ | --------------- | --------------------------------------------------------------------------- |
| `verifyJWT`                    | `req.user`      | Validates access token from cookie or `Authorization` header                |
| `verifyAdmin`                  | `req.project`   | User must be in project's `admins` array                                    |
| `verifyAdminAndProjectManager` | `req.project` | User must be in `admins` or `projectManagers`                               |
| `memberOfProject`              | `req.project`   | User must be in `admins`, `projectManagers`, or `members`                   |
| `isTaskBelongsToProject`       | `req.task`      | Validates `taskId` belongs to `projectId` in URL params                     |
| `isSubTaskBelongToProjectTask` | `req.subTask`   | Validates `subTaskId` belongs to `taskId` and `projectId` in URL params     |
| `validate`                     | —               | Processes `express-validator` results; returns 400 on failure                 |
| `upload` (multer)              | `req.file` / `req.files` | Handles multipart file uploads to `public/tmp/` (max 10 MB per file)   |

**Common middleware error codes**

| Middleware                     | Status | When                                              |
| ------------------------------ | ------ | ------------------------------------------------- |
| `verifyJWT`                    | 401    | Missing, invalid, or expired access token         |
| `verifyAdmin`                  | 400    | Missing `projectId` in URL                        |
| `verifyAdmin`                  | 403    | User is not a project admin                       |
| `verifyAdminAndProjectManager` | 400    | Missing `projectId` in URL                        |
| `verifyAdminAndProjectManager` | 403    | User is not an admin or project manager           |
| `memberOfProject`              | 400    | Missing `projectId` in URL                        |
| `memberOfProject`              | 403    | User is not a member of the project               |
| `isTaskBelongsToProject`       | 400    | Missing `taskId` or `projectId`                   |
| `isTaskBelongsToProject`       | 404    | Task not found in the given project               |
| `isSubTaskBelongToProjectTask` | 400    | Missing `taskId`, `projectId`, or `subTaskId`     |
| `isSubTaskBelongToProjectTask` | 404    | Subtask not found for the given task and project  |

---

## Health Check

### GET `/api/v1/healthcheck/`

Checks whether the server is running.

|           |      |
| --------- | ---- |
| **Auth**  | None |
| **Input** | None |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "The server is working fine",
  "success": true
}
```

---

## Authentication APIs

Base path: `/api/v1/auth`

> Auth routes are additionally rate-limited to **5 requests per 10 minutes** per IP.

---

### POST `/register`

Register a new user. Sends an email verification link.

|                  |                       |
| ---------------- | --------------------- |
| **Auth**         | None                  |
| **Content-Type** | `multipart/form-data` |

**Body (form fields)**

| Field          | Type   | Required | Validation                        |
| -------------- | ------ | -------- | --------------------------------- |
| `username`     | string | Yes      | Min 4 characters, lowercase       |
| `email`        | string | Yes      | Valid email                       |
| `password`     | string | Yes      | Min 8 characters                  |
| `name`         | string | Yes      | —                                 |
| `gender`       | string | Yes      | `male`, `female`, or `other`      |
| `age`          | number | No       | —                                 |
| `organization` | string | No       | —                                 |
| `phoneNumber`  | string | No       | —                                 |
| `avatar`       | file   | No       | Image file (field name: `avatar`) |

**Response (201)**

```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "john doe",
    "gender": "male",
    "avatar": { "url": "...", "publicId": "..." },
    "isEmailVerified": false,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "User is registered and email is send for verification",
  "success": true
}
```

**Errors:** `409` if username or email already exists; `400` validation errors; `502` email send failure.

---

### GET `/verify-email-address/:token/`

Verify a user's email using the token sent via email.

|                |                                                       |
| -------------- | ----------------------------------------------------- |
| **Auth**       | None                                                  |
| **URL params** | `token` — unhashed verification token from email link |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": { "verified": true },
  "message": "the mail is verified successfully",
  "success": true
}
```

**Errors:** `400` missing token; `401` invalid or expired token.

---

### POST `/login`

Authenticate a user and receive tokens.

|                  |                    |
| ---------------- | ------------------ |
| **Auth**         | None               |
| **Content-Type** | `application/json` |

**Body**

| Field      | Type   | Required          |
| ---------- | ------ | ----------------- |
| `email`    | string | Yes               |
| `password` | string | Yes (min 8 chars) |

**Response (200)**

Sets `accessToken` and `refreshToken` cookies.

```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "john doe",
    "gender": "male",
    "avatar": { "url": "...", "publicId": "..." },
    "isEmailVerified": true
  },
  "message": "login is successfull",
  "success": true
}
```

**Errors:** `401` invalid credentials or email not verified.

---

### POST `/forget-password`

Send a password reset link to the user's email.

|                  |                    |
| ---------------- | ------------------ |
| **Auth**         | None               |
| **Content-Type** | `application/json` |

**Body**

| Field      | Type   | Required                          |
| ---------- | ------ | --------------------------------- |
| `username` | string | One of username or email required |
| `email`    | string | One of username or email required |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "password reset link has been sent to your email",
  "success": true
}
```

**Errors:** `404` if user not found; `500` or `502` on email send failure.

---

### POST `/reset-password/:token/`

Reset password using the token from the reset email.

|                  |                                       |
| ---------------- | ------------------------------------- |
| **Auth**         | None                                  |
| **URL params**   | `token` — reset token from email link |
| **Content-Type** | `application/json`                    |

**Body**

| Field         | Type   | Required |
| ------------- | ------ | -------- |
| `newPassword` | string | Yes      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "reset of the email is successfull",
  "success": true
}
```

**Errors:** `400` missing password or token; `401` invalid or expired token.

---

### GET `/refreshTokens`

Issue new access and refresh tokens.

|          |                                                          |
| -------- | -------------------------------------------------------- |
| **Auth** | Refresh token (cookie or `Authorization: Bearer` header) |

**Response (200)**

Updates `accessToken` and `refreshToken` cookies.

```json
{
  "statusCode": 200,
  "data": "",
  "message": "refresh and token updated",
  "success": true
}
```

**Errors:** `401` if token missing, invalid, expired, or does not match stored refresh token.

---

### GET `/me`

Return the currently authenticated user. Intended for session validation on app boot (e.g. after Zustand rehydrates from localStorage).

|          |                        |
| -------- | ---------------------- |
| **Auth** | Required (`verifyJWT`) |

**Response (200)**

Same user shape as [POST `/login`](#post-login) (password and refresh token excluded):

```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "john doe",
    "gender": "male",
    "avatar": { "url": "...", "publicId": "..." },
    "isEmailVerified": true
  },
  "message": "current user fetched successfully",
  "success": true
}
```

**Errors:** `401` if the token is missing, invalid, expired, or the user no longer exists.

---

### GET `/resendEmailVerification`

Resend the email verification link to the logged-in user.

|          |                        |
| -------- | ---------------------- |
| **Auth** | Required (`verifyJWT`) |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": [],
  "message": "email is send for verification",
  "success": true
}
```

**Errors:** `400` if email is already verified; `404` user not found; `500` email send failure.

---

### GET `/logout`

Log out the current user and clear tokens.

|          |                        |
| -------- | ---------------------- |
| **Auth** | Required (`verifyJWT`) |

**Response (200)**

Clears `accessToken` and `refreshToken` cookies. Clears `refreshToken` in the database.

```json
{
  "statusCode": 200,
  "data": "",
  "message": "logout is successfull",
  "success": true
}
```

---

### POST `/change-avatar`

Upload a new profile avatar. Replaces the previous avatar on Cloudinary.

|                  |                        |
| ---------------- | ---------------------- |
| **Auth**         | Required (`verifyJWT`) |
| **Content-Type** | `multipart/form-data`  |

**Body**

| Field    | Type | Required |
| -------- | ---- | -------- |
| `avatar` | file | Yes      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "The avatar is change successFulyy",
  "success": true
}
```

**Errors:** `502` if Cloudinary upload fails.

---

### PUT `/update-info`

Update the logged-in user's profile.

|                  |                        |
| ---------------- | ---------------------- |
| **Auth**         | Required (`verifyJWT`) |
| **Content-Type** | `application/json`     |

**Body**

| Field          | Type          | Required |
| -------------- | ------------- | -------- |
| `name`         | string        | Yes      |
| `gender`       | string        | Yes      |
| `phoneNumber`  | object/string | No       |
| `organization` | string        | No       |
| `address`      | string        | No       |
| `age`          | number        | No       |

**Response (202)**

```json
{
  "statusCode": 202,
  "data": {
    /* updated user object (password and tokens excluded) */
  },
  "message": "The profile information is updated",
  "success": true
}
```

---

### POST `/change-password`

Change the logged-in user's password.

|                  |                        |
| ---------------- | ---------------------- |
| **Auth**         | Required (`verifyJWT`) |
| **Content-Type** | `application/json`     |

**Body**

| Field         | Type   | Required          |
| ------------- | ------ | ----------------- |
| `oldPassword` | string | Yes               |
| `newPassword` | string | Yes (min 8 chars) |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": [],
  "message": "password is changed successfully",
  "success": true
}
```

**Errors:** `401` if old password is incorrect; `404` user not found.

---

## Project APIs

Base path: `/api/v1/project`

---

### POST `/create-project`

Create a new project. The creator is automatically added as an admin.

|                  |                        |
| ---------------- | ---------------------- |
| **Auth**         | Required (`verifyJWT`) |
| **Content-Type** | `application/json`     |

**Body**

| Field         | Type   | Required |
| ------------- | ------ | -------- |
| `name`        | string | Yes      |
| `description` | string | No       |

**Response (201)**

```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "projectName": "My Project",
    "projectDescription": "Description here",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "project is creaed successfully",
  "success": true
}
```

> Note: `admins`, `projectManagers`, and `members` are omitted from the response.

**Errors:** `400` if name is missing.

---

### PUT `/:projectId/update-project`

Update project name and description.

|                  |                                        |
| ---------------- | -------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdmin`) |
| **URL params**   | `projectId`                            |
| **Content-Type** | `application/json`                     |

**Body**

| Field         | Type   | Required |
| ------------- | ------ | -------- |
| `name`        | string | Yes      |
| `description` | string | No       |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "projectName": "Updated Name",
    "projectDescription": "Updated description"
  },
  "message": "project is updated successfully",
  "success": true
}
```

**Errors:** `400` missing name; `403` not admin or project not found; `404` update failed.

---

### GET `/:projectId/get-the-project`

Fetch basic project information.

|                |                                                  |
| -------------- | ------------------------------------------------ |
| **Auth**       | Required (`verifyJWT` + `memberOfProject`)         |
| **URL params** | `projectId`                                      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "projectName": "My Project",
    "projectDescription": "Description"
  },
  "message": "the project is fetched successfully",
  "success": true
}
```

**Errors:** `400` missing projectId; `403` not a member; `404` project not found.

---

### GET `/listAll`

List all projects the authenticated user belongs to (as admin, project manager, or member). Each item includes the user's **role** in that project.

|          |                        |
| -------- | ---------------------- |
| **Auth** | Required (`verifyJWT`) |

**Response (200)**

Returns an empty array when the user belongs to no projects.

```json
{
  "statusCode": 200,
  "data": [
    { "_id": "...", "projectName": "Project A", "role": "ADMIN" },
    { "_id": "...", "projectName": "Project B", "role": "PROJECT_MANAGER" },
    { "_id": "...", "projectName": "Project C", "role": "MEMBER" }
  ],
  "message": "the list of projects in which user is fetched successfully",
  "success": true
}
```

**Role values:** `ADMIN`, `PROJECT_MANAGER`, or `MEMBER`. If a user appears in multiple role arrays, priority is admin → project manager → member.

---

### POST `/:projectId/add-member`

Invite a user to join the project by email.

- If the user **exists**: generates an invite token and sends a join link.
- If the user **does not exist**: sends a link to the HTML registration form.

|                  |                                        |
| ---------------- | -------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdmin`) |
| **URL params**   | `projectId`                            |
| **Content-Type** | `application/json`                     |

**Body**

| Field         | Type   | Required |
| ------------- | ------ | -------- |
| `memberEmail` | string | Yes      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": " ",
  "message": "email had been successfully send to the member",
  "success": true
}
```

**Errors:** `500` on email send failure.

---

### GET `/:projectId/:email/htmlForm`

Serve an HTML registration form for users who do not yet have an account (invite flow).

|                |                      |
| -------------- | -------------------- |
| **Auth**       | None                 |
| **URL params** | `projectId`, `email` |

**Response (200)** — HTML page (`joinCreate.html`) with the email and join link pre-filled.

**Errors:** `400` missing projectId.

---

### POST `/:projectId/join-the-project/:token/`

Allow an **existing registered user** to join a project via the invite token from email.

|                |                      |
| -------------- | -------------------- |
| **Auth**       | None                 |
| **URL params** | `projectId`, `token` |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "congratulation you successFully joined the project",
  "success": true
}
```

**Errors:** `400` missing params; `401` invalid or expired token; `404` project not found.

---

### POST `/:projectId/join-project`

Register a **new user** and add them to the project in one step (for users without an account).

|                  |                       |
| ---------------- | --------------------- |
| **Auth**         | None                  |
| **URL params**   | `projectId`           |
| **Content-Type** | `multipart/form-data` |

**Body** — Same fields as [POST `/register`](#post-register). Email is auto-verified (`isEmailVerified: true`).

**Response (201)**

```json
{
  "statusCode": 201,
  "data": "",
  "message": "successflly joined the project",
  "success": true
}
```

**Errors:** `409` duplicate username/email; `400` validation errors.

---

### GET `/:projectId/peoples`

Get all members of a project with their roles (populated with `name`, `email`, `_id`).

|                |                                                  |
| -------------- | ------------------------------------------------ |
| **Auth**       | Required (`verifyJWT` + `memberOfProject`)         |
| **URL params** | `projectId`                                      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "projectName": "...",
    "admins": [{ "_id": "...", "name": "...", "email": "..." }],
    "projectManagers": [{ "_id": "...", "name": "...", "email": "..." }],
    "members": [{ "_id": "...", "name": "...", "email": "..." }]
  },
  "message": "Data fetched successfuly",
  "success": true
}
```

---

### DELETE `/:projectId/remove-member`

Remove a member from the project (removes from all role arrays).

|                  |                                        |
| ---------------- | -------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdmin`) |
| **URL params**   | `projectId`                            |
| **Content-Type** | `application/json`                     |

**Body**

| Field    | Type              | Required |
| -------- | ----------------- | -------- |
| `userId` | string (ObjectId) | Yes      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "member is removed from the project",
  "success": true
}
```

**Errors:** `403` if trying to remove yourself or if user is the last admin; `404` project not found.

---

### POST `/:projectId/changeroles`

Change a member's role within the project. User is first removed from all role arrays, then added to the new role.

|                  |                                        |
| ---------------- | -------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdmin`) |
| **URL params**   | `projectId`                            |
| **Content-Type** | `application/json`                     |

**Body**

| Field    | Type              | Required | Values                                      |
| -------- | ----------------- | -------- | ------------------------------------------- |
| `userId` | string (ObjectId) | Yes      | —                                           |
| `role`   | string            | Yes      | `ADMIN`, `MEMBER`, or `PROJECT_MANAGER`     |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "member is assigned to given role in the project",
  "success": true
}
```

**Errors:** `400` if `role` is not one of the allowed values; `403` if trying to change your own role.

---

## Notes APIs

Base path: `/api/v1/notes`

---

### POST `/:projectId/create-note`

Create a note for a project.

|                  |                                        |
| ---------------- | -------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdmin`) |
| **URL params**   | `projectId`                            |
| **Content-Type** | `application/json`                     |

**Body**

| Field     | Type   | Required |
| --------- | ------ | -------- |
| `content` | string | Yes      |

**Response (201)**

```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "projectId": "...",
    "content": "Note content here",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Notes are created successfully",
  "success": true
}
```

**Errors:** `400` empty content.

---

### PUT `/:projectId/:noteId/update-note`

Update an existing note.

|                  |                                        |
| ---------------- | -------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdmin`) |
| **URL params**   | `projectId`, `noteId`                  |
| **Content-Type** | `application/json`                     |

**Body**

| Field            | Type   | Required |
| ---------------- | ------ | -------- |
| `updatedContent` | string | Yes      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "Updated note content",
  "message": "the content of notes is updated successfully",
  "success": true
}
```

**Errors:** `404` note not found in project.

---

### DELETE `/:projectId/:noteId/delete-note`

Delete a note.

|                |                                        |
| -------------- | -------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `verifyAdmin`) |
| **URL params** | `projectId`, `noteId`                  |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": [],
  "message": "The note is successfully deleted",
  "success": true
}
```

---

### GET `/:projectId/list-notes`

List all notes for a project.

|                |                                                  |
| -------------- | ------------------------------------------------ |
| **Auth**       | Required (`verifyJWT` + `memberOfProject`)       |
| **URL params** | `projectId`                                      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "projectId": "...",
      "content": "Note content",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "message": "notes fetched successfully",
  "success": true
}
```

---

### GET `/:projectId/:noteId/get-note`

Fetch a single note by ID.

|                |                                                  |
| -------------- | ------------------------------------------------ |
| **Auth**       | Required (`verifyJWT` + `memberOfProject`)       |
| **URL params** | `projectId`, `noteId`                            |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "projectId": "...",
    "content": "Note content",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "The note is fetched successfully",
  "success": true
}
```

**Errors:** `404` if note not found.

---

## Task APIs

Base path: `/api/v1/task`

### Task object fields

| Field         | Type   | Default     | Values                             |
| ------------- | ------ | ----------- | ---------------------------------- |
| `name`        | string | —           | Required                           |
| `description` | string | —           | —                                  |
| `startDate`   | Date   | Now         | —                                  |
| `endDate`     | Date   | Now + 1 day | —                                  |
| `priority`    | string | `Low`       | `High`, `Medium`, `Low`            |
| `status`      | string | `TODO`      | `TODO`, `IN PROGRESS`, `COMPLETED` |
| `progress`    | number | `0`         | 0–100                              |
| `assigned`    | array  | `[]`        | `[{ id, email }]`                  |

---

### POST `/:projectId/create-task`

Create a new task in a project.

|                  |                                                         |
| ---------------- | ------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager`) |
| **URL params**   | `projectId`                                             |
| **Content-Type** | `application/json`                                      |

**Body**

| Field         | Type        | Required |
| ------------- | ----------- | -------- |
| `name`        | string      | Yes      |
| `description` | string      | No       |
| `startDate`   | Date/string | No       |
| `endDate`     | Date/string | No       |
| `priority`    | string      | No       |
| `status`      | string      | No       |
| `progress`    | number      | No       |

**Response (201)**

```json
{
  "statusCode": 201,
  "data": { /* full task object */ },
  "message": "The task is added successfully",
  "success": true
}
```

---

### PUT `/:projectId/:taskId/update-task`

Update an existing task.

|                  |                                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isTaskBelongsToProject`) |
| **URL params**   | `projectId`, `taskId`                                                            |
| **Content-Type** | `application/json`                                                               |

**Body** — Same fields as create; `name` is required.

**Response (200)**

```json
{
  "statusCode": 200,
  "data": { /* updated task object */ },
  "message": "the task is updated successfully",
  "success": true
}
```

**Errors:** `404` task not found in project.

---

### DELETE `/:projectId/:taskId/delete-task`

Delete a task.

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isTaskBelongsToProject`) |
| **URL params** | `projectId`, `taskId`                                                            |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "The task is deleted successFully",
  "success": true
}
```

---

### GET `/:projectId/:taskId/get-task`

Fetch a single task.

|                |                                                                            |
| -------------- | -------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `memberOfProject` + `isTaskBelongsToProject`)      |
| **URL params** | `projectId`, `taskId`                                                      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": { /* task object */ },
  "message": "The task is fetched successfully",
  "success": true
}
```

---

### GET `/:projectId/get-all-tasks`

List all tasks in a project. Returns an empty array when no tasks exist.

|                |                                            |
| -------------- | ------------------------------------------ |
| **Auth**       | Required (`verifyJWT` + `memberOfProject`) |
| **URL params** | `projectId`                                |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": [ /* array of task objects */ ],
  "message": "List of tasks had been sended",
  "success": true
}
```

---

### POST `/:projectId/:taskId/assign-task`

Assign members to a task and send notification emails. Merges with existing assignments (deduplicated by `id`).

|                  |                                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isTaskBelongsToProject`) |
| **URL params**   | `projectId`, `taskId`                                                            |
| **Content-Type** | `application/json`                                                               |

**Body**

| Field          | Type  | Required |
| -------------- | ----- | -------- |
| `assignedList` | array | Yes      |

Each item in `assignedList`:

```json
{ "id": "<user ObjectId>", "email": "user@example.com" }
```

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "memeber are assigned to the task",
  "success": true
}
```

---

### DELETE `/:projectId/:taskId/delete-assigned-member`

Remove an assigned member from a task.

|                  |                                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isTaskBelongsToProject`) |
| **URL params**   | `projectId`, `taskId`                                                            |
| **Content-Type** | `application/json`                                                               |

**Body**

| Field               | Type              | Required |
| ------------------- | ----------------- | -------- |
| `assignedMemeberId` | string (ObjectId) | Yes      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "The user is removed from this task",
  "success": true
}
```

---

### PUT `/:projectId/:taskId/updationOfTask`

Allow an **assigned member** to update task progress and status.

|                  |                                                                            |
| ---------------- | -------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `memberOfProject` + `isTaskBelongsToProject`)      |
| **URL params**   | `projectId`, `taskId`                                                      |
| **Content-Type** | `application/json`                                                         |

**Body**

| Field      | Type   | Required                                      |
| ---------- | ------ | --------------------------------------------- |
| `progress` | number | Yes (including `0`)                           |
| `status`   | string | Yes                                           |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "update is successfull",
  "success": true
}
```

**Errors:** `400` if `progress` or `status` is missing; `403` if the user is not in the task's `assigned` list.

---

### POST `/:projectId/:taskId/attach-files`

Upload files to a task (stored on Cloudinary, metadata in `taskFile` collection).

|                  |                                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isTaskBelongsToProject`) |
| **URL params**   | `projectId`, `taskId`                                                            |
| **Content-Type** | `multipart/form-data`                                                            |

**Body**

| Field         | Type   | Required | Max     |
| ------------- | ------ | -------- | ------- |
| `filesToSend` | file[] | Yes      | 5 files |

**Response (201)**

```json
{
  "statusCode": 201,
  "data": "",
  "message": "Files are successFully attached to the task",
  "success": true
}
```

**Errors:** `400` no files; `502` Cloudinary upload failure.

---

### GET `/:projectId/:taskId/get-all-files`

List all files attached to a task.

|                |                                                                            |
| -------------- | -------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `memberOfProject` + `isTaskBelongsToProject`)      |
| **URL params** | `projectId`, `taskId`                                                      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "url": "https://...",
      "taskId": "...",
      "fileName": "document.pdf",
      "fileKind": "raw",
      "publicId": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "message": "Files are sended successfully",
  "success": true
}
```

---

### DELETE `/:projectId/:taskId/:fileId/delete-the-file`

Delete a file from a task (removes from Cloudinary and database).

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isTaskBelongsToProject`) |
| **URL params** | `projectId`, `taskId`, `fileId`                                                |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "The file is deleted successFully",
  "success": true
}
```

**Errors:** `404` file not found.

---

## Subtask APIs

Base path: `/api/v1/subtask`

Subtasks mirror the task API structure but are nested under a parent task. Subtask objects share the same fields as tasks, plus `taskId`.

---

### POST `/:projectId/:taskId/create-subtask`

Create a subtask under a task.

|                  |                                                         |
| ---------------- | ------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager`) |
| **URL params**   | `projectId`, `taskId`                                   |
| **Content-Type** | `application/json`                                      |

**Body** — Same fields as [create task](#post-projectidcreate-task); `name` is required.

**Response (201)**

```json
{
  "statusCode": 201,
  "data": { /* subtask object */ },
  "message": "The sub task is added successfully",
  "success": true
}
```

---

### PUT `/:projectId/:taskId/:subTaskId/update-subtask`

Update a subtask.

|                  |                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isSubTaskBelongToProjectTask`) |
| **URL params**   | `projectId`, `taskId`, `subTaskId`                                                     |
| **Content-Type** | `application/json`                                                                     |

**Body** — Same fields as create; `name` is required.

**Response (200)**

```json
{
  "statusCode": 200,
  "data": { /* updated subtask */ },
  "message": "the task is updated successfully",
  "success": true
}
```

---

### DELETE `/:projectId/:taskId/:subTaskId/delete-subtask`

Delete a subtask.

|                |                                                                                        |
| -------------- | -------------------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isSubTaskBelongToProjectTask`) |
| **URL params** | `projectId`, `taskId`, `subTaskId`                                                     |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "The task is deleted successFully",
  "success": true
}
```

---

### GET `/:projectId/:taskId/:subTaskId/get-the-subtask`

Fetch a single subtask.

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `memberOfProject` + `isSubTaskBelongToProjectTask`)    |
| **URL params** | `projectId`, `taskId`, `subTaskId`                                               |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": { /* subtask object */ },
  "message": "The Subtask is fetched successfully",
  "success": true
}
```

---

### GET `/:projectId/:taskId/get-all-subtask`

List all subtasks for a task. Returns an empty array when no subtasks exist.

|                |                                                                            |
| -------------- | -------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `memberOfProject` + `isTaskBelongsToProject`)      |
| **URL params** | `projectId`, `taskId`                                                      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": [ /* array of subtask objects */ ],
  "message": "List of Subtasks had been sended",
  "success": true
}
```

---

### POST `/:projectId/:taskId/:subTaskId/assign-subTask`

Assign members to a subtask and send notification emails.

|                  |                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isSubTaskBelongToProjectTask`) |
| **URL params**   | `projectId`, `taskId`, `subTaskId`                                                     |
| **Content-Type** | `application/json`                                                                     |

**Body**

| Field          | Type  | Required                |
| -------------- | ----- | ----------------------- |
| `assignedList` | array | Yes — `[{ id, email }]` |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "memeber are assigned to the task",
  "success": true
}
```

---

### DELETE `/:projectId/:taskId/:subTaskId/delete-assigned`

Remove an assigned member from a subtask.

|                  |                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isSubTaskBelongToProjectTask`) |
| **URL params**   | `projectId`, `taskId`, `subTaskId`                                                     |
| **Content-Type** | `application/json`                                                                     |

**Body**

| Field               | Type              | Required |
| ------------------- | ----------------- | -------- |
| `assignedMemeberId` | string (ObjectId) | Yes      |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "The user is removed from this SubTask",
  "success": true
}
```

---

### PUT `/:projectId/:taskId/:subTaskId/update-assigned-subtask`

Allow an **assigned member** to update subtask progress and status.

|                  |                                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `memberOfProject` + `isSubTaskBelongToProjectTask`)    |
| **URL params**   | `projectId`, `taskId`, `subTaskId`                                               |
| **Content-Type** | `application/json`                                                               |

**Body**

| Field      | Type   | Required                                      |
| ---------- | ------ | --------------------------------------------- |
| `progress` | number | Yes (including `0`)                           |
| `status`   | string | Yes                                           |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "update is successfull",
  "success": true
}
```

**Errors:** `400` if `progress` or `status` is missing; `403` if the user is not in the subtask's `assigned` list.

> Note: Unlike [PUT `/:projectId/:taskId/updationOfTask`](#put-projectidtaskidupdationoftask), a `progress` value of `0` is currently rejected by the subtask controller.

---

### POST `/:projectId/:taskId/:subTaskId/attach-files-subtask`

Upload files to a subtask.

|                  |                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Auth**         | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isSubTaskBelongToProjectTask`) |
| **URL params**   | `projectId`, `taskId`, `subTaskId`                                                     |
| **Content-Type** | `multipart/form-data`                                                                  |

> Middleware order: `upload.array("filesToSend", 5)` runs before role and ownership checks.

**Body**

| Field         | Type   | Required | Max     |
| ------------- | ------ | -------- | ------- |
| `filesToSend` | file[] | Yes      | 5 files |

**Response (201)**

```json
{
  "statusCode": 201,
  "data": "",
  "message": "Files are successFully attached to the task",
  "success": true
}
```

---

### GET `/:projectId/:taskId/:subTaskId/get-all-files`

List all files attached to a subtask.

|                |                                                                                  |
| -------------- | -------------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `memberOfProject` + `isSubTaskBelongToProjectTask`)      |
| **URL params** | `projectId`, `taskId`, `subTaskId`                                               |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "url": "https://...",
      "taskId": "...",
      "subTaskId": "...",
      "fileName": "file.png",
      "fileKind": "image",
      "publicId": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "message": "Files are sended successfully",
  "success": true
}
```

---

### DELETE `/:projectId/:taskId/:subTaskId/:fileId/delete-the-file`

Delete a file from a subtask.

|                |                                                                                        |
| -------------- | -------------------------------------------------------------------------------------- |
| **Auth**       | Required (`verifyJWT` + `verifyAdminAndProjectManager` + `isSubTaskBelongToProjectTask`) |
| **URL params** | `projectId`, `taskId`, `subTaskId`, `fileId`                                           |

**Response (200)**

```json
{
  "statusCode": 200,
  "data": "",
  "message": "The file is deleted successFully",
  "success": true
}
```

---

## Data Models Reference

### User (`User`)

| Field                        | Type                      | Notes                          |
| ---------------------------- | ------------------------- | ------------------------------ |
| `username`                   | string                    | Unique, lowercase, indexed     |
| `email`                      | string                    | Unique, lowercase              |
| `name`                       | string                    | Required, lowercase            |
| `password`                   | string                    | Hashed via bcrypt (never returned) |
| `avatar`                     | `{ url, publicId }`       | Cloudinary                     |
| `phoneNumber`                | `{ countryCode, number }` | Optional                       |
| `age`                        | number                    | Optional                       |
| `gender`                     | string                    | `male`, `female`, `other`      |
| `address`                    | string                    | Optional                       |
| `organization`               | string                    | Optional                       |
| `isEmailVerified`            | boolean                   | Default `false`                |
| `refreshToken`               | string                    | Stored server-side             |
| `emailVerificationToken`     | string                    | SHA-256 hash                   |
| `emailVerificationTokenExpiry`| string                   | Timestamp                      |
| `forgetPasswordToken`        | string                    | SHA-256 hash                   |
| `forgetPasswordExpiry`       | string                    | Timestamp                      |
| `addMemberToken`             | string                    | SHA-256 hash (project invite)  |
| `addMemberTokenExpiry`       | string                    | Timestamp                      |

**Methods:** `isPasswordCorrect()`, `generateAccessToken()`, `generateRefreshToken()`, `generateTempararyTokens()`

**Pre-save hook:** Hashes password with bcrypt (cost factor 10) when modified.

---

### Project (`project`)

| Field                | Type       | Notes     |
| -------------------- | ---------- | --------- |
| `projectName`        | string     | Required  |
| `projectDescription` | string     | Optional  |
| `admins`             | ObjectId[] | Ref: User |
| `projectManagers`    | ObjectId[] | Ref: User |
| `members`            | ObjectId[] | Ref: User |

---

### Task (`tasks`)

| Field         | Type              | Notes                              |
| ------------- | ----------------- | ---------------------------------- |
| `name`        | string            | Required                           |
| `projectId`   | ObjectId          | Ref: Project                       |
| `description` | string            | Optional                           |
| `startDate`   | Date              | Default: now                       |
| `endDate`     | Date              | Default: now + 1 day               |
| `priority`    | string            | `High`, `Medium`, `Low`            |
| `status`      | string            | `TODO`, `IN PROGRESS`, `COMPLETED` |
| `progress`    | number            | 0–100                              |
| `assigned`    | `[{ id, email }]` | Assigned members                   |

---

### SubTask (`subTasks`)

Same fields as Task, plus:

| Field    | Type     | Notes     |
| -------- | -------- | --------- |
| `taskId` | ObjectId | Ref: Task |

---

### Notes (`Notes`)

| Field       | Type     | Notes    |
| ----------- | -------- | -------- |
| `projectId` | ObjectId | Required, indexed |
| `content`   | string   | Required |

---

### Task File (`taskFile`)

| Field      | Type     | Notes                    |
| ---------- | -------- | ------------------------ |
| `url`      | string   | Cloudinary URL           |
| `taskId`   | ObjectId | Parent task              |
| `fileName` | string   | Original filename        |
| `fileKind` | string   | Cloudinary resource type |
| `publicId` | string   | Cloudinary public ID     |

---

### Subtask File (`subtaskFile`)

| Field       | Type     | Notes                    |
| ----------- | -------- | ------------------------ |
| `url`       | string   | Cloudinary URL           |
| `taskId`    | ObjectId | Parent task              |
| `subTaskId` | ObjectId | Parent subtask           |
| `fileName`  | string   | Original filename        |
| `fileKind`  | string   | Cloudinary resource type |
| `publicId`  | string   | Cloudinary public ID     |

---

## External Services

### Cloudinary

- Configured via `CLOUDNARY_NAME`, `CLOUDNARY_APIKEY`, `CLOUDNARY_APIPASSWORD`
- Upload folder default: `projecthaus/all`
- Resource type: `auto` (detects image, video, raw, etc.)
- Local temp files in `public/tmp/` are deleted after upload
- `deleteFromCloudinary(publicId, resourceType)` used when removing avatars and task/subtask files

### Email (Nodemailer + Mailgen)

- SMTP configured via Mailtrap env vars
- From address: `"projekthaus" <projekthaus2@gmail.com>`
- Email templates:
  - **Email verification** — sent on register and resend
  - **Password reset** — sent on forget-password
  - **Project invite** — sent when admin adds a member
  - **Task/subtask assignment** — sent when members are assigned

---

## Quick API Summary

| Method | Endpoint                                                                | Auth           |
| ------ | ----------------------------------------------------------------------- | -------------- |
| GET    | `/api/v1/healthcheck/`                                                  | —              |
| POST   | `/api/v1/auth/register`                                                 | —              |
| GET    | `/api/v1/auth/verify-email-address/:token/`                             | —              |
| POST   | `/api/v1/auth/login`                                                    | —              |
| POST   | `/api/v1/auth/forget-password`                                          | —              |
| POST   | `/api/v1/auth/reset-password/:token/`                                   | —              |
| GET    | `/api/v1/auth/refreshTokens`                                            | Refresh token  |
| GET    | `/api/v1/auth/me`                                                       | JWT            |
| GET    | `/api/v1/auth/resendEmailVerification`                                  | JWT            |
| GET    | `/api/v1/auth/logout`                                                   | JWT            |
| POST   | `/api/v1/auth/change-avatar`                                            | JWT            |
| PUT    | `/api/v1/auth/update-info`                                              | JWT            |
| POST   | `/api/v1/auth/change-password`                                          | JWT            |
| POST   | `/api/v1/project/create-project`                                        | JWT            |
| PUT    | `/api/v1/project/:projectId/update-project`                             | JWT + Admin    |
| GET    | `/api/v1/project/:projectId/get-the-project`                            | JWT + Member   |
| GET    | `/api/v1/project/listAll`                                               | JWT            |
| POST   | `/api/v1/project/:projectId/add-member`                                 | JWT + Admin    |
| GET    | `/api/v1/project/:projectId/:email/htmlForm`                            | —              |
| POST   | `/api/v1/project/:projectId/join-the-project/:token/`                   | —              |
| POST   | `/api/v1/project/:projectId/join-project`                               | —              |
| GET    | `/api/v1/project/:projectId/peoples`                                    | JWT + Member   |
| DELETE | `/api/v1/project/:projectId/remove-member`                              | JWT + Admin    |
| POST   | `/api/v1/project/:projectId/changeroles`                                | JWT + Admin    |
| POST   | `/api/v1/notes/:projectId/create-note`                                  | JWT + Admin    |
| PUT    | `/api/v1/notes/:projectId/:noteId/update-note`                          | JWT + Admin    |
| DELETE | `/api/v1/notes/:projectId/:noteId/delete-note`                          | JWT + Admin    |
| GET    | `/api/v1/notes/:projectId/list-notes`                                   | JWT + Member   |
| GET    | `/api/v1/notes/:projectId/:noteId/get-note`                             | JWT + Member   |
| POST   | `/api/v1/task/:projectId/create-task`                                   | JWT + Admin/PM |
| PUT    | `/api/v1/task/:projectId/:taskId/update-task`                           | JWT + Admin/PM |
| DELETE | `/api/v1/task/:projectId/:taskId/delete-task`                           | JWT + Admin/PM |
| GET    | `/api/v1/task/:projectId/:taskId/get-task`                              | JWT + Member   |
| GET    | `/api/v1/task/:projectId/get-all-tasks`                                 | JWT + Member   |
| POST   | `/api/v1/task/:projectId/:taskId/assign-task`                           | JWT + Admin/PM |
| DELETE | `/api/v1/task/:projectId/:taskId/delete-assigned-member`                | JWT + Admin/PM |
| PUT    | `/api/v1/task/:projectId/:taskId/updationOfTask`                        | JWT + Member   |
| POST   | `/api/v1/task/:projectId/:taskId/attach-files`                          | JWT + Admin/PM |
| GET    | `/api/v1/task/:projectId/:taskId/get-all-files`                         | JWT + Member   |
| DELETE | `/api/v1/task/:projectId/:taskId/:fileId/delete-the-file`               | JWT + Admin/PM |
| POST   | `/api/v1/subtask/:projectId/:taskId/create-subtask`                     | JWT + Admin/PM |
| PUT    | `/api/v1/subtask/:projectId/:taskId/:subTaskId/update-subtask`          | JWT + Admin/PM |
| DELETE | `/api/v1/subtask/:projectId/:taskId/:subTaskId/delete-subtask`          | JWT + Admin/PM |
| GET    | `/api/v1/subtask/:projectId/:taskId/:subTaskId/get-the-subtask`         | JWT + Member   |
| GET    | `/api/v1/subtask/:projectId/:taskId/get-all-subtask`                    | JWT + Member   |
| POST   | `/api/v1/subtask/:projectId/:taskId/:subTaskId/assign-subTask`          | JWT + Admin/PM |
| DELETE | `/api/v1/subtask/:projectId/:taskId/:subTaskId/delete-assigned`         | JWT + Admin/PM |
| PUT    | `/api/v1/subtask/:projectId/:taskId/:subTaskId/update-assigned-subtask` | JWT + Member   |
| POST   | `/api/v1/subtask/:projectId/:taskId/:subTaskId/attach-files-subtask`    | JWT + Admin/PM |
| GET    | `/api/v1/subtask/:projectId/:taskId/:subTaskId/get-all-files`           | JWT + Member   |
| DELETE | `/api/v1/subtask/:projectId/:taskId/:subTaskId/:fileId/delete-the-file` | JWT + Admin/PM |

**Legend:** JWT = access token required | Admin = project admin | PM = project manager | Member = any project member (admin, PM, or member)
