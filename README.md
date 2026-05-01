# Claude Exam

A full-stack web application for conducting and scoring structured exams. Built with a React frontend and a Node.js/Express backend, with end-to-end tests powered by Playwright.

## Architecture

```
claude-exam/
├── client/          # React frontend (Vite)
├── server/          # Node.js/Express REST API
├── e2e/             # Playwright end-to-end tests
└── docker-compose.yml
```

### Client

- **Framework:** React 18 with Vite
- **Entry point:** `client/src/main.jsx`
- **Dev server:** `http://localhost:5173`

### Server

- **Runtime:** Node.js (ESM)
- **Framework:** Express 4
- **Dev server:** `http://localhost:3001`
- **Endpoints:**
  - `GET /api/health` — health check
  - `GET /api/questions` — retrieve exam questions
  - `POST /api/results` — submit and persist exam results

Results are persisted to `server/data/results.json`.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

Install all dependencies for the root, server, and client in one step:

```bash
npm run install:all
```

### Development

Start both the client and server concurrently:

```bash
npm run dev
```

| Service | URL                     |
|---------|-------------------------|
| Client  | http://localhost:5173   |
| Server  | http://localhost:3001   |

### Docker

Run the full stack using Docker Compose:

```bash
docker compose up
```

## Testing

End-to-end tests run against the live dev servers using Playwright (Chromium):

```bash
npm run test:e2e
```

Test specs are located in `e2e/exam.spec.js`. The Playwright configuration is in `playwright.config.js`.
