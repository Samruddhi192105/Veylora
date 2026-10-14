from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any

from app.auth import get_current_user, require_owned_game
from app.game.game_events import record_event
from app.game.game_engine import (
    update_game_session
)
from app.game.puzzle_engine import validate_puzzle_solution


router = APIRouter(
    prefix="/puzzles",
    tags=["Puzzles"]
)


class PuzzleAttempt(BaseModel):
    answer: str


@router.post("/{session_id}/{puzzle_id}/solve")
def solve_puzzle(
    session_id: str,
    puzzle_id: str,
    attempt: PuzzleAttempt,
    user: dict[str, Any] = Depends(get_current_user),
):

    game = require_owned_game(session_id, user)

    is_correct, result = validate_puzzle_solution(
        puzzle_id,
        attempt.answer,
        game["discovered_clues"],
        game["inventory"]
    )

    # Increase total number of attempts
    new_attempt_count = game["attempts"] + 1

    # Record every puzzle attempt
    record_event(
        session_id,
        "PUZZLE_ATTEMPTED",
        {
            "puzzle_id": puzzle_id
        }
    )

    # Incorrect answer
    if not is_correct:

        update_game_session(
            session_id,
            {
                "attempts": new_attempt_count
            }
        )

        return {
            "correct": False,
            "message": result,
            "attempts": new_attempt_count
        }

    # Correct answer
    solved_puzzles = game["solved_puzzles"]

    if puzzle_id not in solved_puzzles:

        solved_puzzles.append(puzzle_id)

        # Record successful puzzle solving
        record_event(
            session_id,
            "PUZZLE_SOLVED",
            {
                "puzzle_id": puzzle_id,
                "reward": result
            }
        )

    # Add reward to inventory
    inventory = game["inventory"]

    if result not in inventory:

        inventory.append(result)

        # Record item acquisition
        record_event(
            session_id,
            "ITEM_ACQUIRED",
            {
                "item_id": result
            }
        )

    # Save updated game state
    update_game_session(
        session_id,
        {
            "solved_puzzles": solved_puzzles,
            "inventory": inventory,
            "attempts": new_attempt_count
        }
    )

    return {
        "correct": True,
        "message": "Puzzle solved!",
        "reward": result,
        "attempts": new_attempt_count
    }