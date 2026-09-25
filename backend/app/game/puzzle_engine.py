PUZZLES = {
    "locked_drawer": {
        "id": "locked_drawer",
        "name": "The Locked Drawer",
        "type": "combination",
        "solution": "1145",
        "required_clues": [
            "clock_time_1145",
            "diary_message"
        ],
        "reward": "small_key"
    }
}


def get_puzzle(puzzle_id: str):

    return PUZZLES.get(puzzle_id)


def validate_puzzle_solution(
    puzzle_id: str,
    answer: str,
    discovered_clues: list[str]
):

    puzzle = get_puzzle(puzzle_id)

    if puzzle is None:
        return False, "Puzzle not found"

    for clue in puzzle["required_clues"]:

        if clue not in discovered_clues:
            return False, "You have not discovered all required clues"

    if answer.strip() != puzzle["solution"]:
        return False, "Incorrect solution"

    return True, puzzle["reward"]