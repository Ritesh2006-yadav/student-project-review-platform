# Student Project Review Platform

A full-stack academic project submission and verification portal built with `Node.js`, `Express`, `MongoDB`, and plain `HTML`, `CSS`, and `JavaScript`.

This project is designed for two user roles:
- `Student` users can create accounts, log in, submit projects, manage skills, and track approval status.
- `Faculty` users can log in from the same portal, review student submissions, and approve or reject projects with feedback.

## Current Project Flow

The current version uses a **single shared portal at `http://localhost:3000/`**.

From the same page:
- students can log in
- students can register
- faculty can switch to faculty mode and log in

After login:
- student users go to the student dashboard
- faculty users go to the faculty dashboard

So the new project does **not** use a separate faculty login page as the main entry anymore. Both roles start from the same root URL.

## Tech Stack

- Backend: `Node.js`, `Express`
- Database: `MongoDB`, `Mongoose`
- Authentication: `JWT`, `bcryptjs`
- File Uploads: `multer`
- Frontend: `HTML`, `CSS`, `Vanilla JavaScript`

## Features

### Student Features

- Student registration
- Student login from the shared portal
- Skills management
- Project submission
- File upload support
- Project status tracking
- Approved project certificates view

### Faculty Features

- Faculty login from the shared portal
- Review all submitted projects
- Approve projects
- Reject projects with feedback
- Dashboard with submission overview

## Shared Authentication UI

The homepage now contains:
- Student mode
- Faculty mode
- Student login
- Student sign up
- Faculty login

Role protection is handled in the frontend:
- faculty accounts cannot sign in through student mode
- student accounts cannot sign in through faculty mode

Main shared auth file:
- [frontend/index.html](/Users/riteshyadav/Documents/fullstack/frontend/index.html)

Auth behavior:
- [frontend/js/auth.js](/Users/riteshyadav/Documents/fullstack/frontend/js/auth.js)

## Project Structure

```txt
config/
controllers/
frontend/
middleware/
models/
routes/
uploads/
server.js
package.json
README.md
```

## Important Frontend Pages

- `/` -> shared Student and Faculty portal
- `/dashboard` -> student dashboard
- `/projects` -> student projects page
- `/add-project` -> project submission page
- `/certificates` -> approved certificates page
- `/faculty-dashboard.html` -> faculty review dashboard after faculty login

Note:
- `/faculty` is no longer a separate login page
- it now redirects to `/`

## Backend Entry

The application starts from:
- [server.js](/Users/riteshyadav/Documents/fullstack/server.js)

Local default URL:

```txt
http://localhost:3000
```

## Environment Variables

Create a `.env` file in the root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Notes:
- `PORT` is optional locally because the app already defaults to `3000`
- on Render, do not manually add `PORT`

## Installation

```bash
npm install
```

## Run Locally

```bash
npm start
```

## API Routes

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/skills`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/portfolio`

### Faculty

- `GET /api/faculty/projects`
- `PUT /api/faculty/projects/:id`

## File Uploads

Project uploads use `multer` and are stored in the local `uploads/` folder.

Supported file types in the frontend:
- PDF
- DOC
- DOCX
- PPT
- PPTX
- Images

Important production note:
- local uploads work for development
- for production hosting, cloud storage is better
- recommended options: Cloudinary, AWS S3, Firebase Storage

## Render Deployment

Use these Render settings:

- Service Type: `Web Service`
- Environment: `Node`
- Root Directory: leave empty if this project is the repo root
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables required on Render:
- `MONGODB_URI`
- `JWT_SECRET`

Do not add:
- `PORT`

## Important Files

- [server.js](/Users/riteshyadav/Documents/fullstack/server.js) -> Express app entry point
- [config/db.js](/Users/riteshyadav/Documents/fullstack/config/db.js) -> MongoDB connection
- [controllers/authController.js](/Users/riteshyadav/Documents/fullstack/controllers/authController.js) -> register/login/profile logic
- [controllers/projectController.js](/Users/riteshyadav/Documents/fullstack/controllers/projectController.js) -> project CRUD logic
- [controllers/facultyController.js](/Users/riteshyadav/Documents/fullstack/controllers/facultyController.js) -> faculty approval/rejection logic
- [frontend/index.html](/Users/riteshyadav/Documents/fullstack/frontend/index.html) -> shared Student/Faculty portal
- [frontend/dashboard.html](/Users/riteshyadav/Documents/fullstack/frontend/dashboard.html) -> student dashboard
- [frontend/faculty-dashboard.html](/Users/riteshyadav/Documents/fullstack/frontend/faculty-dashboard.html) -> faculty dashboard

## Security Notes

- Never commit real secrets
- Change exposed database passwords immediately
- Use a strong random `JWT_SECRET`

## License

This project is intended for educational and portfolio use.
