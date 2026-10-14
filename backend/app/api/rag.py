
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.database.mongodb import db
from app.rag.game_master import generate_game_hint

router = APIRouter(prefix="/rag", tags=["RAG"])

game_sessions = db["game_sessions"]


class HintRequest(BaseModel):
    question: str = Field(min_length=2, max_length=500)
    session_id: str | None = None
    hint_level: int = Field(default=1, ge=1, le=3)


@router.post("/hint")
def get_rag_hint(request: HintRequest):
    player_context = ""

    if request.session_id:
        session = game_sessions.find_one(
            {"session_id": request.session_id},
            {"_id": 0},
        )

        if session is None:
            raise HTTPException(
                status_code=404,
                detail="Game session not found.",
            )

        # Include only relevant progress fields, not the entire session.
        safe_fields = (
            "status",
            "discovered_clues",
            "discovered_objects",
            "inventory",
            "solved_puzzles",
        )

        progress = {
            field: session[field]
            for field in safe_fields
            if field in session
        }

        player_context = str(progress)[:2000]

    try:
        result = generate_game_hint(
            question=request.question,
            hint_level=request.hint_level,
            player_context=player_context,
        )
        return result

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=502,
            detail=f"AI Game Master error: {type(exc).__name__}: {exc}"
        ) from exc
