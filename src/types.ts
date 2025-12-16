
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed' | 'snoozed';

export interface NotificationPreferences {
  quietTimeStart?: string; // e.g. "22:00"
  quietTimeEnd?: string;   // e.g. "07:00"
  afterWorkTime?: string;  // e.g. "18:00"
  morningBriefTime?: string; // e.g. "08:00"
  enableSMS?: boolean;
  enablePush?: boolean;
  enableTimeSensitive?: boolean; // Notify exactly at task dueTime
  phoneNumber?: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null; // ISO Date string (YYYY-MM-DD) or null
  dueTime?: string | null; // HH:MM 24h format
  linkedFinanceId?: string; // Link to a finance item (e.g. an installment)
  tags?: string[];
  createdAt: number;
}

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; // ISO Date strings (YYYY-MM-DD)
  frequency: HabitFrequency;
  targetPerPeriod: number; // e.g. 1 per day, 3 per week
  startDate?: string;
  color?: string; // Hex color for customization
}

export type FinanceType = 'bill' | 'subscription' | 'one-time';
export type Recurrence = 'monthly' | 'weekly' | 'one-off';

export interface Installment {
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

export interface FinanceItem {
  id: string;
  title: string;
  amount: number;
  type: FinanceType;
  recurrence: Recurrence;
  dueDay?: number; // Day of month (1-31) for monthly
  dueDate?: string; // Specific date for one-off
  isPaidThisMonth: boolean;
  installments?: Installment[]; // For split payments
  linkedTaskIds?: string[];
  merchant?: string;
}

export interface ChatMessage {
  id: string; // Document ID (or generated)
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number; // Unix millis
  isThinking?: boolean;
}

export interface Thread {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  messageCount: number;
}

export interface Report {
  id: string;
  text: string;
  generatedAt: number;
  weekOf: string;
}

export interface ParsedEntity {
  type: 'task' | 'habit' | 'finance';
  confidence: number;
  data: any; // Dynamic based on type
}

export interface BrainDumpResult {
  entities: ParsedEntity[];
  summary: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  HABITS = 'HABITS',
  FINANCE = 'FINANCE',
  ASSISTANT = 'ASSISTANT',
  REPORTS = 'REPORTS',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  plan: 'free' | 'pro';
  emailVerified: boolean;
  notificationPreferences?: NotificationPreferences;
  hasOnboarded?: boolean;
  createdAt?: number; // Timestamp
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
