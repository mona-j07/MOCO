import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { processInput, analyzeMood } from './src/lib/ai-core';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// MOCO AI Endpoint
app.post('/api/moco', async (req, res) => {
  const { input, mode, userName } = req.body;
  
  if (!input || !mode) {
    return res.status(400).json({ error: "Missing input or mode" });
  }

  try {
    console.log(`Processing MOCO request: [${mode}] ${input}`);
    const response = await processInput(input, mode, userName);
    res.json(response);
  } catch (error: any) {
    console.error("MOCO AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mood Analysis Endpoint
app.post('/api/mood', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const mood = await analyzeMood(text);
    res.json({ mood });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: "ok", system: "MOCO Backend" });
});

app.listen(port, () => {
  console.log(`MOCO Backend running at http://localhost:${port}`);
});
