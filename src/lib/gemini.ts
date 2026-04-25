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


const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://moco-backend.onrender.com' 
  : 'http://localhost:3001';

export async function processInput(input: string, mode: PAOSMode, userName?: string): Promise<AIResponse> {
  const response = await fetch(`${BACKEND_URL}/api/moco`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, mode, userName })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process input");
  }

  return response.json();
}

export async function analyzeMood(text: string): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/mood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze mood");
  }

  const data = await response.json();
  return data.mood;
}
