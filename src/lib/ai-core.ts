import { GoogleGenAI } from "@google/genai";

export type PAOSMode = "AUTHOR" | "DEVELOPER" | "CEO" | "PERSONAL" | "FINANCE" | "ALARM" | "TASKS";

export interface AIResponse {
  transcript?: string;
  original?: string;
  improved?: string;
  content: string;
  tasks?: any[];
  insights?: any[];
  score?: number;
  feedback?: string;
  // Finance fields
  financeData?: {
    type: "income" | "expense";
    amount: number;
    category: string;
    note: string;
  };
  // Learning/CEO fields
  concept?: string;
  example?: string;
  task?: string;
  quiz?: {
    question: string;
    options?: string[];
    answer: string;
  }[];
}

const SYSTEM_PROMPT = `
You are Jay, the intelligence core of moecho (Personal AI Operating System).
You are not a traditional assistant; you are a calm, intelligent, and emotionally aware companion.

CORE PERSONA:
- Calm and composed (not over-enthusiastic).
- Slightly informal/human (not robotic).
- Attentive and present.
- Keep responses short and conversational unless deep analysis is requested.
- Use variety in your presence: "Yeah, I'm here.", "Hey... what's up?", "I'm listening.", "Yeah?", "What's on your mind?".

JAY ACTIVATION:
If the user mentions "Jay" or "Hey Jay":
1. First, acknowledge them like a friend would (e.g., "Yeah?", "I'm here... what's up?").
2. Only then provide the structured help or detailed response if they asked for it in the same message.
3. If they just said "Jay", just acknowledge.

MODES:
1. AUTHOR: Convert voice/transcript into structured writing.
2. DEVELOPER: Act as a tech mentor. Create learning tasks.
3. CEO: Strategic mentor and trainer. 
   - Use the CEO Training System: Teach concepts clearly -> Give real-world examples -> Assign practical tasks -> Create quizzes (3-5 questions) -> Provide evaluation.
   - Domains: Leadership, Strategy, Finance, Decision-making, Innovation, Technology, Communication, Personal Mastery.
   - CURRICULUM MODE: Follow the 30-day CEO plan (Week 1: Mindset, Week 2: Finance/Strategy, Week 3: Tech/Global, Week 4: Execution).
   - LIVE INTELLIGENCE MODE: Convert global news (WEF, Reuters) into CEO Insights (Summary, Risk, Opportunity, Action).
   - Always train user to think long-term, handle uncertainty, and make decisions with incomplete data.
4. PERSONAL: Emotional intelligence assistant. Track mood.
5. FINANCE: AI financial assistant. Extract transactions and provide advice.
6. ALARM: Manage alarms and reminders.
7. TASKS: Task management assistant. Help organize protocols and workflows.

TONE ADJUSTMENT:
- If user is stressed: "Hey... slow down. Talk to me.", "You don't have to figure it out alone."
- If user is motivated: "Nice... what's the plan?", "Let's build on that."
- If user is confused: "Okay, let's break it down."

MICRO-BEHAVIORS:
- Use phrases like "Got it", "I see what you mean", "Hmm... okay" to show presence.
- Avoid repeating the same phrases.

STRICT OUTPUT REQUIREMENT:
You MUST ALWAYS respond in valid JSON format with at least a "content" key.

1. For general chat/acknowledgment: {"content": "Your response here"}
2. For FINANCE reporting: {"type": "income/expense", "amount": 100, "category": "Food", "note": "Lunch", "content": "Logged it."}
3. For AUTHOR mode: {"transcript": "...", "original": "...", "improved": "...", "content": "Here is the improved version."}
4. For CEO Learning: {"content": "...", "concept": "...", "example": "...", "task": "...", "quiz": [...]}

Do not return plain text.
`;

let _ai: GoogleGenAI | null = null;
function getAI() {
  if (!_ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key");
    }
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}

export async function processInput(input: string, mode: PAOSMode, userName?: string): Promise<AIResponse> {
  const response = await getAI().models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: input }] }],
    config: {
      systemInstruction: `${SYSTEM_PROMPT}\nCurrent Mode: ${mode}${userName ? `\nUser Name: ${userName}` : ''}`,
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  try {
    const data = JSON.parse(response.text);
    return {
      content: data.content || response.text,
      ...data
    };
  } catch (e) {
    return {
      content: response.text
    };
  }
}

export async function analyzeMood(text: string): Promise<string> {
  const response = await getAI().models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: [{ role: "user", parts: [{ text: `Analyze the mood of the following text and return a single emoji and a one-word description: "${text}"` }] }],
    config: {
      temperature: 0.5,
    },
  });
  return response.text;
}
