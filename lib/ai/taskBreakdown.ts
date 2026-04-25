import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIBreakdownResult {
  subtasks: { title: string }[];
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedMinutes: number;
  tip?: string;
}

const MODEL = 'gemini-1.5-flash';

export async function breakdownTask(
  title: string,
  description?: string,
  apiKey?: string
): Promise<AIBreakdownResult> {
  const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local');

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `You are a productivity assistant. Break down the following task into actionable subtasks.

Task title: "${title}"
${description ? `Task description: "${description.replace(/<[^>]*>/g, '')}"` : ''}

Respond ONLY with a valid JSON object (no markdown, no code block) in this exact shape:
{
  "subtasks": [
    { "title": "Step 1 description" },
    { "title": "Step 2 description" }
  ],
  "suggestedPriority": "low" | "medium" | "high" | "urgent",
  "estimatedMinutes": <integer total minutes>,
  "tip": "<one short productivity tip for this task>"
}

Rules:
- Generate 3 to 7 subtasks, each clear and actionable
- estimatedMinutes must be a realistic integer (e.g. 30, 60, 90, 120)
- suggestedPriority is one of: low, medium, high, urgent
- Return ONLY the JSON, nothing else`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip any accidental markdown code fences
  const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(clean) as AIBreakdownResult;
  return parsed;
}
