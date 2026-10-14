from app.ai.gemini_provider import GeminiProvider
from app.ai.rag import retrieve_relevant_knowledge


class GameMaster:

    def __init__(self):
        self.provider = GeminiProvider()

    def generate_hint(
        self,
        game: dict,
        hint_level: int
    ) -> str:

        if hint_level not in [1, 2, 3]:
            raise ValueError(
                "Hint level must be 1, 2, or 3"
            )

        query = self._build_retrieval_query(game)

        knowledge = retrieve_relevant_knowledge(query)

        knowledge_text = "\n\n".join(knowledge)

        game_state = f"""
Current room:
{game.get("current_room")}

Inventory:
{game.get("inventory", [])}

Discovered objects:
{game.get("discovered_objects", [])}

Discovered clues:
{game.get("discovered_clues", [])}

Solved puzzles:
{game.get("solved_puzzles", [])}

Attempts:
{game.get("attempts", [])}
"""

        prompt = f"""
You are the Game Master of Veylora, an interactive escape-room game.

Your job is to give the player a hint.

IMPORTANT RULES:

1. Never invent a clue.
2. Never invent an object.
3. Never invent a puzzle.
4. Never invent a password or solution.
5. Never reveal information that is not supported by the
   supplied knowledge or current game state.
6. Do not modify the game state.
7. Do not claim that a puzzle is solved.
8. Do not directly perform actions for the player.
9. Stay inside the Veylora game world.
10. Keep the hint concise and immersive.

Hint level:

Level 1:
Give a subtle observation or direction.
Do not reveal the answer.

Level 2:
Give a clearer connection between discovered information.
Still do not reveal the final answer.

Level 3:
Give strong guidance toward the correct solution.
You may explain the relationship between the clues,
but do not invent information.

CURRENT GAME STATE:
{game_state}

RELEVANT VEYLORA KNOWLEDGE:
{knowledge_text}

Generate one hint for the player.
"""

        return self.provider.generate(prompt).strip()

    def _build_retrieval_query(self, game: dict) -> str:

        parts = [
            game.get("current_room", ""),
            " ".join(game.get("discovered_objects", [])),
            " ".join(game.get("discovered_clues", [])),
            " ".join(game.get("solved_puzzles", [])),
        ]

        return " ".join(parts)