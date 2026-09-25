from datetime import datetime, timezone

from app.database.mongodb import db
from app.game.game_state import GameState
from app.game.room_manager import get_room


game_sessions = db["game_sessions"]


def create_game_session(player_id: str | None = None):

    game_state = GameState(player_id=player_id)

    game_sessions.insert_one(
        game_state.model_dump()
    )

    return game_state


def get_game_session(session_id: str):

    session = game_sessions.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )

    return session


def update_game_session(session_id: str, updates: dict):

    updates["updated_at"] = datetime.now(timezone.utc)

    result = game_sessions.update_one(
        {"session_id": session_id},
        {"$set": updates}
    )

    return result.modified_count > 0


def interact_with_object(
    session_id: str,
    object_id: str
):

    game = get_game_session(session_id)

    if game is None:
        return None, "Game session not found"

    room = get_room(game["current_room"])

    if room is None:
        return None, "Current room not found"

    object_data = next(
        (
            obj
            for obj in room["objects"]
            if obj["id"] == object_id
        ),
        None
    )

    if object_data is None:
        return None, "Object not found in this room"

    discovered_objects = game["discovered_objects"]
    discovered_clues = game["discovered_clues"]

    updates = {}

    # Add object to discovered objects
    if object_id not in discovered_objects:

        discovered_objects.append(object_id)

        updates["discovered_objects"] = discovered_objects

    # Reveal clues based on the object
    if object_id == "grandfather_clock":

        if "clock_time_1145" not in discovered_clues:

            discovered_clues.append("clock_time_1145")

            updates["discovered_clues"] = discovered_clues

    elif object_id == "diary":

        if "diary_message" not in discovered_clues:

            discovered_clues.append("diary_message")

            updates["discovered_clues"] = discovered_clues

    # Save changes if anything changed
    if updates:

        update_game_session(
            session_id,
            updates
        )

    return object_data, None