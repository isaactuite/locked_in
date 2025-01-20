// Replace 'YOUR_API_KEY' with your actual OpenAI API key
const OPENAI_API_KEY = 'YOUR_API_KEY';
const API_URL = 'https://api.openai.com/v1/chat/completions';

// DOM Elements
const messagesDiv = document.getElementById('messages');
const inputField = document.getElementById('input');
const sendButton = document.getElementById('send');

// Add event listener to the send button
sendButton.addEventListener('click', sendMessage);

// Function to append messages to the chat window
function appendMessage(sender, text) {
    const message = document.createElement('div');
    message.textContent = `${sender}: ${text}`;
    messagesDiv.appendChild(message);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
}

// Function to send a message to OpenAI's API
async function sendMessage() {
    const userInput = inputField.value.trim();
    if (!userInput) return;

    // Display user message
    appendMessage('You', userInput);
    inputField.value = '';

    // Call OpenAI API
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: userInput }],
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            throw new Error('Error: ' + response.statusText);
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        // Display bot response
        appendMessage('ChatGPT', botReply);

    } catch (error) {
        appendMessage('Error', error.message);
    }
}