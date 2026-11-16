# Speech-to-Text using NLP

A Flask web application that uses the browser's Web Speech API to convert speech
into text, then sends the recognized text to a Flask backend for NLP analysis
with spaCy.

## Features

- Browser-based speech recognition (English - US)
- Word count and tokenization
- Stop-word extraction
- Lemmatization
- Part-of-speech tagging
- Named entity recognition
- Word frequency analysis

## Tech stack

Python, Flask, HTML, CSS, JavaScript, Web Speech API, spaCy.

## Run locally

1. Create and activate a Python virtual environment.
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the app:

   ```bash
   python app.py
   ```

4. Open http://127.0.0.1:5000 in a supported browser.

## Deployment

For a Render Web Service:
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

Browser speech recognition generally requires a supported browser and a secure
context (HTTPS) when deployed.
