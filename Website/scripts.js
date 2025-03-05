// Function to call the API and display results
async function translateText() {
    const apiUrl = 'http://127.0.0.1:8000/headlines'; 
    const audioApiUrl = 'http://127.0.0.1:8000/generate-audio'; // Replace with your audio API URL

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fromLang: 'auto', // Automatically detect source language
                toLang: 'en'      // Translate to English
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Clear previous results
        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = '<h3>Original and Translated Text:</h3>';

        // Display the original and translated lines with audio play buttons
        for (const line of data.translatedLines) {
            const lineResult = document.createElement("div");
            lineResult.className = "line-result";

            // Generate audio for the translated text
            const audioUrl = await generateAudio(line.translated.translatedText, audioApiUrl);

            // Display the original and translated text with a play button
            lineResult.innerHTML = `
                <p><strong>Original:</strong> ${line.original}</p>
                <p><strong>Translated:</strong> ${line.translated.translatedText}</p>
                <p><strong>Source Language:</strong> ${line.translated.sourceLanguage}</p>
                <p><strong>Target Language:</strong> ${line.translated.targetLanguage}</p>
                ${audioUrl ? `<button onclick="playAudio('${audioUrl}')">Play Audio</button>` : 'Audio generation failed'}
                <hr>
            `;
            resultContainer.appendChild(lineResult);
        }

        // Show the result container
        resultContainer.style.display = "block";
    } catch (error) {
        console.error("Error translating text:", error);
        alert("An error occurred while translating the text. Please check the console for details.");
    }
}

// Function to generate audio for a given text
async function generateAudio(text, audioApiUrl) {
    try {
        const response = await fetch(audioApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

       // Convert the ReadableStream to a Blob
       const reader = response.body.getReader();
       const chunks = [];

       while (true) {
           const { done, value } = await reader.read();
           if (done) break;
           chunks.push(value);
       }

       const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
       const audioUrl = URL.createObjectURL(audioBlob);
       return audioUrl;
   } catch (error) {
       console.error("Error generating audio:", error);
       return null;
   }
}

// Function to play audio
function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
}

// Attach the translateText function to the button click event
document.getElementById("translateButton").addEventListener("click", translateText);