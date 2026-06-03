# NAVAVERSE

NAVAVERSE is a full-stack MERN platform for blogs, jobs, events, courses, startups, user profiles, admin approvals, registrations, comments, subscriptions, and AI-assisted blog generation.

## Features

- JWT user registration, login, profile, and protected dashboard flows
- Google OAuth login and registration
- Blog creation, AI generation, comments, ratings, featured/upcoming workflows, and admin moderation
- Jobs, applications, resume uploads, and admin approvals
- Events, registrations, dashboards, PDF confirmation, and admin approvals
- Courses, lessons, comments, enrollments, and admin review flows
- Startup listings, discussions, collaboration requests, and approval workflows
- Admin analytics, notifications, comments, content queues, and role-protected routes
- Responsive React UI with route-level lazy loading and production code splitting

## Screenshots

Add production screenshots here after deployment:

- Homepage
- Blogs
- Jobs
- Events
- Courses
- Startups
- Admin Dashboard

## Tech Stack

Frontend: React, Vite, React Router, Axios, normal CSS, Lucide React, Framer Motion, Quill, jsPDF, Google OAuth.

Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer, Nodemailer, Helmet, CORS, Express Rate Limit, Google Auth Library, Google GenAI.

Deployment: Vercel for frontend, Render for backend, MongoDB Atlas for database.

## Installation

```bash
cd client
npm install
npm run dev
```

```bash
cd server
npm install
npm start
```

## Environment Variables

Frontend `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

Backend `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/navaverse
JWT_SECRET=replace_with_a_long_random_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
CLIENT_URL=http://localhost:5173
```

Optional backend variables:

```env
API_URL=https://navaverse-api.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_app_password
SMTP_FROM="NAVAVERSE <your_email@example.com>"
```

## Deployment Guide

### Frontend: Vercel

1. Set root directory to `client`.
2. Set build command to `npm run build`.
3. Set output directory to `dist`.
4. Add environment variables:
   - `VITE_API_URL=https://navaverse-api.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID=<google-client-id>`
5. Keep `client/vercel.json` for SPA refresh routing.

### Backend: Render

1. Use `render.yaml` from the repository root or create a Render Web Service.
2. Set root directory to `server`.
3. Set build command to `npm ci`.
4. Set start command to `npm start`.
5. Add environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<mongodb-atlas-uri>`
   - `JWT_SECRET=<strong-secret>`
   - `GOOGLE_CLIENT_ID=<google-client-id>`
   - `GOOGLE_CLIENT_SECRET=<google-client-secret>`
   - `CLIENT_URL=https://navaverse.vercel.app`
   - `API_URL=https://navaverse-api.onrender.com`

### MongoDB Atlas

Create a cluster, allow Render outbound access, create a database user, and use the Atlas connection string as `MONGODB_URI`.

### Google OAuth

Authorized JavaScript origin:

```text
https://navaverse.vercel.app
```

Authorized redirect URI:

```text
https://navaverse-api.onrender.com/auth/google/callback
```

## Live Demo

Frontend: `https://navaverse.vercel.app`

Backend: `https://navaverse-api.onrender.com`

## Contributors

- NAVAVERSE Team
