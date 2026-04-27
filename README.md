# Student Project Review Platform
abhi
A full-stack student project review and verification portal built with `Node.js`, `Express`, `MongoDB`, and plain `HTML/CSS/Vanilla JavaScript`.

The platform supports:
- Student sign up and login
- Project submission with file upload
- Faculty login and project review
- Approval/rejection workflow
- Student dashboard and approved portfolio view

## Tech Stack

- Backend: `Node.js`, `Express`
- Database: `MongoDB` with `Mongoose`
- Auth: `JWT`, `bcryptjs`
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
```

## Features

### Student
- Create an account
- Log in securely
- Add skills
- Submit projects with:
  - title
  - description
  - GitHub URL
  - certification/supporting file
- View project status
- Edit or delete submitted projects
- See approved projects in portfolio view

### Faculty
- Log in with faculty credentials
- Review all student submissions
- Approve or reject projects
- Add rejection feedback

## Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3000
```

Notes:
- `PORT` is optional locally because the app defaults to `3000`
- In production, the hosting platform usually provides `PORT`

## Installation

```bash
npm install
```

## Run Locally

```bash
npm start
```

Server starts from:
- [server.js](/Users/riteshyadav/Documents/fullstack/server.js)

Default local URL:

```txt
http://localhost:3000
```

## Main Routes

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

## Frontend Pages

- `/` → student login / sign up
- `/faculty` → faculty login
- `/dashboard` → student dashboard
- `/add-project` → project submission
- `/projects` → student project list
- `/faculty-dashboard.html` → faculty dashboard

## File Uploads

Project files are uploaded through `multer` and stored in the local `uploads/` folder.

Supported frontend file types:
- PDF
- DOC
- DOCX
- PPT
- PPTX
- Images

Important production note:
- Local `uploads/` storage is fine for development
- For production deployment, use cloud storage such as Cloudinary, AWS S3, or Firebase Storage

## Deployment Notes

If deploying to a Node/Express-compatible host:
- Preset: `Express`
- Root directory: `./`
- Install command: `npm install`

Required environment variables:
- `MONGODB_URI`
- `JWT_SECRET`

## Security Note

Do not commit real secrets to the repository.

If you accidentally expose:
- MongoDB password
- JWT secret

rotate them immediately before deployment.

## License

This project is for educational and portfolio use.
