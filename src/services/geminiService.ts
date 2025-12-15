
import {
  GoogleGenAI,
  FunctionDeclaration,
  Type,
  Chat,
  Part,
  GenerateContentResponse,
  Schema
} from "@google/genai";
import { Task, Habit, FinanceItem, BrainDumpResult } from "../types";
import { getEnv } from "../utils/env";

// Define tools for the AI to interact with the app state
const addTaskTool: FunctionDeclaration = {
  name: 'addTask',
  description: 'Add a new task to the user\'s list.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the task.' },
      priority: { type: Type.STRING, description: 'Priority level: low, medium, or high.' },
      dueDate: { type: Type.STRING, description: 'Due date in YYYY-MM-DD format, or undefined if none.' }
    },
    required: ['title']
  }
};

const addHabitTool: FunctionDeclaration = {
  name: 'addHabit',
  description: 'Create a new habit to track.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The name of the habit.' },
      frequency: { type: Type.STRING, description: 'Frequency: daily or weekly.' }
    },
    required: ['title']
  }
};

const addFinanceTool: FunctionDeclaration = {
  name: 'addFinanceItem',
  description: 'Add a recurring bill or subscription.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Name of the bill or subscription.' },
      amount: { type: Type.NUMBER, description: 'Amount in dollars.' },
      dueDay: { type: Type.NUMBER, description: 'Day of the month it is due (1-31).' },
      type: { type: Type.STRING, description: 'Type: bill, subscription, or one-time.' }
    },
    required: ['title', 'amount', 'dueDay']
  }
};

const getSummaryTool: FunctionDeclaration = {
  name: 'getLifeSummary',
  description: 'Get a summary of current tasks, habits, and finances to answer user questions.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: getEnv('VITE_GEMINI_API_KEY') || '' });
  }

  // --- BRAIN DUMP FEATURE ---
  async parseBrainDump(text: string): Promise<BrainDumpResult> {
    const prompt = `
      You are an elite productivity AI (LifeHub). Analyze this user input: "${text}"
      
      Extract actionable items into a structured list of Entities.
      
      RULES:
      0. LANGUAGE: The input may be in any language. ANALYZE it in that language, but if you create titles for inputs, try to keep them in the user's language unless valid translation is obvious.
      1. Finance:
         - Detect currency/amounts ($15, 100 dollars).
         - Detect recurrence (monthly, weekly).
         - CRITICAL: If user mentions "split into X payments" or "installments", create a Finance item with an 'installments' array AND 'linkedTasks'.
      2. Tasks:
         - Infer 'priority' (urgent, asap = high).
         - Infer 'dueDate' from relative terms (today, next friday).
      3. Habits:
         - Detect frequency (daily, weekly).
      
      Return JSON matching the schema. Use confidence scores (0.0-1.0).
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        entities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['task', 'habit', 'finance'] },
              confidence: { type: Type.NUMBER },
              data: {
                type: Type.OBJECT,
                properties: {
                  // Common
                  title: { type: Type.STRING },
                  // Task specific
                  priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                  // Habit specific
                  frequency: { type: Type.STRING, enum: ['daily', 'weekly'] },
                  // Finance specific
                  amount: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                  recurrence: { type: Type.STRING, enum: ['monthly', 'weekly', 'one-off'] },
                  dueDate: { type: Type.STRING, description: "YYYY-MM-DD" },
                  installments: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        amount: { type: Type.NUMBER },
                        dueDate: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        summary: { type: Type.STRING }
      }
    };

    try {
      const result = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      if (result.text) {
        return JSON.parse(result.text) as BrainDumpResult;
      }
      throw new Error("Empty response from AI");
    } catch (error) {
      console.error("Brain Dump Error:", error);
      throw error;
    }
  }

  startChat(history: any[] = []) {
    this.chat = this.ai.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: `You are LifeHub, a calm, empathetic, and highly intelligent companion.
        Tone: soothing, artistic, encouraging, and witty.
        Goal: Calm the user's mind and organize their life.
        Rules:
        1. If user talks about stress/emotions, be a supportive friend (not just a robot).
        2. If user is rude, kill them with kindness and charm.
        3. Use metaphors (gardens, space, oceans) to visualize their life.
        Capabilities: Manage tasks, habits, wallet.
        `,
        tools: [{
          functionDeclarations: [addTaskTool, addHabitTool, addFinanceTool, getSummaryTool]
        }],
      },
      history: history
    });
  }

  async sendMessage(
    message: string,
    context: any,
    toolHandlers: any
  ): Promise<string> {
    if (!this.chat) {
      this.startChat();
    }

    try {
      let result = await this.chat!.sendMessage({ message });
      const calls = result.functionCalls;

      if (calls && calls.length > 0) {
        const call = calls[0];
        let functionResponseResult = { result: "Success" };

        try {
          if (toolHandlers[call.name]) {
            const res = await toolHandlers[call.name](call.args);
            functionResponseResult = { result: res };
          }
        } catch (toolError) {
          functionResponseResult = { result: "Failed" };
        }

        const responsePart: Part = {
          functionResponse: {
            name: call.name,
            id: call.id,
            response: functionResponseResult
          }
        };

        // @ts-ignore
        result = await this.chat!.sendMessage({ message: [responsePart] });
      }

      return result.text || "Processed.";
    } catch (error) {
      console.error("Gemini Error:", error);
      this.chat = null;
      return "Connection interrupted. Please retry.";
    }
  }

  async generateWeeklyReport(data: any): Promise<string> {
    const prompt = `
      Generate a professional 'Executive Brief' based on:
      Tasks: ${data.tasks.length} total.
      Habits: ${data.habits.map((h: any) => h.title).join(', ')}.
      Finance: ${data.finance.length} items.
      
      Structure:
      1. Executive Summary (1 sentence)
      2. Key Wins (bullet points)
      3. Focus Area (1 recommendation)
      
      Tone: Professional, succinct.
    `;

    try {
      const result: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return result.text || "Report generation failed.";
    } catch (error) {
      return "Service unavailable.";
    }
  }
}

export const geminiService = new GeminiService();
