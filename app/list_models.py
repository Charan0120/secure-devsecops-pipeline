import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

load_dotenv(Path(__file__).resolve().parent / ".env")

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

print("Models available to your API key:\n")

for model in client.models.list():
    name = model.name or ""

    if "gemini" in name.lower():
        print(name)