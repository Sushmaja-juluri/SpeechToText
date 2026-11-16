
from flask import Flask, render_template, request, jsonify
import spacy
import re
from collections import Counter

app = Flask(__name__)

# Keep your existing English NLP model
nlp = spacy.load("en_core_web_sm")

# Unicode-aware patterns: these work with many writing systems
WORD_PATTERN = re.compile(
    r"[^\W\d_]+(?:['’][^\W\d_]+)*",
    re.UNICODE
)

TOKEN_PATTERN = re.compile(
    r"\w+|[^\w\s]",
    re.UNICODE
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}

    text = data.get("text", "").strip()
    language = data.get("language", "")

    if not text:
        return jsonify({"error": "Please provide some text."}), 400

    # Use the English spaCy model only for English
    if language.startswith("en"):
        doc = nlp(text)

        tokens = [token.text for token in doc]

        stopwords = [
            token.text for token in doc if token.is_stop
        ]

        lemmas = [
            token.lemma_ for token in doc
        ]

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
        word_count = sum(1 for token in doc if token.is_alpha)

        advanced_analysis = True

    else:
        # Basic multilingual analysis without an English NLP model
        tokens = TOKEN_PATTERN.findall(text)
        words = WORD_PATTERN.findall(text)

        frequency = Counter(
            word.lower() for word in words
        )

        word_count = len(words)

        # These advanced English-only features are not available
        # for other languages in this lightweight version.
        stopwords = []
        lemmas = words
        pos = []
        entities = []

        advanced_analysis = False

    return jsonify({
        "text": text,
        "language": language,
        "count": len(tokens),
        "word_count": word_count,
        "tokens": tokens,
        "stopwords": stopwords,
        "lemmas": lemmas,
        "pos": pos,
        "entities": entities,
        "frequency": dict(frequency),
        "advanced_analysis": advanced_analysis
    })


if __name__ == "__main__":
    app.run(debug=True)
