import os
import sqlite3
from pathlib import Path
import requests
import chromadb
from dotenv import load_dotenv
from google import genai
from google.genai import types

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")

DB_PATH = BASE_DIR / "products.db"
CHROMA_PATH = BASE_DIR / "chroma_db"

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

embedding_model = "gemini-embedding-001"

chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))

collection = chroma_client.get_or_create_collection(
    name="aura_products"
)


def create_embedding(text, task_type):
    result = client.models.embed_content(
        model=embedding_model,
        contents=text,
        config=types.EmbedContentConfig(
            task_type=task_type
        )
    )

    return result.embeddings[0].values

def generate_with_colab(question, products):

    api_url = os.getenv("AURA_AI_URL")
    api_token = os.getenv("AURA_AI_TOKEN")

    if not api_url or not api_token:
        raise RuntimeError("Colab API configuration is missing.")

    context = ""

    for product in products:
        context += f"""
Product: {product['name']}
Category: {product['category']}
Price: Rs. {product['price']}
Stock: {product['stock']}
Description: {product['description']}
Features: {product['features']}
Brand: {product['brand']}
"""

    response = requests.post(
        f"{api_url.rstrip('/')}/generate",
        headers={
            "x-api-token": api_token
        },
        json={
            "question": question,
            "context": context
        },
        timeout=120
    )

    response.raise_for_status()

    return response.json()["answer"]

def get_products():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    products = connection.execute(
        "SELECT * FROM products"
    ).fetchall()

    connection.close()
    return products


def index_products():
    products = get_products()

    if not products:
        print("No products found in SQLite.")
        return

    for product in products:
        product_text = (
            f"Product: {product['name']}. "
            f"Category: {product['category']}. "
            f"Description: {product['description']}. "
            f"Features: {product['features']}. "
            f"Brand: {product['brand']}."
        )

        embedding = create_embedding(
            product_text,
            "RETRIEVAL_DOCUMENT"
        )

        collection.upsert(
            ids=[str(product["id"])],
            documents=[product_text],
            embeddings=[embedding],
            metadatas=[{
                "product_id": product["id"],
                "name": product["name"]
            }]
        )

    print(f"Indexed {len(products)} products into ChromaDB.")


def retrieve_products(question, limit=3):
    if collection.count() == 0:
        return []

    query_embedding = create_embedding(
        question,
        "RETRIEVAL_QUERY"
    )

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(limit, collection.count())
    )

    ids = results["ids"][0]

    if not ids:
        return []

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    placeholders = ",".join("?" for _ in ids)

    products = connection.execute(
        f"""
        SELECT * FROM products
        WHERE id IN ({placeholders})
        """,
        [int(product_id) for product_id in ids]
    ).fetchall()

    connection.close()

    product_map = {product["id"]: dict(product) for product in products}

    # Preserve the semantic ranking returned by ChromaDB.
    return [
        product_map[int(product_id)]
        for product_id in ids
        if int(product_id) in product_map
    ]
def is_greeting(question):
    greetings = [
        "hi",
        "hello",
        "hey",
        "hee",
        "good morning",
        "good afternoon",
        "good evening"
    ]

    return question.strip().lower() in greetings
def generate_rag_answer(question):

    if is_greeting(question):
        return (
            "Hello! Welcome to Aura Store. "
            "How can I help you find the right product today?"
        )

    products = retrieve_products(question)

    if not products:
        return "I couldn't find relevant products in our store catalogue."

    try:
        return generate_with_colab(question, products)

    except requests.exceptions.RequestException as e:
        print("Colab connection error:", e)

        return (
            "Aura AI is temporarily unable to reach its AI server. "
            "Please try again."
        )

    except Exception as e:
        print("Aura AI error:", e)

        return "Sorry, I couldn't generate an answer right now."