# Backend – CareerPath

This is the Node.js/Express backend for the CareerPath platform. It handles all the business logic, the database, and the REST API the frontend talks to.

## Purpose

- User accounts and authentication
- Storing and updating profiles, skills, and assessments
- Running the rule-based Skill Gap, Recommendation, and Roadmap engines
- Serving course/career path/platform data
- Handling the Resume, GitHub, and Portfolio analyzers
- Interview questions and mock tests
- Notifications
- Admin operations
- Talking to the optional AI service (only if it's enabled)

## Technology Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- Zod for request validation
- bcrypt for password hashing

## Authentication

Uses access tokens (short-lived, sent in the `Authorization` header) plus a refresh token stored in an HttpOnly cookie, with rotation and reuse detection. Passwords are hashed with bcrypt.

## Main Modules

- `auth` — register, login, refresh, logout, password reset
- `user` / `profile` — account info and profile data (skills, education, career goal, etc.)
- `skill-taxonomy` / `career-path` — the reference data everything else is built on
- `assessment` — the skill self-assessment (question bank, scoring)
- `skill-gap-engine` — computes readiness score + skill gaps (pure rule-based)
- `recommendation-engine` — ranks courses based on skill gaps, budget, and user type
- `roadmap-engine` — turns a recommendation into a staged, sequenced learning plan
- `progress-tracker` — tracks progress through roadmap stages/courses
- `course` / `platform` — the course and platform catalog
- `resume-analyzer` / `github-analyzer` / `portfolio-analyzer` — the three analyzer tools
- `interview-prep` — practice questions, mock tests, readiness scoring
- `notification` — in-app notifications
- `review` — course/platform reviews
- `admin` — stats, user management, content management, feature flags
- `ai` — the gateway that (optionally) talks to the AI service

## Database

MongoDB, using Mongoose models for each collection (users, profiles, courses, careerPaths, skillTaxonomy, assessments, skillGapReports, recommendations, roadmaps, progress, interviewQuestions, interviewAttempts, notifications, reviews, auditLogs, featureFlags, and a few more).

## Validation / Security

- All request bodies/params are validated with Zod schemas before hitting any controller
- Rate limiting on sensitive routes (login, register, etc.)
- CORS configured to only allow the frontend's origin
- Passwords never returned in API responses

## Environment Variables

Copy `.env.example` to `.env` and fill in your own values:

MONGO_URI=YOUR_MONGO_URI
JWT_ACCESS_SECRET=YOUR_JWT_SECRET
JWT_REFRESH_SECRET=YOUR_JWT_REFRESH_SECRET
CORS_ORIGIN=http://localhost:5173


The AI-related variables (`AI_SERVICE_BASE_URL`, `AI_SERVICE_INTERNAL_KEY`, etc.) are optional — leave them blank if you're not running the AI service.

## Installation

```bash
cd backend
npm install
```

## Seeding Reference Data

```bash
node src/database/seeders/skillTaxonomyAndCareerPaths.seeder.js
node src/database/seeders/assessmentQuestions.seeder.js
node src/database/seeders/coursesAndPlatforms.seeder.js
node src/database/seeders/interviewQuestions.seeder.js
```

## Running

```bash
npm run dev     # development, with auto-reload
npm start       # production
```

## Development Notes

The Skill Gap, Recommendation, and Roadmap logic all live in isolated `engine/` folders inside their module, and don't depend on anything outside their own module — they're plain functions that take data in and return a result, which makes them easy to test and reason about on their own.