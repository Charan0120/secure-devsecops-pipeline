from rag import index_products, generate_rag_answer

if __name__ == "__main__":
    print("Indexing products...")
    index_products()

    print("\nTesting Aura RAG...")

    while True:
        question = input("\nAsk Aura: ")

        if question.lower() in ["exit", "quit"]:
            break

        answer = generate_rag_answer(question)
        print("\nAura:", answer)