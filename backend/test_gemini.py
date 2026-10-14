from dotenv import load_dotenv

from app.ai.gemini_provider import GeminiProvider


load_dotenv()


provider = GeminiProvider()

response = provider.generate(
    "Reply with exactly: Veylora AI connection successful."
)

print(response)