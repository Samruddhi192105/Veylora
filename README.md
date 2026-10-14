# Veylora

Veylora is a mystery escape-room game with account-based game sessions.

## Authentication configuration

Copy `backend/.env.example` to `backend/.env` and configure the MongoDB
connection, a private random `AUTH_SECRET_KEY` (at least 32 characters), and
the Google OAuth web client ID. The same Google client ID must be configured
as `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `frontend/.env.local`. Add the frontend
origin (for local development, `http://localhost:3000`) to the authorized
JavaScript origins for that Google OAuth client.

Install backend dependencies with `pip install -r backend/requirements.txt`.
Install frontend dependencies with `cd frontend` followed by `npm install`.

Run the FastAPI application from `backend` with
`uvicorn app.main:app --reload`, and run the frontend from `frontend` with
`npm run dev`.
