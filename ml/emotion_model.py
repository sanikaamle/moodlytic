import sys
import json
from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

def predict_emotions(text):
    results = classifier(text)[0]
    results = sorted(results, key=lambda x: x['score'], reverse=True)

    return [
        {
            "emotion": r["label"],
            "confidence": round(r["score"], 3)
        }
        for r in results[:3]
    ]

if __name__ == "__main__":
    text = sys.argv[1]  

    emotions = predict_emotions(text)

    print(json.dumps(emotions)) 