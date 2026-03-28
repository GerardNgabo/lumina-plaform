# LUMINA PLATFORM — Rebrand & React Redesign

## Context

URUMURI is a campus social platform (posts, likes, comments, anonymous posting, dashboard analytics, profiles) with a fully functional vanilla HTML/CSS/JS frontend and an Express + SQLite backend. The project is being rebranded to **LUMINA PLATFORM** with a complete UI redesign in React, replacing the legacy frontend entirely. The backend remains unchanged (SQLite, same API routes).

## Scope

- Rename all "URUMURI" references to "LUMINA" across the codebase
- Replace the legacy frontend (HTML/CSS/JS) with a React app built on Vite
- Redesign the UI with an "Emerald Night" dark theme
- Feature parity — no new features, no removed features

## Branding

- **Name:** LUMINA PLATFORM (logo text: "LUMINA")
- **Rename targets:** 42+ occurrences across package.json files, HTML titles, localStorage keys, JS variables, API URL references, backend strings, README, folder names

### Rename Map

| Location | Old | New |
|----------|-----|-----|
| localStorage keys | `urumuri_token`, `urumuri_user` | `lumina_token`, `lumina_user` |
| Backend response | `"Urumuri Backend is Live!"` | `"Lumina Backend is Live!"` |
| DB filename | `urumuri.db` | `lumina.db` |
| Package names | `urumuri-frontend` | `lumina-frontend` |
| Frontend folder | `urumuri-frontend/` | `lumina-frontend/` |
| Global JS function | `window.urumuriLogout` | (removed — React handles this) |

## Visual Design — Emerald Night Theme

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0c0c0c` | Page background |
| `--bg-card` | `#161616` | Cards, panels, inputs |
| `--bg-hover` | `#1e1e1e` | Hover states |
| `--border` | `rgba(16, 185, 129, 0.15)` | Subtle emerald-tinted borders |
| `--border-solid` | `#262626` | Solid borders (dividers) |
| `--accent` | `#10b981` | Primary accent (buttons, active states) |
| `--accent-light` | `#34d399` | Secondary accent (tags, links) |
| `--accent-bg` | `rgba(16, 185, 129, 0.12)` | Accent background tint |
| `--text-primary` | `#e5e5e5` | Main text |
| `--text-secondary` | `#a3a3a3` | Muted text |
| `--text-tertiary` | `#737373` | Timestamps, hints |
| `--danger` | `#ef4444` | Error states |
| `--success` | `#10b981` | Success states (same as accent) |

### Typography

- **Font:** Inter (Google Fonts import)
- **Headings:** 600 weight
- **Body:** 400 weight
- **Small/muted:** 14px, `--text-secondary`
- **Scale:** 14px base, 16px body, 20px h3, 24px h2

### Spacing & Shape

- **Border radius:** 12px (cards), 8px (inputs, buttons), 20px (tags/pills)
- **Card padding:** 16px
- **Page max-width:** 1200px
- **Gap/spacing unit:** 8px base (8, 12, 16, 24, 32)

### Layout

- **Desktop (>900px):** 3-column — 240px left nav | flex-1 feed | 300px right sidebar
- **Mobile (<900px):** Single column, bottom navigation bar (fixed)
- **Navigation:** Left sidebar with icon + text links (Home, Dashboard, Profile, Logout)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build tool | Vite |
| Framework | React 19 |
| Routing | React Router v6 |
| State | React Context (AuthContext) |
| Styling | CSS Modules |
| Charts | Chart.js + react-chartjs-2 |
| HTTP | fetch (centralized client) |
| Font | Inter (Google Fonts) |

## Pages & Routes

| Route | Page Component | Auth Required | Features |
|-------|---------------|---------------|----------|
| `/login` | `Login.jsx` | No | Email/password form, link to register |
| `/register` | `Register.jsx` | No | Name/email/password form, link to login |
| `/` | `Home.jsx` | Yes | Post creation, feed, trending sidebar |
| `/dashboard` | `Dashboard.jsx` | Yes | Stats cards, tag bar chart, trending list |
| `/profile` | `Profile.jsx` | Yes | User info, edit name, user's posts |

## Component Architecture

```
lumina-frontend/
  src/
    api/
      client.js             # fetch wrapper: base URL, auth header injection
    context/
      AuthContext.jsx        # Provider: token, user, login(), logout(), isAuthenticated
    components/
      Layout.jsx            # App shell: sidebar nav + main + optional right sidebar
      PostCard.jsx           # Single post: avatar, name/anon, tag, content, media, actions
      PostCreate.jsx         # Textarea + tag input + file upload + submit
      CommentSection.jsx     # Expandable comment list + add comment form
      LikeButton.jsx         # Heart icon + count, toggle on click
      TrendingSidebar.jsx    # Right sidebar: list of top tags with counts
      StatsCard.jsx          # Dashboard: single stat (icon + number + label)
      TagChart.jsx           # Dashboard: Chart.js bar chart of top tags
      ProtectedRoute.jsx     # Redirect to /login if not authenticated
    pages/
      Login.jsx
      Register.jsx
      Home.jsx
      Dashboard.jsx
      Profile.jsx
    styles/
      global.css             # CSS variables, resets, font import
      Layout.module.css
      PostCard.module.css
      PostCreate.module.css
      CommentSection.module.css
      LikeButton.module.css
      Login.module.css
      Register.module.css
      Home.module.css
      Dashboard.module.css
      Profile.module.css
      TrendingSidebar.module.css
      StatsCard.module.css
      TagChart.module.css
    App.jsx                  # Router setup
    main.jsx                 # Vite entry point
```

## API Client

Centralized in `api/client.js`:
- `API_BASE` constant pointing to `http://localhost:5005/api` (dev)
- `authFetch(url, options)` — wraps fetch, injects `Authorization: Bearer` from localStorage
- All components use this instead of raw fetch

## Auth Flow

1. Login/Register → POST to `/api/auth/login` or `/api/auth/register`
2. On success → store `lumina_token` and `lumina_user` in localStorage
3. `AuthContext` reads localStorage on mount, provides `{ user, token, login, logout }`
4. `ProtectedRoute` checks `isAuthenticated` — redirects to `/login` if false
5. Logout → clear localStorage, redirect to `/login`

## Feature Details

### Posts (Home page)
- **Create:** Textarea + tag input + file input (image/video), POST via FormData
- **Display:** Avatar with initials (or "?" if anonymous), author name (or "Anonymous Student" if tag contains "ANON"), cleaned tag pill, timestamp, content text, image/video if present
- **Like:** Heart icon + count, POST toggle to `/api/posts/:id/like`
- **Comments:** Expand/collapse, list existing + add new

### Dashboard
- **Stats:** Total posts count, active users count (displayed in StatsCard components)
- **Chart:** Bar chart of top 5 trending tags using Chart.js with emerald-themed colors
- **Trending list:** Tags ranked by frequency below the chart
- **Auto-refresh:** Fetch new data every 5 seconds (same as legacy)

### Profile
- **Display:** Large avatar with initials, name, email
- **Edit:** Click to edit display name (modal or inline input, PUT to `/api/auth/update`)
- **My Posts:** Filtered list of the current user's posts

## Backend Changes

Minimal — only branding updates:
1. `server.js`: Change welcome message to `"Lumina Backend is Live!"`
2. `db.js`: Rename database file from `urumuri.db` to `lumina.db`
3. `package.json`: Update name if desired

No API route changes. No schema changes.

## Verification Plan

1. **Backend:** Start with `cd backend && npm start`, confirm "Lumina Backend is Live!" at `http://localhost:5005`
2. **Frontend:** Start with `cd lumina-frontend && npm run dev`, confirm Vite dev server opens
3. **Auth:** Register a new user, login, verify token stored as `lumina_token`
4. **Feed:** Create a post (text + image), verify it appears in feed
5. **Anonymous:** Create a post with ANON tag, verify author shows as "Anonymous Student"
6. **Likes:** Like/unlike a post, verify count updates
7. **Comments:** Add a comment, verify it appears under the post
8. **Dashboard:** Verify stats and chart render, auto-refresh works
9. **Profile:** View profile, edit name, verify update persists
10. **Mobile:** Resize browser to <900px, verify single-column layout + bottom nav
11. **Legacy cleanup:** Confirm old HTML/CSS/JS files are removed
