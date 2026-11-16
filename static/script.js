const button = document.getElementById("recordBtn");
const output = document.getElementById("output");

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "en-US";

button.onclick = function () {
    recognition.start();
};

recognition.onresult = function (event) {

    const text = event.results[0][0].transcript;

    fetch("/analyze", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text: text
        })

    })

    .then(res => res.json())

    .then(data => {

        let result = "";

        result += "Speech Text\n";
        result += "--------------------------\n";
        result += data.text + "\n\n";

        result += "Word Count\n";
        result += "--------------------------\n";
        result += data.count + "\n\n";

        result += "Tokens\n";
        result += "--------------------------\n";
        result += data.tokens.join(", ") + "\n\n";

        result += "Stop Words\n";
        result += "--------------------------\n";
        result += data.stopwords.join(", ") + "\n\n";

        result += "Lemmas\n";
        result += "--------------------------\n";
        result += data.lemmas.join(", ") + "\n\n";

        result += "POS Tags\n";
        result += "--------------------------\n";

        data.pos.forEach(item => {
            result += item.word + " : " + item.tag + "\n";
        });

        result += "\nNamed Entities\n";
        result += "--------------------------\n";

        data.entities.forEach(item => {
            result += item.text + " : " + item.label + "\n";
        });

        
        result += "Word Frequency\n";
        result += "--------------------------\n";

        for (const word in data.frequency) {
            result += word + " : " + data.frequency[word] + "\n";
        }

        output.value = result;

    });

};
