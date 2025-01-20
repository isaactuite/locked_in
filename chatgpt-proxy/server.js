const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


app.post('/api/chat', async (req, res) => {
    const userInput = req.body.message;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));