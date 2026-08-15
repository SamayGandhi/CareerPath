# Frontend – CareerPath

This is the React frontend for the CareerPath platform.

## Purpose

Handles everything the user actually sees and interacts with — login, dashboard, career exploration, skill assessment, recommendations, roadmap, the analyzer tools, and more. Talks to the backend API for all data.

## Main Features

- Auth pages (login, register, forgot/reset password)
- Dashboard with readiness score, active roadmap, recent activity
- Career Explorer + career detail pages
- Skill Assessment flow
- Skill Gap Analysis page (with a chart and a table view)
- Recommendations page with a "why this?" breakdown per course
- Roadmap page with stage-by-stage progress
- Course Explorer, Course Comparison, Platform Comparison
- Interview Prep (practice questions + mock tests)
- Resume / GitHub / Portfolio analyzer pages
- Notifications page
- Profile and Settings pages
- Admin panel (for admin users)

## Technology Stack

- React 18 + Vite
- Tailwind CSS
- Redux Toolkit (mainly for auth state)
- React Router
- Axios
- Recharts (for charts)

## Project Structure

src/
app/ → app entry, store, providers, router
components/ → shared UI (buttons, cards, layouts, etc.)
features/ → one folder per feature (auth, dashboard, roadmap, etc.)
hooks/ → shared React hooks
lib/ → axios setup, api request wrapper
routes/ → route constants and route guards
styles/ → Tailwind + design tokens


Each feature folder usually has an `*.api.js` file (talks to the backend) and a `components/` folder (the actual UI).

## Routing / Navigation

Routing is handled with React Router. Public pages (landing, career explorer, courses) use one layout, authenticated pages use a layout with a sidebar and top navbar, and a couple of pages (career explorer, courses) automatically switch between the two depending on whether you're logged in.

## Authentication (high level)

On login, the backend returns an access token (kept in memory) and sets an HttpOnly refresh-token cookie. Axios is set up to automatically try refreshing the token if a request comes back unauthorized, so you generally stay logged in across page reloads without doing anything extra.

## API Communication

All backend calls go through a small `apiRequest()` wrapper around Axios (`src/lib/queryClient.js`), which unwraps the backend's response format and throws a normal JS error on failure so components can just `try/catch`.

## Installation

```bash
cd frontend
npm install
```

## Environment Variables

Create a `.env` file:

VITE_API_BASE_URL=http://localhost:5000/api/v1


## Running

```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview the production build
```