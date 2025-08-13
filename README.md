# Implementation Report — Tasks App (Mongo, Node 16, Docker)

**Date:** 2025-08-08T15:12:26.203571Z

## Overview

- **Backend:** Node 16, Express, Mongoose, Zod validation, Swagger UI (served at `/docs`), Jest+Supertest smoke.
- **Frontend:** HMCTS base project was used and kept intact; I added `/tasks` route and Nunjucks view to create, list, update, delete tasks via the backend API.
- **Database:** MongoDB 6.
- **Docker:** `docker-compose.yml` starts `mongo`, `backend` (4000), `frontend` (3100).
- **Node version:** `.nvmrc` set to 16 in both services.

## Backend

- Routes:
  - `POST /api/tasks` — create task (title, description?, status, dueDate).
  - `GET /api/tasks` — list tasks.
  - `GET /api/tasks/:id` — get one.
  - `PATCH /api/tasks/:id/status` — update only status.
  - `DELETE /api/tasks/:id` — delete.
- Validation with **Zod**.
- Model: `Task` with fields: `title`, `description?`, `status: 'todo'|'in_progress'|'done'`, `dueDate`, timestamps.
- Error handling returns JSON with `error.code` and `error.message`.
- **OpenAPI** JSON available at `/openapi.json` and rendered by Swagger UI at `/docs`.
- Tests: `tests/tasks.smoke.test.cjs` (kept minimal to avoid heavy spinning in this environment).

## Frontend

- I added New route file: `src/main/routes/tasks.ts`:
  - `GET /tasks` renders `tasks.njk` with all tasks.
  - `POST /tasks` creates a task.
  - `POST /tasks/:id/status` updates status.
  - `POST /tasks/:id/delete` deletes.
- New view: `src/main/views/tasks.njk` (GOV.UK styles).
- `src/main/app.ts` updated to register the tasks routes.
- Environment variable: `API_BASE_URL` (default `http://localhost:4000`) — Compose sets to `http://backend:4000`.

##  OPTIONAL- for testing could be easily spin with docker as well, I added easy means to test / spin with docker: How to run (Docker)

```bash
open -a Docker
docker compose up --build
# Frontend http://localhost:3100/tasks
# Backend  http://localhost:4000/api/tasks
# Docs     http://localhost:4000/docs. -- FOR stimulation with SWagger  
```

## How to run locally

### Backend

```bash
cd backend
nvm use 16
npm install
cp .env
# edit MONGO_URL and login details, I used my personal mongo account for testing but .env has been git ignored.
npm run start
```

### Frontend

```bash
cd frontend
nvm use 16
yarn install
yarn build
yarn start
# Visit http://localhost:3100/tasks
```

## Unit Testing

- I added an in-process test which enable unit testing without starting the server, however, I added some fall back (optional) E2E test which required server to be running,
- To run the unit test (in-process Jest)

```bash
cd backend
npm test
```

- To Run the E2E test

```bash
cd backend
npm run test:e2e
```
