from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

while True:
    text = input("\nEnter text (or type 'exit'): ")
    
    if text.lower() == "exit":
        break

    results = classifier(text)[0]
    results = sorted(results, key=lambda x: x['score'], reverse=True)

    print("\nTop emotions:")
    for r in results[:3]:
        print(f"{r['label']} → {round(r['score'], 3)}")