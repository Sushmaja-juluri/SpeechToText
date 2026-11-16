const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const output = document.getElementById("output");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const languageSelect = document.getElementById("languageSelect");
const recordCard = document.querySelector(".record-card");
const recordTitle = document.getElementById("recordTitle");
const recordHint = document.getElementById("recordHint");
const recordStatus = document.getElementById("recordStatus");
const message = document.getElementById("message");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

function setRecording(active) {
  isRecording = active;
  recordCard.classList.toggle("recording", active);
  recordTitle.textContent = active ? "I'm listening..." : "Ready to listen?";
  recordHint.textContent = active
    ? "Speak clearly. Select Stop recording when you're finished."
    : "Tap the microphone and start speaking naturally.";
  recordStatus.textContent = active ? "Microphone is active" : "Microphone is off";
  recordBtn.setAttribute("aria-label", active ? "Recording in progress" : "Start recording");
  recordBtn.disabled = active;
  stopBtn.disabled = !active;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#f0a0c8" : "#83d9b5";
}

function updateCharacterCount() {
  const count = output.value.length;
  document.getElementById("characterCount").textContent = `${count} character${count === 1 ? "" : "s"}`;
}
output.addEventListener("input", updateCharacterCount);

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => setRecording(true);

  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const phrase = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += phrase + " ";
      else interimText += phrase;
    }
    if (finalText) {
      output.value = `${output.value.trim()} ${finalText}`.trim();
      updateCharacterCount();
    }
    recordStatus.textContent = interimText ? `Hearing: ${interimText}` : "Speech captured";
  };

  recognition.onerror = (event) => {
    const messages = {
      "not-allowed": "Microphone permission was blocked. Allow microphone access in your browser.",
      "no-speech": "No speech was detected. Try speaking a little louder.",
      "audio-capture": "No microphone was found. Check your device settings.",
      "network": "Speech recognition needs a working network connection."
    };
    showMessage(messages[event.error] || `Speech recognition error: ${event.error}`, true);
    setRecording(false);
  };

  recognition.onend = () => setRecording(false);
} else {
  recordBtn.disabled = true;
  recordTitle.textContent = "Speech recognition unavailable";
  recordHint.textContent = "Try Google Chrome or Microsoft Edge on a secure connection.";
  recordStatus.textContent = "Browser does not support speech recognition";
  showMessage("Your browser does not support speech recognition. You can still type text below and analyse it.", true);
}

recordBtn.addEventListener("click", () => {
  if (!recognition || isRecording) return;
  recognition.lang = languageSelect.value;
  try {
    recognition.start();
    showMessage("");
  } catch (error) {
    showMessage("The microphone could not start. Please try again.", true);
  }
});

stopBtn.addEventListener("click", () => {
  if (recognition && isRecording) recognition.stop();
});

clearBtn.addEventListener("click", () => {
  output.value = "";
  updateCharacterCount();
  showMessage("Transcript cleared.");
});

function addEmptyState(container, text) {
  container.replaceChildren();
  const p = document.createElement("p");
  p.className = "empty-state";
  p.textContent = text;
  container.appendChild(p);
}

function renderFrequency(frequency) {
  const container = document.getElementById("frequencyList");
  container.replaceChildren();
  const entries = Object.entries(frequency || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!entries.length) return addEmptyState(container, "No frequent keywords found yet.");
  const max = entries[0][1] || 1;
  entries.forEach(([word, count]) => {
    const row = document.createElement("div");
    row.className = "frequency-row";
    const label = document.createElement("span");
    label.textContent = word;
    const track = document.createElement("div");
    track.className = "frequency-track";
    const fill = document.createElement("div");
    fill.className = "frequency-fill";
    fill.style.width = `${(count / max) * 100}%`;
    track.appendChild(fill);
    const value = document.createElement("span");
    value.className = "frequency-value";
    value.textContent = count;
    row.append(label, track, value);
    container.appendChild(row);
  });
}

function renderEntities(entities) {
  const container = document.getElementById("entitiesList");
  container.replaceChildren();
  if (!entities || !entities.length) return addEmptyState(container, "No named entities were detected in this transcript.");
  entities.forEach((entity) => {
    const chip = document.createElement("span");
    chip.className = "entity-chip";
    chip.append(document.createTextNode(entity.text));
    const type = document.createElement("small");
    type.textContent = entity.label;
    chip.appendChild(type);
    container.appendChild(chip);
  });
}

function renderPOS(items) {
  const container = document.getElementById("posList");
  container.replaceChildren();
  if (!items || !items.length) return addEmptyState(container, "No parts of speech to display.");
  items.slice(0, 80).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "pos-item";
    const word = document.createElement("b");
    word.textContent = item.word;
    tag.append(word, document.createTextNode(` · ${item.tag}`));
    container.appendChild(tag);
  });
}

function renderWords(id, words, emptyText) {
  const container = document.getElementById(id);
  container.replaceChildren();
  if (!words || !words.length) {
    const span = document.createElement("span");
    span.className = "empty-state";
    span.textContent = emptyText;
    container.appendChild(span);
    return;
  }
  [...new Set(words)].slice(0, 35).forEach((word) => {
    const chip = document.createElement("span");
    chip.className = "word-chip";
    chip.textContent = word;
    container.appendChild(chip);
  });
}

async function analyzeText() {
  const text = output.value.trim();
  if (!text) {
    showMessage("Please record, type or paste some text first.", true);
    output.focus();
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analysing...";
  showMessage("Analysing your transcript...");

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        language: languageSelect.value
      })
    });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();

    document.getElementById("wordCount").textContent = (text.match(/\b[\p{L}\p{N}']+\b/gu) || []).length;
    document.getElementById("tokenCount").textContent = data.count ?? (data.tokens || []).length;
    document.getElementById("entityCount").textContent = (data.entities || []).length;

    renderFrequency(data.frequency);
    renderEntities(data.entities);
    renderPOS(data.pos);
    renderWords("lemmasList", data.lemmas, "No lemmas found.");
    renderWords("stopwordsList", data.stopwords, "No stop words found.");

    showMessage("Analysis complete. Your language insights are ready.");
    document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error(error);
    showMessage("Couldn't analyse the text. Please check your connection and try again.", true);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = 'Analyse text <span aria-hidden="true">↗</span>';
  }
}

analyzeBtn.addEventListener("click", analyzeText);
updateCharacterCount();
setRecording(false);
