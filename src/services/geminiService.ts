import { Task, Habit, FinanceItem, BrainDumpResult } from '../types';
import { apiService } from './api.service';

/**
 * Interface with the Secure Backend AI Service
 * This ensures all prompts pass through:
 * 1. PII Redactor
 * 2. Legal/Financial Safeguards
 * 3. Centralized Logging
 */
export const geminiService = {

  async sendMessage(
    message: string,
    context: { tasks: Task[], habits: Habit[], finance: FinanceItem[] },
    toolHandlers: any
  ): Promise<string> {
    try {
      // Send to Backend
      // The backend handles the context fetching internally based on User ID.
      const response = await apiService.assistant.chat(message, []);
      return response.data.response;
    } catch (error) {
      console.error('AI Chat Error:', error);
      return "I'm having trouble connecting to the secure server. Please try again.";
    }
  },

  async parseBrainDump(text: string): Promise<BrainDumpResult> {
    try {
      console.log('Sending to Secure Backend for Analysis...');
      const response = await apiService.assistant.brainDump(text);

      // The backend returns the parsed JSON directly
      return response.data;
    } catch (error) {
      console.error('Brain Dump Error:', error);
      throw error;
    }
  },

  async generateWeeklyReport(data: { tasks: Task[], habits: Habit[], finance: FinanceItem[] }): Promise<string> {
    try {
      // Data is fetched on backend for security/consistency
      const response = await apiService.assistant.generateReport();
      return response.data.report.text;
    } catch (error) {
      console.error('Report Generation Error:', error);
      throw error;
    }
  }
};
