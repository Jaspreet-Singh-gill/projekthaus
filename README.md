# ProjektHaus

ProjektHaus is a modern, collaborative project management web application designed for students, teams, professionals, and organizations. It provides a robust suite of tools to manage workflows, assign tasks, collaborate on notes, analyze progress, and coordinate efforts in a structured, role-based environment.

---

## 🚀 Features

### 🏢 Workspace & Project Management
- **Create & Manage Projects:** Initiate projects with custom names and descriptions.
- **Role-Based Access Control (RBAC):**
  - **Admin:** Full project control, manage members, notes CRUD, update project details.
  - **Project Manager:** Create/update/delete tasks and subtasks, assign members, attach/delete files.
  - **Member:** View tasks, subtasks, and notes; update progress on assigned tasks/subtasks.
- **Project Invitations:** Securely invite team members using token-based links expiring in 20 minutes.

### 📋 Task & Subtask Management
- **Hierarchical Structuring:** Break down projects into main tasks and further into subtasks.
- **Detailed Metadata:** Set status (Todo, In Progress, Completed, etc.), priority levels (Low, Medium, High), due dates, and descriptions.
- **Assignees:** Assign team members to specific tasks and subtasks.
- **File Attachments:** Upload files (up to 10MB per file, max 5 files per request) directly to tasks and subtasks.

### 📝 Collaborative Notes
- Create, view, update, and delete shared project-level notes for team documentation, brainstorming, and minutes of meetings.

### 📊 Project Analytics
- Track project progress, task status distribution, and priority breakdowns using visual, interactive charts.

### 🔒 Security & Backend Reliability
- **Dual-Token Authentication:** JWT Access and Refresh tokens (via HTTP-Only cookies or Authorization headers).
- **Email Verification & Password Reset:** Token-based flow with transactional emails powered by Nodemailer & Mailgen.
- **Rate Limiting:** Protect APIs against abuse (global rate limit of 200 requests/10 min; auth endpoints limited to 5 requests/10 min per IP).
- **Validation & Sanitization:** Strict request validation using `express-validator`.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 19** | Modern, declarative component library |
| | **Vite** | Fast Next-gen frontend tooling |
| | **Tailwind CSS v4** | Utility-first CSS styling framework |
| | **React Router v7** | Routing and page navigation |
| | **Zustand** | Light, fast state management |
| | **TanStack Query (React Query)** | Client-side caching and data-fetching |
| | **TanStack Table** | High-performance datatable rendering |
| | **Recharts** | Interactive charting and project analytics |
| | **Sonner** | Clean and responsive toast notifications |
| **Backend** | **Node.js & Express 5** | High-performance, async backend API framework |
| | **Mongoose 9 (MongoDB)** | ODM for object modeling and DB interactions |
| | **Multer & Cloudinary** | Disk storage middleware and cloud asset management |
| | **Nodemailer & Mailgen** | Transactional email generation and transport |
| | **bcryptjs** | Secure password hashing |

---

## 📁 Project Structure

The project is organized as a monorepo-style structure:

```text
projekthaus/
├── client/                     # Frontend client (React + Vite)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── api/                # Axios API instance & request interceptors
│   │   ├── components/         # Reusable UI components (Protected routes, tables, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layout.jsx          # Root layout
│   │   ├── pages/              # Application views (dashboard, taskboard, auth, etc.)
│   │   ├── store/              # Zustand global store
│   │   └── main.jsx            # React app entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API server (Express + MongoDB)
│   ├── public/                 # Static files & local upload tmp folder
│   ├── src/
│   │   ├── app/                # Express application configurations
│   │   ├── controllers/        # Route controllers (auth, project, task, notes, etc.)
│   │   ├── db/                 # Database connection logic
│   │   ├── middlewares/        # Authentication, RBAC, file upload & error middlewares
│   │   ├── models/             # Mongoose schemas (User, Project, Task, Subtask, Notes)
│   │   ├── routes/             # Express API endpoints routing
│   │   ├── validators/         # Request body validation schemas
│   │   ├── utils/              # API response formatting, rate limiting, and helpers
│   │   └── index.js            # Server entry point
│   ├── package.json
│   └── documentation.md        # Detailed backend API reference
```

---

## ⚙️ Getting Started

### Prerequisites
Before running the application, make sure you have the following installed/configured:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas connection URI)
- A [Cloudinary](https://cloudinary.com/) account (for file/avatar uploads)
- An SMTP server configuration or a [Mailtrap](https://mailtrap.io/) account (for emails)

---

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and fill in the required environment variables:
   ```env
   PORT=3000
   MONGO_URL=your_mongodb_connection_uri
   CORS_ORIGIN=http://localhost:5173
   
   # JWT Configuration
   ACCESS_TOKEN_SECREAT=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECREAT=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   
   # Frontend Redirect / Email Domains
   emailVerificationAddress=http://localhost:5173/waitingPage
   forgetpassword=http://localhost:5173/reset-password
   projectDomain=http://localhost:5173/project
   SITE_MAIN_URL=http://localhost:5173
   
   # Cloudinary Keys
   CLOUDNARY_NAME=your_cloudinary_name
   CLOUDNARY_APIKEY=your_cloudinary_api_key
   CLOUDNARY_APIPASSWORD=your_cloudinary_api_secret
   
   # Email configuration (SMTP / Mailtrap example)
   MAILTRAP_HOST=sandbox.smtp.mailtrap.io
   MAILTRAP_PORT=2525
   MAILTRAP_USER=your_mailtrap_user
   MAILTRAP_PASS=your_mailtrap_password
   
   NODE_ENV=development
   ```
4. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:3000`.*

---

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory and set the API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client runs by default on `http://localhost:5173`.*

---

## 💡 Projects, Capabilities & Collaboration

ProjektHaus is designed to facilitate seamless teamwork through a structured hierarchy of projects, granular roles, and high-fidelity collaborative features.

### 📁 Projects & Onboarding Flow
Projects serve as the main collaborative workspace containers.
* **Creation:** Any verified user can create a project, automatically becoming the **Admin** of that project.
* **Onboarding & Invitations:** Admins can invite new or existing members by entering their email address. The system generates a secure, tokenized invite link (valid for 20 minutes) and emails it to the recipient.
* **Flexible Onboarding:** 
  * If the invitee already has an account, clicking the link securely adds them to the project database and redirects them to the project dashboard.
  * If the invitee is new, they are guided through a streamlined **Register & Join** page, creating their profile and joining the project in a single step.

---

### 👥 Role-Based Capabilities
ProjektHaus enforces strict role-based access control (RBAC) to delegate responsibilities cleanly within a project:

#### 1. 👑 Admin
The project creator or designated admins hold complete authority over the workspace:
* **Project Settings:** Edit project metadata (name, description) or delete the project.
* **Member Management:** Add, promote (to Project Manager/Admin), demote, or remove members from the workspace.
* **Workspace CRUD:** Full permissions to create, edit, or delete notes, tasks, subtasks, and files.

#### 2. 💼 Project Manager
Project Managers handle execution and operational logistics:
* **Task Management:** Create, update, or archive tasks and subtasks.
* **Resource Assignment:** Assign tasks to specific members.
* **Asset Control:** Upload, organize, and delete project documents and task/subtask file attachments.

#### 3. 👤 Member
Members are the execution core of the project:
* **Task Progression:** View all tasks/subtasks and update the progress status of the tasks/subtasks assigned to them.
* **Collaboration:** Read and contribute to shared project notes and access attached files/documents.

---

### 🛠️ Collaborative Features & Abilities

* **Granular Task Decomposition:** Tasks can be broken down into nested **Subtasks**. This permits tracking smaller deliverables independently with unique descriptions, due dates, and individual assignees.
* **Cloud File Integration:** Team members can upload design mockups, documents, and ZIP files directly to tasks/subtasks (up to 10MB per file, max 5 files per request). Files are securely stored on Cloudinary.
* **Transactional Email Alerts:** Powered by Nodemailer and Mailgen, the application automatically sends rich HTML emails to alert users when:
  * They are assigned to a task or subtask.
  * They are invited to join a project.
  * Security events occur (email verification, password reset).
* **Interactive Project Analytics:** The project dashboard provides visual insights into workspace health using dynamic charts (powered by Recharts). Teams can view:
  * **Task Status Distribution:** A visual breakdown of tasks in *Todo*, *In Progress*, *Review*, and *Completed* states.
  * **Priority Breakdowns:** Metrics on task priorities (*Low*, *Medium*, *High*) to prevent team burnout and identify bottlenecks.
* **Shared Documentation Hub (Notes):** Live collaborative notes inside each project allow teams to write, update, and review project documentation, requirements, meeting logs, and guides in one central location.

---

## 🛡️ License

This project is licensed under the ISC License. Created by [Jaspreet Singh](https://github.com/Jaspreet-Singh-gill).
