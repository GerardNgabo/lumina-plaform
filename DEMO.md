# LUMINA Platform — Demo Guide

## What is LUMINA?

LUMINA is a lightweight campus social media platform where students can share concerns, ideas, and updates with their community. It supports real-time posting, anonymous contributions, reactions, comments, and a live analytics dashboard that tracks trending topics across campus.

## Core Features

### Authentication
- **Register** with full name, email, and password
- **Login** with email/password — returns a JWT token stored in the browser
- Session persists across page refreshes via localStorage
- Protected routes redirect unauthenticated users to the login page

### Posts & Feed
- Create text posts with optional **hashtag tags** (e.g. `#HOUSING`, `#SECURITY`, `#WIFI`)
- Upload **images or videos** alongside posts (supports JPG, PNG, MP4, WebM, MOV)
- **Anonymous posting** — toggle the "Anonymous" checkbox to hide your identity; posts appear as "Anonymous Student" with a "?" avatar
- Feed displays all posts in reverse chronological order (newest first)
- Each post shows: author avatar (initials), name, tag pill, timestamp, content, and media

### Likes
- Click the heart icon to **like/unlike** a post
- Like count updates in real time
- One like per user per post (toggle behavior)

### Comments
- Click "Reply" to expand the comment section on any post
- Type and send a reply — it appears immediately
- Comments show the commenter's name and text
- Each post has its own independent comment thread

### Dashboard (Live Analytics)
- **Total Posts** count — how many posts exist on the platform
- **Active Users** count — number of unique users who have posted
- **Trending Issues** bar chart — top 5 hashtags ranked by frequency, rendered with Chart.js
- **Trending Tags list** — same data in list format with post counts
- Auto-refreshes every **5 seconds** to simulate live monitoring

### Profile
- Displays your **avatar** (first letter of your name), full name, and email
- **Edit Profile** — click to change your display name (saved to the database)
- **My Posts** section — filtered view of only your own posts

### Admin Panel (Role-Based Access)
- **Two roles:** `user` (default) and `admin`
- **Admin navigation:** Admin users see an extra "Admin" link in the sidebar
- **User management:** View all users in a table, promote users to admin or demote back to user, delete users (cascades to their posts, likes, and comments)
- **Content moderation:** Delete any post or comment from the feed or admin panel
- **Admin badge:** Posts by admins show a red "ADMIN" badge next to their name
- **Access control:** Non-admin users who navigate to `/admin` see "Access Denied"
- **API protection:** All admin endpoints are protected by both JWT auth and admin role middleware

### Responsive Design
- **Desktop (>900px):** 3-column layout — left sidebar navigation, center feed, right trending sidebar
- **Mobile (<900px):** Single column with a fixed bottom navigation bar
- Smooth transitions and hover effects throughout

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | UI framework and build tool |
| Routing | React Router v6 | Client-side page navigation |
| Styling | CSS Modules | Scoped component styles |
| Charts | Chart.js + react-chartjs-2 | Dashboard bar chart |
| State | React Context | Authentication state management |
| Backend | Node.js + Express | REST API server |
| Database | SQLite (via sql.js) | Lightweight file-based database |
| Auth | JWT + bcryptjs | Token-based auth with password hashing |
| Uploads | Multer | Image/video file handling |
| Hosting | Netlify (frontend) + Render (backend) | Cloud deployment |

## Design Theme — Emerald Night

| Element | Color | Hex |
|---------|-------|-----|
| Page background | Near black | `#0c0c0c` |
| Card background | Dark charcoal | `#161616` |
| Hover state | Slightly lighter | `#1e1e1e` |
| Primary accent | Emerald green | `#10b981` |
| Secondary accent | Light emerald | `#34d399` |
| Main text | Light gray | `#e5e5e5` |
| Muted text | Medium gray | `#a3a3a3` |
| Borders | Emerald-tinted | `rgba(16, 185, 129, 0.15)` |
| Font | Inter | Google Fonts |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT token + role |
| PUT | `/api/auth/update` | Yes | Update display name |
| GET | `/api/auth/users` | Admin | Get all users |
| PUT | `/api/auth/users/:id/role` | Admin | Change user role (user/admin) |
| DELETE | `/api/auth/users/:id` | Admin | Delete user and all their data |
| GET | `/api/posts` | No | Get all posts (newest first) |
| POST | `/api/posts` | Yes | Create a post (supports file upload) |
| POST | `/api/posts/:id/like` | Yes | Toggle like on a post |
| GET | `/api/posts/:id/likes` | No | Get like count for a post |
| DELETE | `/api/posts/:id` | Admin | Delete a post |
| POST | `/api/comments` | Yes | Add a comment to a post |
| GET | `/api/comments/:post_id` | No | Get all comments for a post |
| DELETE | `/api/comments/:id` | Admin | Delete a comment |

## Database Schema

```
users: id, name, email (unique), password (bcrypt hash), profile_pic, role (default 'user')
posts: id, user_id, content, tag, image_url, created_at
likes: user_id + post_id (composite primary key)
comments: id, post_id, user_id, comment, created_at
```

## Project Structure

```
lumina-platform/
├── backend/
│   ├── db.js              # SQLite database connection and schema
│   ├── server.js          # Express server entry point
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js        # Register, login, update profile
│   │   ├── posts.js       # CRUD posts, likes
│   │   └── comments.js    # Add and fetch comments
│   └── uploads/           # User-uploaded media files
├── lumina-frontend/
│   ├── src/
│   │   ├── api/client.js          # Centralized API client with auth headers
│   │   ├── context/AuthContext.jsx # Auth state provider (token, user, login, logout)
│   │   ├── components/
│   │   │   ├── Layout.jsx         # App shell with sidebar nav
│   │   │   ├── PostCard.jsx       # Single post display
│   │   │   ├── PostCreate.jsx     # Post creation form
│   │   │   ├── LikeButton.jsx     # Like toggle with count
│   │   │   ├── CommentSection.jsx # Expandable comments
│   │   │   ├── TrendingSidebar.jsx# Trending tags sidebar
│   │   │   └── ProtectedRoute.jsx # Auth guard for routes
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── Home.jsx           # Feed + post creation
│   │   │   ├── Dashboard.jsx      # Analytics + charts
│   │   │   └── Profile.jsx        # User profile + edit
│   │   └── styles/                # CSS Modules (one per component)
│   └── index.html
└── README.md
```

## Demo Script

### 1. Show the Login Page
- Open the app — you land on the login screen
- Point out the LUMINA branding and Emerald Night dark theme
- Mention: "This is a React single-page app with client-side routing"

### 2. Register a New User
- Click "Sign up" link
- Fill in name, email, password
- Submit — redirected back to login
- Mention: "Passwords are hashed with bcrypt before storage"

### 3. Login
- Enter the credentials you just created
- Submit — redirected to the Home feed
- Mention: "A JWT token is issued and stored in the browser for session management"

### 4. Create a Post
- Type a message like "The wifi in Building A has been down all week"
- Add a tag like `#WIFI`
- Click Post — it appears at the top of the feed
- Mention: "Posts support text, tags, and optional media uploads"

### 5. Anonymous Posting
- Create another post, this time check the "Anonymous" box
- The post appears with "Anonymous Student" as the author and "?" as the avatar
- Mention: "Students can raise sensitive concerns without revealing their identity"

### 6. Like a Post
- Click the heart icon on any post
- The count increments
- Click again to unlike
- Mention: "One like per user per post, toggled on the backend"

### 7. Comment on a Post
- Click "Reply" on a post
- Type a comment and click Send
- The comment appears in the thread
- Mention: "Each post has its own comment thread"

### 8. Dashboard
- Navigate to Dashboard from the sidebar
- Show the stat cards: Total Posts and Active Users
- Show the bar chart of top trending issues
- Mention: "This auto-refreshes every 5 seconds — imagine campus administrators monitoring live concerns"

### 9. Profile
- Navigate to Profile
- Show your name, email, and avatar
- Click Edit Profile, change your name, save
- Show the "My Posts" section
- Mention: "Users can manage their identity and review their contributions"

### 10. Admin Panel
- Login as an admin user (see setup below)
- Show the "Admin" link in the sidebar (only visible to admins)
- Show the admin panel: user count, admin count, post count
- Demonstrate promoting a regular user to admin
- Delete a post from the admin panel
- Delete a comment from the feed using the X button
- Mention: "Role-based access control — regular users cannot access admin features"

### 11. Mobile Responsive
- Resize the browser window to narrow width
- The sidebar disappears and a bottom navigation bar appears
- Mention: "Fully responsive — works on phones and tablets"

## Running Locally

```bash
# Backend
cd backend
npm install
npm start
# Runs on http://localhost:5005

# Frontend (separate terminal)
cd lumina-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Creating the First Admin User

The first registered user has the `user` role by default. To promote them to admin, run this after the backend is running and you've registered:

```bash
cd backend
node -e "
const {initDb, getDb, saveDb} = require('./db');
initDb().then(() => {
  const db = getDb();
  db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', 'YOUR_EMAIL_HERE']);
  saveDb();
  console.log('User promoted to admin');
  process.exit(0);
});
"
```

Then log out and log back in to get the updated role in your session.

## Live URLs

- **Frontend (Netlify):** [your-netlify-url]
- **Backend (Render):** https://lumina-plaform.onrender.com
