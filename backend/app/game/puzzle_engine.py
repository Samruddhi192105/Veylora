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
        "required_items": [],
        "reward": "small_key"
    },

    "safe": {
        "id": "safe",
        "name": "The Old Safe",
        "type": "combination",
        "solution": "7392",
        "required_clues": [
            "bookshelf_sequence"
        ],
        "required_items": [
            "small_key"
        ],
        "reward": "exit_key"
    }
}


def get_puzzle(puzzle_id: str):

    return PUZZLES.get(puzzle_id)


def validate_puzzle_solution(
    puzzle_id: str,
    answer: str,
    discovered_clues: list[str],
    inventory: list[str]
):

    puzzle = get_puzzle(puzzle_id)

    if puzzle is None:
        return False, "Puzzle not found"

    for clue in puzzle["required_clues"]:

        if clue not in discovered_clues:
            return False, "You have not discovered all required clues"

    for item in puzzle["required_items"]:

        if item not in inventory:
            return False, "You do not have the required item"

    if answer.strip() != puzzle["solution"]:
        return False, "Incorrect solution"

    return True, puzzle["reward"]