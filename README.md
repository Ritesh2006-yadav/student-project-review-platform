# Student Project Review Platform

A full-stack student project submission and faculty verification portal built with `Node.js`, `Express`, `MongoDB`, and plain `HTML`, `CSS`, and `JavaScript`.

The project allows students to create accounts, submit project work, and track approval status, while faculty can review submissions and approve or reject them from a separate dashboard.

## Highlights

- Shared student/faculty authentication UI
- Student sign up and login
- Faculty login with role-aware access
- Project submission with file upload
- Student dashboard, project list, and certificates view
- Faculty dashboard for approval and rejection workflow
- JWT-based authentication
- MongoDB-backed user and project storage

## Tech Stack

- Backend: `Node.js`, `Express`
- Database: `MongoDB`, `Mongoose`
- Authentication: `JWT`, `bcryptjs`
- Uploads: `multer`
- Frontend: `HTML`, `CSS`, `Vanilla JavaScript`

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

## Main Features

### Student

- Register with name, email, and password
- Log in from the shared portal
- Update skills
- Submit projects with:
  - title
  - description
  - category
  - GitHub link
  - optional certification/supporting file
- View submitted projects and their status
- See approved items in `My Certificates`

### Faculty

- Log in from the shared portal by switching to faculty mode
- View all submitted projects
- Approve or reject submissions
- Add rejection feedback
- Monitor project counts from the faculty dashboard

## Authentication Flow

- `/` serves the shared login page
- Students can register and log in from the same auth page
- Faculty use the same auth page but switch to `Faculty`
- Role checks in the frontend prevent:
  - faculty accounts from signing in through student mode
  - student accounts from signing in through faculty mode

## Environment Variables

Create a `.env` file in the project root with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Notes:

- `PORT` is optional locally because the server already defaults to `3000`
- On Render or other hosting providers, do not manually set `PORT` unless required

## Installation

```bash
npm install
```

## Run Locally

```bash
npm start
```

The app starts from [server.js](/Users/riteshyadav/Documents/fullstack/server.js).

Default local URL:

```txt
http://localhost:3000
```

## API Routes

### Auth

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

## Frontend Routes

- `/` -> shared student/faculty auth page
- `/dashboard` -> student dashboard
- `/add-project` -> project submission page
- `/projects` -> student projects page
- `/certificates` -> approved certificates page
- `/faculty-dashboard.html` -> faculty dashboard

## File Upload Notes

Project uploads are handled by `multer` and stored in the local `uploads/` folder.

Supported frontend file types:

- PDF
- DOC
- DOCX
- PPT
- PPTX
- Images

Important:

- local file storage is fine for development
- local uploads are not ideal for production hosting
- for production, use cloud storage such as Cloudinary, AWS S3, or similar

## Render Deployment

Use these settings on Render:

- Service Type: `Web Service`
- Environment: `Node`
- Root Directory: leave empty if the repo root is this project
- Build Command: `npm install`
- Start Command: `npm start`

Required environment variables:

- `MONGODB_URI`
- `JWT_SECRET`

Do not add:

- `PORT`

## Important Files

- [server.js](/Users/riteshyadav/Documents/fullstack/server.js) -> app entry point
- [config/db.js](/Users/riteshyadav/Documents/fullstack/config/db.js) -> MongoDB connection
- [controllers/authController.js](/Users/riteshyadav/Documents/fullstack/controllers/authController.js) -> register/login/profile logic
- [controllers/projectController.js](/Users/riteshyadav/Documents/fullstack/controllers/projectController.js) -> project CRUD and portfolio logic
- [controllers/facultyController.js](/Users/riteshyadav/Documents/fullstack/controllers/facultyController.js) -> faculty review workflow
- [frontend/index.html](/Users/riteshyadav/Documents/fullstack/frontend/index.html) -> shared auth UI
- [frontend/faculty-dashboard.html](/Users/riteshyadav/Documents/fullstack/frontend/faculty-dashboard.html) -> faculty dashboard

## Security Notes

- Never commit real secrets to the repository
- Rotate any exposed database password immediately
- Use a long random value for `JWT_SECRET`

## License

This project is intended for educational and portfolio use.
