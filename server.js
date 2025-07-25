const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Halal Checker Backend is running!' });
});

app.post('/analyze-ingredients', async (req, res) => {
    try {
        const { ingredients } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in Islamic dietary laws and halal food analysis. Provide accurate, detailed analysis of food ingredients for halal compliance."
                },
                {
                    role: "user",
                    content: `Analyze the following ingredients list for halal compliance. Determine if the product is halal, haram, or unclear.

Ingredients: ${ingredients}

Please provide a JSON response with the following structure:
{
    "status": "halal/haram/unclear",
    "confidence": 0.95,
    "reasoning": "Detailed explanation of the analysis",
    "haramIngredients": ["list", "of", "haram", "ingredients"],
    "suspiciousIngredients": ["list", "of", "suspicious", "ingredients"],
    "recommendations": ["list", "of", "recommendations"]
}`
                }
            ],
            temperature: 0.3
        });

        const content = completion.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            res.json(analysis);
        } else {
            throw new Error('No valid JSON found in response');
        }
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to analyze ingredients' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});