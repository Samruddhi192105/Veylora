from datetime import datetime, timezone

from app.database.mongodb import db
from app.game.game_state import GameState
from app.game.room_manager import get_room
from app.game.game_events import record_event


game_sessions = db["game_sessions"]

GAME_DURATION = 1800  # 30 minutes


def create_game_session(player_id: str | None = None):
    game_state = GameState(player_id=player_id)

    game_sessions.insert_one(game_state.model_dump())

    return game_state


def get_game_session(session_id: str):
    session = game_sessions.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )

    if session is None:
        return None

    # ---------------------------------------------------------
    # Calculate remaining game time
    # ---------------------------------------------------------

    if session.get("status") == "playing":

        created_at = session.get("created_at")

        if created_at is not None:

            # MongoDB/PyMongo can return a naive datetime.
            # Convert it to UTC-aware datetime before subtraction.
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            now = datetime.now(timezone.utc)

            elapsed_seconds = int(
                (now - created_at).total_seconds()
            )

            remaining_time = max(
                0,
                GAME_DURATION - elapsed_seconds
            )

            session["time_remaining"] = remaining_time

            # -------------------------------------------------
            # Time has expired
            # -------------------------------------------------

            if remaining_time <= 0:

                result = game_sessions.update_one(
                    {
                        "session_id": session_id,
                        "status": "playing"
                    },
                    {
                        "$set": {
                            "status": "expired",
                            "time_remaining": 0,
                            "updated_at": now
                        }
                    }
                )

                if result.modified_count > 0:
                    record_event(
                        session_id,
                        "GAME_EXPIRED",
                        {
                            "reason": "time_limit_reached"
                        }
                    )

                session["status"] = "expired"
                session["time_remaining"] = 0

            else:

                # Keep MongoDB synchronized with the calculated time.
                game_sessions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "time_remaining": remaining_time,
                            "updated_at": now
                        }
                    }
                )

    return session


def update_game_session(session_id: str, updates: dict):
    updates["updated_at"] = datetime.now(timezone.utc)

    result = game_sessions.update_one(
        {"session_id": session_id},
        {"$set": updates}
    )

    return result.modified_count > 0


def interact_with_object(session_id: str, object_id: str):

    game = get_game_session(session_id)

    if game is None:
        return None, "Game session not found"

    # Prevent interaction after time expires.
    if game["status"] == "expired":
        return None, "Time has run out. The game is over."

    if game["status"] == "completed":
        return None, "Game has already been completed"

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

    # ---------------------------------------------------------
    # Object discovered
    # ---------------------------------------------------------

    if object_id not in discovered_objects:

        discovered_objects.append(object_id)

        updates["discovered_objects"] = discovered_objects

        record_event(
            session_id,
            "OBJECT_DISCOVERED",
            {
                "object_id": object_id
            }
        )

    # ---------------------------------------------------------
    # Grandfather clock
    # ---------------------------------------------------------

    if object_id == "grandfather_clock":

        if "clock_time_1145" not in discovered_clues:

            discovered_clues.append("clock_time_1145")

            updates["discovered_clues"] = discovered_clues

            record_event(
                session_id,
                "CLUE_DISCOVERED",
                {
                    "clue_id": "clock_time_1145",
                    "source": "grandfather_clock"
                }
            )

    # ---------------------------------------------------------
    # Diary
    # ---------------------------------------------------------

    elif object_id == "diary":

        if "diary_message" not in discovered_clues:

            discovered_clues.append("diary_message")

            updates["discovered_clues"] = discovered_clues

            record_event(
                session_id,
                "CLUE_DISCOVERED",
                {
                    "clue_id": "diary_message",
                    "source": "diary"
                }
            )

    # ---------------------------------------------------------
    # Bookshelf
    # ---------------------------------------------------------

    elif object_id == "bookshelf":

        if "bookshelf_sequence" not in discovered_clues:

            discovered_clues.append("bookshelf_sequence")

            updates["discovered_clues"] = discovered_clues

            record_event(
                session_id,
                "CLUE_DISCOVERED",
                {
                    "clue_id": "bookshelf_sequence",
                    "source": "bookshelf"
                }
            )

    # ---------------------------------------------------------
    # Save updates
    # ---------------------------------------------------------

    if updates:
        update_game_session(
            session_id,
            updates
        )

    return object_data, None


def use_exit_door(session_id: str):

    game = get_game_session(session_id)

    if game is None:
        return None, "Game session not found"

    if game["status"] == "expired":
        return None, "Time has run out. You did not escape."

    if game["status"] == "completed":
        return None, "Game has already been completed"

    if "exit_key" not in game["inventory"]:
        return None, "The exit door is locked. You need the exit key."

    update_game_session(
        session_id,
        {
            "status": "completed",
            "current_room": "escaped",
            "time_remaining": game["time_remaining"]
        }
    )

    record_event(
        session_id,
        "GAME_COMPLETED",
        {
            "room": "study"
        }
    )

    return {
        "status": "completed",
        "message": "You unlocked the exit door and escaped the study!"
    }, None