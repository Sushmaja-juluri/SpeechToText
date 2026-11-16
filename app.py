from flask import Flask, render_template, request, jsonify
import spacy
from collections import Counter

app = Flask(__name__)

nlp = spacy.load("en_core_web_sm")

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    text = request.json["text"]

    doc = nlp(text)

    tokens = [token.text for token in doc]

    stopwords = [token.text for token in doc if token.is_stop]

    lemmas = [token.lemma_ for token in doc]

    pos = [
        {
            "word": token.text,
            "tag": token.pos_
        }
        for token in doc
    ]

    entities = [
        {
            "text": ent.text,
            "label": ent.label_
        }
        for ent in doc.ents
    ]

    

    words = [
        token.text.lower()
        for token in doc
        if token.is_alpha and not token.is_stop
    ]

    frequency = Counter(words)

    return jsonify({

        "text": text,
        "count": len(tokens),
        "tokens": tokens,
        "stopwords": stopwords,
        "lemmas": lemmas,
        "pos": pos,
        "entities": entities,
        "frequency": frequency

    })


if __name__ == "__main__":
    app.run(debug=True)