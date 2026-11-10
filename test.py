
import os
from dotenv import load_dotenv
from google import genai

# Load the same API key and model used by Flask
load_dotenv("app/.env")

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in app/.env")
    raise SystemExit(1)

try:
    print(f"Testing Gemini model: {model}")

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=model,
        contents="Reply with exactly: Gemini API is working!"
    )

    if response.text:
        print("\nSUCCESS! Gemini API responded:")
        print(response.text)
    else:
        print("\nGemini returned an empty response.")

except Exception as e:
    print("\nFAILED: Gemini API did not respond successfully.")
    print("Error:", str(e))
