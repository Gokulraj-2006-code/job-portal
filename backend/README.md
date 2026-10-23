# JobPortal Backend (Node.js + Express + MongoDB)

A complete REST API for the JobPortal frontend — Job Seeker, Recruiter, and
Admin functionality, backed by a local MongoDB instance.

## 1. Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod` on `mongodb://127.0.0.1:27017`)

## 2. Install & configure

```bash
cd backend
npm install
cp .env.example .env   # already present with sensible local defaults
```

Open `.env` and set a real `JWT_SECRET` (any long random string). Everything
else is already set up to talk to a local MongoDB and a frontend running on
`http://localhost:5173`.

## 3. Start MongoDB locally

```bash
mongod --dbpath /path/to/your/data/db
```

(Or run it as a service — however you normally start MongoDB locally.)

## 4. Seed demo data (optional but recommended)

```bash
npm run seed
```

This creates the same demo accounts the frontend previously shipped with
(all passwords are `password123`):

| Role      | Email                        |
|-----------|-------------------------------|
| Seeker    | seeker@example.com            |
| Seeker    | rahul@example.com             |
| Recruiter | recruiter@example.com         |
| Recruiter | karan@bluepeak.example.com    |
| Admin     | admin@jobportal.com           |

Run `npm run seed:destroy` to wipe all collections without reseeding.

## 5. Run the server

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start       # plain node
```

The API listens on `http://localhost:5000` by default, matching the
frontend's `.env` (`VITE_API_URL=http://localhost:5000/api`) and its Vite
dev-server proxy (`/api` → `http://localhost:5000`).

Health check: `GET http://localhost:5000/api/health`

## 6. Run the frontend against it

In the frontend project:

```bash
npm install
npm run dev
```

Uploaded resumes are served statically from `http://localhost:5000/uploads/...`.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/jobs` (+ `/save`, `/apply`, `/applicants`, `/meta/*`, `/recruiter/*`, `/saved/list`, `/applications/me`)
- `PUT/DELETE /api/applications/:id`
- `GET/POST/PUT/DELETE /api/companies` (+ `/jobs`, `/logo`)
- `GET/PUT /api/users/profile`, `/resume`, `/avatar`, `/notifications`, `/change-password`, `/account`
- `POST /api/contact`
- `GET/PUT/DELETE /api/messages` (admin + recruiter inbox)
- `GET /api/settings/announcement` (public banner)
- `/api/admin/*` — stats, users, companies, jobs, applications, audit log, announcement, categories, experience levels, salary settings (all admin-only)

## Notes on data handling

- Passwords are hashed with bcrypt; auth uses JWT bearer tokens.
- Avatars, company logos, and per-application resumes are accepted as
  base64 data URLs (matching what the frontend's file inputs already
  produce) and stored as-is on the relevant document, exactly mirroring
  the original mock behavior so the frontend needs no changes to how it
  reads them back (e.g. `application.resume.data` as a direct link href).
- The Profile page's own resume upload uses a real `multipart/form-data`
  upload instead, and is stored as an actual file under `uploads/resumes/`.
