from datetime import datetime, timezone
from uuid import uuid4

from app.database.mongodb import db


game_events = db["game_events"]


def record_event(
    session_id: str,
    event_type: str,
    data: dict | None = None
):
    event = {
        "event_id": str(uuid4()),
        "session_id": session_id,
        "event_type": event_type,
        "data": data or {},
        "created_at": datetime.now(timezone.utc)
    }

    game_events.insert_one(event)

    return event