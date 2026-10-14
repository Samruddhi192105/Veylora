
import re
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]
KNOWLEDGE_FILE = BACKEND_DIR / "knowledge" / "veylora_lore.md"

STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "to", "of",
    "in", "on", "at", "for", "and", "or", "it", "this", "that",
    "what", "why", "how", "can", "i", "my", "me", "do", "does",
    "about", "with", "be", "have", "has", "could", "would",
}


def load_passages() -> list[str]:
    if not KNOWLEDGE_FILE.exists():
        raise FileNotFoundError(
            f"Knowledge file not found: {KNOWLEDGE_FILE}"
        )

    text = KNOWLEDGE_FILE.read_text(encoding="utf-8")

    sections = re.split(r"(?m)(?=^## )", text)

    return [
        section.strip()
        for section in sections
        if section.strip()
    ]


def retrieve_knowledge(
    question: str,
    top_k: int = 3,
) -> list[str]:
    if not question.strip():
        return []

    passages = load_passages()

    def tokenize(text: str) -> set[str]:
        words = re.findall(r"[a-z0-9]+", text.lower())
        return {
            word for word in words
            if word not in STOP_WORDS and len(word) > 1
        }

    query_words = tokenize(question)
    scored_passages = []

    for passage in passages:
        passage_words = tokenize(passage)
        score = len(query_words & passage_words)

        # Give a small boost when a query term appears
        # in the section heading.
        heading = passage.split("\n", 1)[0]
        heading_words = tokenize(heading)
        score += 2 * len(query_words & heading_words)

        if score > 0:
            scored_passages.append((score, passage))

    scored_passages.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    return [
        passage
        for _, passage in scored_passages[:max(1, top_k)]
    ]
