KNOWLEDGE_BASE = [
    {
        "id": "study_room",
        "content": """
        The player is trapped inside an abandoned study.
        The study contains a grandfather clock, an old painting,
        an old diary, a bookshelf, a locked drawer, an old safe,
        an old telephone, and an exit door.
        """
    },

    {
        "id": "clock_clue",
        "content": """
        The grandfather clock has stopped at 11:45.
        This creates the clue clock_time_1145.
        """
    },

    {
        "id": "diary_clue",
        "content": """
        The old diary contains a message that is relevant
        to the locked drawer.
        The diary contributes the clue diary_message.
        """
    },

    {
        "id": "drawer_puzzle",
        "content": """
        The locked drawer is a combination puzzle.
        Its solution is 1145.
        The puzzle requires the clock_time_1145 and diary_message clues.
        Solving it rewards the player with the small_key.
        """
    },

    {
        "id": "bookshelf_clue",
        "content": """
        The bookshelf contains the clue bookshelf_sequence.
        This clue is required to solve the old safe.
        """
    },

    {
        "id": "safe_puzzle",
        "content": """
        The old safe is a combination puzzle.
        Its solution is 7392.
        The player must have the small_key and discover
        the bookshelf_sequence clue.
        Solving the safe rewards the player with the exit_key.
        """
    },

    {
        "id": "exit",
        "content": """
        The exit door requires the exit_key.
        When the player has the exit_key and uses the exit door,
        the game is completed and the player escapes the study.
        """
    }
]


def retrieve_relevant_knowledge(query: str) -> list[str]:
    """
    Simple keyword-based retrieval for the first RAG version.
    """

    query_words = set(
        query.lower().split()
    )

    results = []

    for document in KNOWLEDGE_BASE:
        content_words = set(
            document["content"].lower().split()
        )

        overlap = query_words.intersection(content_words)

        if overlap:
            results.append(
                document["content"].strip()
            )

    return results[:3]