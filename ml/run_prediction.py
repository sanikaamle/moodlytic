from prediction import predict_text

while True:
    text = input("Enter text: ")

    result = predict_text(text)

    print("Prediction:", result["label"])
    print("Confidence:", result["confidence"])
    print()