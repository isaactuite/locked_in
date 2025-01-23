
// Load the environment variables from the .env file
require('dotenv').config();

// Access your API key from the environment variables
const apiKey = process.env.API_KEY;


const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-ai');
const messagesCont = document.getElementById('messages')
const inputContainer = document.getElementById('input-container');
const conversationHistoryKey = 'conversationHistory';
const maxHeight = 200;  

chatInput.addEventListener('input', () => {
    // Reset height to calculate correct growth
    chatInput.style.height = 'auto';
    inputContainer.style.height = 'auto';

    // Calculate new height
    const newHeight = chatInput.scrollHeight;

    // Check if the height exceeds the max height
    if (newHeight <= maxHeight) {
        // Apply the new height
        chatInput.style.height = `${newHeight}px`;
        inputContainer.style.height = `calc(${newHeight}px + 20px)`; // Adjust for padding
    } else {
        // Prevent further height growth
        chatInput.style.height = `${maxHeight}px`;
        inputContainer.style.height = `calc(${maxHeight}px + 20px)`; // Adjust for padding
    }
});

function saveToLocalStorage(message, role) {
    // Fetch existing history
    let history = JSON.parse(localStorage.getItem(conversationHistoryKey)) || [];
    // Append the new message
    history.push({ role, content: message });
    // Save updated history
    localStorage.setItem(conversationHistoryKey, JSON.stringify(history));
}

function displayMessage(message, className, skipSaving = false) {
    const div = document.createElement('div');
    div.classList.add('message', className);

    if (className === 'ai-message') {
        // Parse the markdown using Marked.js
        const htmlContent = marked.parse(message);

        // Sanitize the HTML to avoid any malicious content
        const sanitizedHtmlContent = DOMPurify.sanitize(htmlContent);

        // Create a container to hold the HTML
        div.innerHTML = sanitizedHtmlContent;

        // Highlight code blocks using a custom approach
        const codeBlocks = div.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            if (block.classList.contains('language-python')) {
                block.innerHTML = highlightPython(block.textContent);
            }
        });
    } else {
        // For user messages, display as plain text
        div.textContent = message;
    }

    messagesCont.appendChild(div);
    messagesCont.scrollTop = messagesCont.scrollHeight; // Scroll to the bottom

    // Save to localStorage unless skipSaving is true
    if (!skipSaving) {
        saveToLocalStorage(message, className === 'ai-message' ? 'assistant' : 'user');
    }
}


function highlightPython(code) {
    // First, escape HTML to prevent rendering unintended tags
    code = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Define token types and their patterns
const tokenTypes = [
    { type: 'comment', regex: /#.*/ },
    { type: 'string', regex: /(['"])(?:(?=(\\?))\2.)*?\1/ },
    { type: 'keyword', regex: /\b(def|return|if|else|elif|for|while|import|from|as|with|try|except|class|self|True|False|None|print|range)\b/ },
    { type: 'builtin', regex: /\b(print|len|range|str|int|float|list|dict|set|tuple)\b/ },
    { type: 'number', regex: /\b\d+(\.\d+)?\b/ },
    { type: 'function', regex: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ }
];

    // Tokenize the code
    const tokens = [];
    let remainingCode = code;

    while (remainingCode.length > 0) {
        let matched = false;

        for (const tokenType of tokenTypes) {
            const match = tokenType.regex.exec(remainingCode);
            if (match && match.index === 0) {
                tokens.push({ 
                    type: tokenType.type, 
                    value: match[0] 
                });
                remainingCode = remainingCode.slice(match[0].length);
                matched = true;
                break;
            }
        }

        // If no token type matches, take the first character as plain text
        if (!matched) {
            tokens.push({ 
                type: 'plain', 
                value: remainingCode[0] 
            });
            remainingCode = remainingCode.slice(1);
        }
    }

    // Convert tokens to highlighted HTML
    return tokens.map(token => {
        switch(token.type) {
            case 'comment':
                return `<span class="comment">${token.value}</span>`;
            case 'string':
                return `<span class="string">${token.value}</span>`;
            case 'keyword':
                return `<span class="keyword">${token.value}</span>`;
            case 'number':
                return `<span class="number">${token.value}</span>`;
            case 'function':
                return `<span class="function">${token.value}</span>`;
            default:
                return token.value;
        }
    }).join('');
}
function loadConversationHistory() {
    const history = JSON.parse(localStorage.getItem(conversationHistoryKey)) || [];
    history.forEach(entry => {
        // Pass true to skip saving while reloading history
        displayMessage(entry.content, entry.role === 'assistant' ? 'ai-message' : 'user-message', true);
    });
}


// Call this function on page load
window.addEventListener('DOMContentLoaded', loadConversationHistory);



function clearConversationHistory() {
    localStorage.removeItem(conversationHistoryKey);
    messagesCont.innerHTML = ''; // Clear UI
}

document.getElementById('clear-chat').addEventListener('click', clearConversationHistory);

// Function to make the API request
function getAIResponse(userInput) {
    const requestBody = {
        model: "gpt-4o-mini", // Specify the correct model
        messages: [{ role: "user", content: userInput }],
        max_tokens: 150
    };

    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`AI request failed: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        const aiResponse = data.choices && data.choices.length > 0
            ? data.choices[0].message.content.trim()
            : "No response from AI";
        return aiResponse;
    })
    .catch(error => {
        console.error('Error:', error);
        return "Error contacting AI: " + error.message;
    });
}

// Handle button click
sendButton.addEventListener('click', () => {
    const userInput = chatInput.value.trim();

    if (userInput) {
        sendButton.disabled = true;
        displayMessage(userInput, 'user-message');
        chatInput.value = '';
        chatInput.style.height = 'auto'; // Reset textarea height

        getAIResponse(userInput).then(aiResponse => {
            displayMessage(aiResponse, 'ai-message');
        }).finally(() => {
            sendButton.disabled = false;
        });
    }
});



