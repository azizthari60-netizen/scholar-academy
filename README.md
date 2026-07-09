# The Scholar Coaching Academy — Umerkot

A full-stack academy management system with a public landing page, admission inquiries, and role-based portals for **Admin**, **Teachers**, and **Students**.

## Features

### Public Website
- Modern landing page with programs, faculty, gallery, and contact
- Dark / light theme toggle
- Admission inquiry form (saved to database)
- WhatsApp & phone contact buttons
- Google Maps location embed

### Admin Portal
- Dashboard with live stats
- Student & teacher CRUD
- Results, fees, timetable management
- Review & approve admission requests
- Post notices

### Student Portal
- Personal dashboard with attendance, scores, schedule
- View assignments, results, timetable, fees, notices

### Teacher Portal
- Class schedule & student progress
- Upload marks / results
- Mark attendance
- Create assignments

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (JSON Web Tokens)

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### Installation

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

Open **http://localhost:5000** in your browser.

## Demo Login Credentials

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@scholar.edu   | admin123    |
| Teacher | ahmed@scholar.edu   | teacher123  |
| Student | ayesha@scholar.edu  | student123  |

## Environment Variables

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/scholar_db
JWT_SECRET=your_secure_secret_here
```

## Project Structure

```
frontend/
  index.html              Landing page
  pages/auth/login.html   Login page
  pages/admin/            Admin portal pages
  pages/student/          Student portal pages
  pages/teacher/          Teacher portal pages
  assets/js/api.js        API client & auth helpers
backend/
  src/server.js           Express server
  src/models/             MongoDB schemas
  src/routes/             API endpoints
  src/seed.js             Demo data seeder
```

## Customization

- Replace `frontend/assets/photo/scholar-logo.svg` with your academy logo
- Update phone/WhatsApp numbers in `frontend/index.html` (search for `923001234567`)
- Replace Unsplash gallery/faculty images with real photos
- Change faculty names in `frontend/index.html` to match your staff

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/auth/login       | Login                    |
| GET    | /api/auth/me          | Current user (protected) |
| POST   | /api/admissions       | Submit admission inquiry |
| GET    | /api/students         | List students            |
| GET    | /api/teachers         | List teachers            |
| GET    | /api/results          | List results             |
| GET    | /api/fees             | List fees                |
| GET    | /api/notices          | List notices             |
| GET    | /api/timetable        | List timetable           |
| GET    | /api/assignments      | List assignments         |
| GET    | /api/dashboard/admin  | Admin dashboard data     |
| GET    | /api/dashboard/student| Student dashboard data   |
| GET    | /api/dashboard/teacher| Teacher dashboard data   |

## Deployment

This project is ready to be deployed to Vercel by connecting the repository and adding the environment variables `MONGO_URI` and `JWT_SECRET`.

For local development:

```bash
npm install
npm run dev
```

For production deployment, ensure your hosting platform has:
- `MONGO_URI`
- `JWT_SECRET`
