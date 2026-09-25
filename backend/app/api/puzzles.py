from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.game.game_engine import (
    get_game_session,
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
    attempt: PuzzleAttempt
):

    game = get_game_session(session_id)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game session not found"
        )

    is_correct, result = validate_puzzle_solution(
        puzzle_id,
        attempt.answer,
        game["discovered_clues"]
    )

    new_attempt_count = game["attempts"] + 1

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

    solved_puzzles = game["solved_puzzles"]

    if puzzle_id not in solved_puzzles:
        solved_puzzles.append(puzzle_id)

    inventory = game["inventory"]

    if result not in inventory:
        inventory.append(result)

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