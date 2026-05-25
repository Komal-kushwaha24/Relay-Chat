# Relay Chat

Production-level MERN realtime chat application scaffold.

## Stack

- **Client:** React, Vite, Tailwind CSS, Socket.IO client
- **Server:** Node.js, Express, MongoDB (Mongoose), Socket.IO

## Project structure

```
relay-chat/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── services/
├── server/                 # Express + Socket.IO backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── sockets/
└── package.json            # Root scripts (run both apps)
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or a remote `MONGODB_URI`

## Setup

```bash
# Install all dependencies (root, client, server)
npm run install:all

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` with your MongoDB connection string if needed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run client and server concurrently |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | Express + nodemon only |
| `npm run build` | Build client for production |
| `npm run start` | Start production server |

## API

- `GET /` — API info
- `GET /api/health` — Health check

## Socket events (placeholder)

- `chat:join` — Join a room
- `chat:leave` — Leave a room
- `chat:message` — Broadcast message to room

Authentication is not implemented yet.
