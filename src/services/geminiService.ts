import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { BrainDumpResult } from "../types";
import { getEnv } from "../utils/env";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  // SWITCH TO VERIFIED AVAILABLE MODEL from User Logs
  // 'gemini-2.0-flash-001' is explicitly listed in position 5.
  private modelName = 'gemini-2.0-flash-001';

  constructor() {
    // Standard SDK Initialization
    const apiKey = getEnv('VITE_GEMINI_API_KEY');
    if (!apiKey) {
      console.error("GeminiService: API Key missing! Check .env");
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'MISSING_KEY');

    // DEBUG: List models in console to be safe
    this.listModels();

    // Initialize Model with Safety Settings disabled (BLOCK_NONE)
    this.model = this.genAI.getGenerativeModel({
      model: this.modelName,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });
  }

  // Debug Helper
  async listModels() {
    try {
      const key = getEnv('VITE_GEMINI_API_KEY');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (response.ok) {
        const data = await response.json();
        // console.log("=== GEMINI AVAILABLE MODELS ===", data.models?.map((m: any) => m.name));
      }
    } catch (e) {
      console.error("Failed to list models debug", e);
    }
  }

  // --- BRAIN DUMP FEATURE ---
  async parseBrainDump(text: string): Promise<BrainDumpResult> {
    // 1. ANCHOR DATE: Get User's Local Date as YYYY-MM-DD
    // "en-CA" format is YYYY-MM-DD. Good trick.
    const today = new Date().toLocaleDateString('en-CA');
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM

    const prompt = `
      You are LifeHub, an elite productivity AI (Model: ${this.modelName}).
      
      CONTEXT:
      - Current Date: "${today}" (YYYY-MM-DD).
      - Current Time: "${nowTime}" (HH:MM).
      - User Input: "${text}"
      
      GOAL: Clean text, split items, and CALCULATE EXACT ISO DATES.
      
      RULES:
      1. FIX TYPOS: "at.Ten" -> "at 10:00", "by milk" -> "Buy milk".
      2. SPLIT HARD: "Do X and Do Y" -> 2 items.
      3. EXTRACT TIME/DATE: 
         - "at 5pm" -> dueTime: "17:00". Remove from title.
         - "tomorrow" -> dueDate: (Calculate ${today} + 1 day). Remove from title.
         - "next friday" -> Calculate date.
      4. CLEAN TITLES: Remove "Remind me to", "please". Start with Verb.
      
      5. FINANCE LOGIC (Critical):
         - Money ($) or "Rent", "Bill" = type: "finance".
         - "Rent $500" -> Title: "Rent", Amount: 500.
      
      6. AFTERPAY / SPLIT LOGIC (Fortnightly):
         - Trigger: "Afterpay", "Zip", "Split".
         - Action: Create 4 SEPARATE FINANCE ITEMS.
         - Item 1: "${today}" (Today). Amount/4.
         - Item 2: "${today} + 14 days" (Calculate ISO). Amount/4.
         - Item 3: "${today} + 28 days" (Calculate ISO). Amount/4.
         - Item 4: "${today} + 42 days" (Calculate ISO). Amount/4.
         - Title format: "Title (1/4)", "Title (2/4)"...
      
      OUTPUT SCHEMA (STRICT JSON):
      {
        "entities": [
          {
            "type": "task" | "habit" | "finance",
            "data": {
              "title": string,
              "priority": "low" | "medium" | "high",
              "dueDate": "YYYY-MM-DD" | null, // MUST be calculated ISO string
              "dueTime": "HH:MM" | null,
              "amount": number | null
            }
          }
        ],
        "summary": string
      }
      
      Return ONLY valid JSON. No markdown.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      // Clean JSON
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as BrainDumpResult;
    } catch (error) {
      console.error("Gemini Brain Dump Error:", error);
      throw error;
    }
  }

  // --- CHAT FEATURE ---
  async sendMessage(message: string, context: any, toolHandlers: any): Promise<string> {
    try {
      const prompt = `System: You are LifeHub AI. Brief, Witty, Helpful.\nUser: ${message}`;
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return "I'm updating my systems. Please try again.";
    }
  }

  async generateWeeklyReport(data: any): Promise<string> {
    try {
      const prompt = `Summarize this week: ${JSON.stringify(data)}`;
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return "Report unavailable.";
    }
  }
}

export const geminiService = new GeminiService();
