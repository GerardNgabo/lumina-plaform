# LUMINA Platform

A lightweight campus social platform built with React, Node.js, Express, and SQLite. Supports user authentication, creating posts with media, likes, comments, anonymous posting, and a live analytics dashboard.

## Features

- User Registration & Login (JWT Auth)
- Create text/image/video posts
- Anonymous posting
- Like/react to posts
- Comment on posts
- Live analytics dashboard with charts
- User profiles with editable display names
- Responsive design (desktop + mobile)

## Tech Stack

- **Frontend:** React 19, Vite, React Router v6, CSS Modules, Chart.js
- **Backend:** Node.js, Express, SQLite, JWT, Multer

## Quick Start

### Backend

```bash
cd backend
npm install
npm start
```

Server runs at `http://localhost:5005`

### Frontend

```bash
cd lumina-frontend
npm install
npm run dev
```

Dev server runs at `http://localhost:5173`

## Project Structure

```
LUMINA-platform/
├── backend/
│   ├── routes/        # API routes (auth, posts, comments)
│   ├── middleware/     # JWT auth middleware
│   ├── uploads/       # User-uploaded media
│   ├── db.js          # SQLite connection & schema
│   ├── server.js      # Express server
│   └── package.json
├── lumina-frontend/
│   ├── src/
│   │   ├── api/       # API client with auth
│   │   ├── components/# Reusable React components
│   │   ├── context/   # Auth context provider
│   │   ├── pages/     # Page components
│   │   └── styles/    # CSS Modules
│   ├── index.html
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login, returns JWT |
| PUT | /api/auth/update | Yes | Update display name |
| GET | /api/posts | No | Get all posts |
| POST | /api/posts | Yes | Create post |
| POST | /api/posts/:id/like | Yes | Toggle like |
| GET | /api/posts/:id/likes | No | Get like count |
| POST | /api/comments | Yes | Add comment |
| GET | /api/comments/:post_id | No | Get comments |

## License

MIT License
