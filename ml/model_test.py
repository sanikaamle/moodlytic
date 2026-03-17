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

texts = [
    "I feel exhausted and nothing motivates me anymore",
    "I had a great day today",
    "I don't feel like talking to anyone",
    "Life feels meaningless"
]

for text in texts:
    result = classifier(text)

    label = result[0]["label"]
    score = result[0]["score"]

    print("Input:", text)
    print("Prediction:", label_map[label])
    print("Confidence:", round(score, 3))
    print()