from fastapi import APIRouter, HTTPException

from app.game.game_engine import (
    create_game_session,
    get_game_session,
    interact_with_object,
    use_exit_door
)

from app.database.mongodb import db

from app.game.room_manager import get_room


router = APIRouter(
    prefix="/game",
    tags=["Game"]
)


# MongoDB collection for game events
game_events = db["game_events"]


@router.post("/start")
def start_game():

    game = create_game_session()

    return {
        "message": "Game started successfully",
        "game": game
    }


@router.get("/{session_id}")
def get_game(session_id: str):

    game = get_game_session(session_id)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game session not found"
        )

    return game


@router.get("/{session_id}/room")
def get_current_room(session_id: str):

    game = get_game_session(session_id)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game session not found"
        )

    room = get_room(game["current_room"])

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    return room


@router.post("/{session_id}/interact/{object_id}")
def interact(
    session_id: str,
    object_id: str
):

    object_data, error = interact_with_object(
        session_id,
        object_id
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error
        )

    return {
        "message": "Object discovered",
        "object": object_data
    }


@router.post("/{session_id}/exit")
def exit_game(session_id: str):

    result, error = use_exit_door(session_id)

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    return result


@router.get("/{session_id}/events")
def get_game_events(session_id: str):

    game = get_game_session(session_id)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game session not found"
        )

    events = list(
        game_events.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("created_at", 1)
    )

    return {
        "session_id": session_id,
        "events": events
    }