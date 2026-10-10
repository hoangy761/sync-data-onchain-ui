# Indexer UI

Classic Explorer light UI (React + Vite + TypeScript + Tailwind) for the Nest ERC-20 indexer API.

## Run

```bash
# Terminal 1 — API
cd ../be && npm run start:dev

# Terminal 2 — UI
cd ../ui && npm run dev
```

Open http://localhost:5173

Env: `VITE_API_BASE_URL=http://localhost:3000` (see `.env.example`).

## Features

- Token `<select>` from `GET /api/v1/tokens`
- Holder search → balance + history
- Sync status panel (poll every 15s)
