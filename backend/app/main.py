from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.puzzles import router as puzzle_router
from app.database.mongodb import check_mongodb_connection
from app.api.game import router as game_router


app = FastAPI(
    title="Veylora API",
    description="Backend API for the Veylora AI Escape Room",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game_router)
app.include_router(puzzle_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Veylora",
        "status": "online"
    }


@app.get("/health")
def health():

    mongodb_status = check_mongodb_connection()

    return {
        "status": "online",
        "mongodb": "connected" if mongodb_status else "disconnected"
    }