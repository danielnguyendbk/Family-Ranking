# Family Ranking – Frontend

Production-ready React 18 + Vite frontend for the Family Game Ranking Web App. Matches the Spring Boot backend API contract exactly.

## Tech stack

- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS v4
- Context API (auth + toast)
- JWT in `Authorization: Bearer` (token stored in localStorage; backend returns token in response body)

## Setup

```bash
npm install
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000). API requests to `/api/*` are proxied to the backend at `http://localhost:8080` (paths rewritten to `/auth`, `/games`, etc.).

## Backend

- Base URL in dev: proxied from `/api` to `http://localhost:8080`
- For production, set `VITE_API_URL` to your backend root (e.g. `https://api.example.com`). If the backend is served under `/api`, keep the existing path prefix in `src/services/apiService.js`; otherwise adjust paths to match.

## Features

1. **Auth** – Register (username, email, password, optional avatar), Login, Forgot password, Reset password (token from email).
2. **Dashboard** – List of games (cards with name, your match count, “View Ranking”).
3. **Game ranking** – `/games/:gameId`: table (Rank, Avatar, Player, Played, Win, Draw, Loss, Points); “Create Match”, “View Match History”.
4. **Create match** – 1v1 or team; opponent/teams from API; Friendly / Bet (e.g. Ly nước); score or winner; submit → status PENDING, sent for confirmation.
5. **Pending** – `/pending`: list of matches where you are the opponent; Accept / Reject (points updated on accept).
6. **Bet settlement** – `/bet-settlement`: completed matches with bet; winner requests settlement, loser confirms.
7. **Profile** – Avatar, stats, update profile (username, avatar). Password change via “Forgot password” flow.

## Project structure

```
src/
  components/   Spinner, ProtectedRoute
  context/     AuthContext, ToastContext
  hooks/       useAxiosInterceptor
  layouts/     MainLayout, AuthLayout
  pages/       All route pages
  routes/      (routing in App.jsx)
  services/    api.js, apiService.js
  types/       api.js (DTOs matching backend)
```

## API contract

Uses only existing backend endpoints and DTOs:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- `GET /users/me`, `PUT /users/profile`
- `GET /games`, `GET /teams?gameId`, `POST /teams`
- `POST /matches/create`, `POST /matches/:id/accept`, `POST /matches/:id/reject`, `POST /matches/:id/settle-request`, `POST /matches/:id/settle-confirm`, `GET /matches/my`, `GET /matches/ranking?gameId`

Request/response shapes match backend (see `src/types/api.js`).
