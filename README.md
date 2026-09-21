# Raffle Draw — MERN Stack

A raffle drawing app: import names from CSV/Excel or type them in manually,
spin the drum, and each winner is pulled out of the pool automatically so
they can't be drawn twice.

## Stack

- **Frontend:** React + Vite (`/frontend`)
- **Backend:** Express + Mongoose (`/backend`)
- **Database:** MongoDB (local or Atlas)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env   # edit MONGO_URI if using Atlas
npm install
npm run dev             # or: npm start
```

Runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env    # only needed if your API isn't on localhost:5000
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Features

- **Add names** one at a time or many at once (one per line).
- **Import CSV or Excel** — the first column of each row is read as a name;
  a header row like "Name" is skipped automatically.
- **Spin the drum** — picks a random name from the pool, shows a quick
  cycling animation, then reveals the winner.
- **Automatic removal** — once drawn, a name moves out of the pool and into
  the Winners list, so it can never be picked again.
- **Reset** — clears both the pool and the winners list to start over.

## Project structure

```
raffle-app/
├── backend/
│   ├── models/Participant.js
│   ├── routes/participants.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── RaffleDrum.jsx
        │   ├── ParticipantsPanel.jsx
        │   ├── WinnersPanel.jsx
        │   └── Footer.jsx
        ├── App.jsx
        ├── api.js
        └── index.css
```

## Notes

- The color theme is set to `#f4f6f8` as requested, with a dark charcoal
  drum frame and amber accents.
- The footer ("Powered by …") links out to https://sean-m.vercel.app/.
- CSV parsing uses `papaparse`; Excel parsing uses `xlsx` (SheetJS) — both
  run only on the backend, so no extra setup is needed in the browser.
# Raffle
