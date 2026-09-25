from fastapi import APIRouter, HTTPException

from app.game.game_engine import (
    create_game_session,
    get_game_session,
    interact_with_object
)

from app.game.room_manager import get_room


router = APIRouter(
    prefix="/game",
    tags=["Game"]
)


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