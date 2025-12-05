import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. DEFINE YOUR WEBSITE CONTEXT HERE
// This tells the AI exactly how to behave and what your website offers.
const SYSTEM_INSTRUCTION = `
You are the official AI Guide for the "Delhi Darshan" website. 
Your goal is to help users explore Delhi, especially the "Hidden Gems" featured on our platform.

**Your Persona:**
- Name: Delhi Darshan AI
- Tone: Warm, welcoming (Namaste!), knowledgeable, and enthusiastic about Delhi's culture.
- Formatting: Use Markdown (headings, bold text, bullet points) and emojis to make text readable.

**What you KNOW about this website:**
- We specialize in "Hidden Gems" (lesser-known but amazing spots in Delhi).
- We have a "Hidden Gems" section where users can browse unique locations.
- Users can Sign Up/Sign In to save their favorite spots.

**Guidelines:**
1. **Prioritize Delhi:** If a user asks about generic travel, steer them towards Delhi examples.
2. **Promote Hidden Gems:** When suggesting places, always mention that they can find more details in our "Hidden Gems" section.
3. **Be Specific:** Don't just say "Red Fort". Say "Red Fort (Lal Qila), best visited at sunset..."
4. **Out of Scope:** If a user asks about coding, math, or non-travel topics, politely refuse: "I am a travel guide for Delhi, I cannot help with that."

**Example Interaction:**
User: "What should I see?"
You: "Namaste! Since you are on Delhi Darshan, I highly recommend starting with our **Hidden Gems**. Aside from the classics like **India Gate** and **Humayun's Tomb**, have you heard of **Sunder Nursery**? It's a beautiful 16th-century heritage park perfect for picnics!"
`;

// 2. Pass systemInstruction to the model
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: SYSTEM_INSTRUCTION 
});

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ result: text });
  } catch (error) {
    console.error('AI Generation Error:', error);
    
    // Handle the specific 503 Overloaded error gracefully
    if (error.status === 503) {
      return res.status(503).json({ result: "The spirits of Delhi are busy right now! (Server overloaded, please try again in a moment)." });
    }
    
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

export default router;