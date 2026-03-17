from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="ourafla/mental-health-bert-finetuned"
)

label_map = {
    "LABEL_0": "Anxiety",
    "LABEL_1": "Depression",
    "LABEL_2": "Normal",
    "LABEL_3": "Suicidal"
}

def predict_text(text):
    result = classifier(text)

    label = result[0]["label"]
    score = result[0]["score"]

    return {
        "label": label_map[label],
        "confidence": round(score,3)
    }