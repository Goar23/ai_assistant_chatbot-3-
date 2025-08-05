// File: /index.js
// GPT-4 powered multi-functional chatbot backend

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Use env var for safety

app.post('/chat', async (req, res) => {
  const { userMessage, functionType, language = 'en-US' } = req.body;

  let prompt;
  switch (functionType) {
    case 'faq':
      prompt = `You are a professional assistant. Answer this question briefly and clearly: ${userMessage}`;
      break;
    case 'summarize':
      prompt = `Summarize the following content in 100 words or fewer: ${userMessage}`;
      break;
    case 'content_creation':
      prompt = `Create engaging content based on this idea: ${userMessage}`;
      break;
    case 'education':
      prompt = `Explain this concept to a student in simple terms: ${userMessage}`;
      break;
    case 'scheduling':
      prompt = `Suggest a time for an appointment based on this request: ${userMessage}`;
      break;
    default:
      prompt = `You are a smart AI assistant. Help the user with this request: ${userMessage}`;
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that communicates in a friendly, professional tone.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiMessage = response.data.choices[0].message.content;
    res.json({ response: aiMessage, language });

  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response from GPT-4' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chatbot server running on port ${PORT}`));


// File: /public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kush AI Assistant</title>
  <style>
    body { font-family: Arial; padding: 20px; background: #f4f4f4; }
    #chatbox { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .message { margin: 10px 0; }
    .bot { color: blue; }
    .user { color: green; }
    #voiceBtn { margin-left: 10px; }
  </style>
</head>
<body>
  <div id="chatbox">
    <h2>Kush AI Assistant</h2>
    <div id="messages"></div>
    <input type="text" id="input" placeholder="Type your message...">
    <button id="voiceBtn" onclick="startVoiceInput()">🎤 Speak</button><br><br>
    <label for="language">Language:</label>
    <select id="language">
      <option value="en-US">English</option>
      <option value="es-ES">Spanish</option>
      <option value="fr-FR">French</option>
      <option value="de-DE">German</option>
      <option value="hi-IN">Hindi</option>
    </select>
    <select id="functionType">
      <option value="faq">FAQ</option>
      <option value="summarize">Summarize</option>
      <option value="content_creation">Content Creation</option>
      <option value="education">Education</option>
      <option value="scheduling">Scheduling</option>
    </select>
    <button onclick="sendMessage()">Send</button>
  </div>

  <script>
    async function sendMessage() {
      const input = document.getElementById('input');
      const functionType = document.getElementById('functionType').value;
      const language = document.getElementById('language').value;
      const message = input.value;
      if (!message) return;

      document.getElementById('messages').innerHTML += `<div class='message user'><strong>You:</strong> ${message}</div>`;

      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: message, functionType, language })
      });
      const data = await response.json();
      document.getElementById('messages').innerHTML += `<div class='message bot'><strong>Bot:</strong> ${data.response}</div>`;
      speakResponse(data.response, data.language);
      input.value = '';
    }

    function speakResponse(text, lang) {
      if (!('speechSynthesis' in window)) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || 'en-US';
      speechSynthesis.speak(utterance);
    }

    function startVoiceInput() {
      if (!('webkitSpeechRecognition' in window)) {
        alert('Your browser does not support voice input.');
        return;
      }
      const recognition = new webkitSpeechRecognition();
      recognition.lang = document.getElementById('language').value;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = function(event) {
        const voiceText = event.results[0][0].transcript;
        document.getElementById('input').value = voiceText;
      };
      recognition.onerror = function(err) {
        alert('Voice recognition error: ' + err.error);
      };
      recognition.start();
    }
  </script>
</body>
</html>


// File: package.json
{
  "name": "ai-chatbot",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "body-parser": "^1.20.0",
    "express": "^4.18.0"
  }
}


// File: Procfile (for Heroku)
web: node index.js


// File: .gitignore
node_modules
.env
