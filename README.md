# EduManage — Student Management System

A full-stack web application for managing students, courses, and enrolments through an administrator dashboard.

## Overview

EduManage provides a centralized interface for administrators to manage student records and courses, view dashboard statistics, and maintain account settings.

## Application Screenshot

![EduManage Admin Dashboard](screenshots/dashboard.png)

## Features

- **Admin Authentication** — Administrator login with JWT-based authentication.
- **Dashboard** — Overview of student counts, courses, and enrolment statistics.
- **Student Management** — Add, view, edit, and delete student records.
- **Search and Filtering** — Find students by name or email and filter by course.
- **Course Management** — Create, view, and manage courses.
- **Password Management** — Change the administrator password.
- **Database Integration** — Store and retrieve student, course, and admin records using MongoDB.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| Development Tools | VS Code, Git, GitHub |

## Project Structure

```text
fullstack/
├── .gitignore
├── README.md
├── screenshots/
│   └── dashboard.png
└── backend/
    ├── config/
    ├── controller/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── scripts/
    ├── server.ts
    ├── package.json
    └── Frontend/
        ├── public/
        ├── src/
        │   ├── components/
        │   ├── App.tsx
        │   └── main.tsx
        ├── package.json
        └── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB, either local or MongoDB Atlas
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/LinshaMS/edumanage-student-management.git
cd edumanage-student-management
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the environment variables required by the backend configuration.

Keep database credentials, JWT secrets, and administrator credentials private. Never commit your real `.env` file.

### 3. Start the Backend

From the `backend` directory, run:

```bash
npx tsx server.ts
```

The backend uses port `5000` by default.

### 4. Start the Frontend

Open a **second terminal** from the repository root and run:

```bash
cd backend/Frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## Security Notes

- Passwords are hashed before storage.
- Protected requests use JWT authentication.
- Environment variables must be configured locally and kept out of version control.
- Production deployment should use HTTPS and appropriately configured CORS.

## Future Improvements

- Deploy the frontend and backend.
- Add automated tests.
- Improve accessibility and responsive layouts.
- Add pagination and additional reporting features where needed.

## Author

**Linsha Mary Sabu**

Computer Science and Engineering graduate interested in full-stack development.

**GitHub:** [LinshaMS](https://github.com/LinshaMS)

## License

This project is available for learning and portfolio demonstration. A formal open-source license can be added if the project is intended for reuse by others.
