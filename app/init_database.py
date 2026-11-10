import json
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "products.db"
JSON_PATH = BASE_DIR / "knowledge" / "products.json"

def initialize_database():
    with open(JSON_PATH, "r", encoding="utf-8") as file:
        products = json.load(file)

    connection = sqlite3.connect(DB_PATH)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            description TEXT,
            features TEXT,
            brand TEXT
        )
    """)

    for product in products:
        connection.execute("""
            INSERT OR REPLACE INTO products
            (id, name, category, price, stock, description, features, brand)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            product["id"],
            product["name"],
            product["category"],
            product["price"],
            product["stock"],
            product["description"],
            product["features"],
            product["brand"]
        ))

    connection.commit()
    connection.close()

    print(f"Database created and {len(products)} products imported.")

if __name__ == "__main__":
    initialize_database()