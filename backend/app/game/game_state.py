from datetime import datetime, timezone
from typing import List
from pydantic import BaseModel, Field
from uuid import uuid4


class GameState(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid4()))

    player_id: str | None = None

    status: str = "playing"

    current_room: str = "study"

    inventory: List[str] = Field(default_factory=list)

    discovered_objects: List[str] = Field(default_factory=list)

    discovered_clues: List[str] = Field(default_factory=list)

    solved_puzzles: List[str] = Field(default_factory=list)

    attempts: int = 0

    hints_used: int = 0

    time_remaining: int = 1800

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )