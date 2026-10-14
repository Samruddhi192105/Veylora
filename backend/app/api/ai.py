from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any

from app.auth import get_current_user, require_owned_game
from app.ai.game_master import GameMaster


router = APIRouter(prefix="/ai", tags=["AI"])


class HintRequest(BaseModel):
    hint_level: int


game_master = GameMaster()


@router.post("/hint/{session_id}")
def get_hint(
    session_id: str,
    request: HintRequest,
    user: dict[str, Any] = Depends(get_current_user),
):

    game = require_owned_game(session_id, user)

    if game["status"] == "expired":
        raise HTTPException(
            status_code=400,
            detail="The game has expired"
        )

    if game["status"] == "completed":
        raise HTTPException(
            status_code=400,
            detail="The game has already been completed"
        )

    if request.hint_level not in [1, 2, 3]:
        raise HTTPException(
            status_code=400,
            detail="Hint level must be 1, 2, or 3"
        )

    try:
        hint = game_master.generate_hint(
            game,
            request.hint_level
        )

        return {
            "session_id": session_id,
            "hint_level": request.hint_level,
            "hint": hint
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI hint generation failed: {str(error)}"
        )