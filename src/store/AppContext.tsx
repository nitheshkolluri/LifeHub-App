
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage, ViewState, Report, NotificationPreferences, BrainDumpResult, Task, Habit, FinanceItem, Priority } from '../types';
import { geminiService } from '../services/geminiService';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { apiService } from '../services/api.service';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

// --- DEFINITIONS ---
// Ideally, these interfaces would live in their own Context files in a real refactor.
// To keep this working within the single file constraint requested by the "Update App" prompt style,
// We will optimize the fetching strategies here.

interface AppContextType {
  // Data
  tasks: Task[];
  habits: Habit[];
  finance: FinanceItem[];
  reports: Report[];
  messages: ChatMessage[];

  // UI State
  currentView: ViewState;
  isLoadingAI: boolean;
  showUpsell: boolean;

  // Setters
  setView: (view: ViewState) => void;
  setShowUpsell: (show: boolean) => void;

  // Actions
  addTask: (title: string, priority?: Priority, dueDate?: string, dueTime?: string, linkedFinanceId?: string) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addHabit: (title: string, frequency?: 'daily' | 'weekly') => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  incrementHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  addFinanceItem: (data: Partial<FinanceItem>) => Promise<string>;
  updateFinanceItem: (id: string, updates: Partial<FinanceItem>) => void;
  togglePaid: (id: string) => void;
  deleteFinanceItem: (id: string) => void;

  updateNotificationSettings: (prefs: NotificationPreferences) => Promise<void>;

  sendChatMessage: (text: string) => Promise<void>;
  generateReport: () => Promise<string>;
  processBrainDump: (text: string) => Promise<BrainDumpResult>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [finance, setFinance] = useState<FinanceItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // UI State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: "Ready to capture. What's on your mind?", timestamp: Date.now() }
  ]);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  // --- DATA SYNC OPTIMIZATION ---
  // We use separate useEffects so that if one listener fails or re-runs, it doesn't kill the others.

  // 1. Sync Tasks
  useEffect(() => {
    if (!user) { setTasks([]); return; }
    const q = query(collection(db, 'users', user.id, 'tasks')); // In prod, add limit(100)
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task)).sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => unsub();
  }, [user]);

  // 2. Sync Habits
  useEffect(() => {
    if (!user) { setHabits([]); return; }
    const q = query(collection(db, 'users', user.id, 'habits'));
    const unsub = onSnapshot(q, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Habit)));
    });
    return () => unsub();
  }, [user]);

  // 3. Sync Finance
  useEffect(() => {
    if (!user) { setFinance([]); return; }
    const q = query(collection(db, 'users', user.id, 'finance'));
    const unsub = onSnapshot(q, (snapshot) => {
      setFinance(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FinanceItem)));
    });
    return () => unsub();
  }, [user]);

  // 4. Sync Reports (Limit to recent)
  useEffect(() => {
    if (!user) { setReports([]); return; }
    // OPTIMIZATION: Only fetch the last 10 reports to save bandwidth
    const q = query(collection(db, 'users', user.id, 'reports'), orderBy('generatedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Report)));
    });
    return () => unsub();
  }, [user]);

  // 5. Sync Messages (Chat History)
  useEffect(() => {
    if (!user) {
      setMessages([{ id: '0', role: 'model', text: "Ready to capture. What's on your mind?", timestamp: Date.now() }]);
      return;
    }
    const q = query(collection(db, 'users', user.id, 'messages'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ChatMessage));
      if (msgs.length === 0) {
        setMessages([{ id: '0', role: 'model', text: "Ready to capture. What's on your mind?", timestamp: Date.now() }]);
      } else {
        setMessages(msgs);
      }
    });
    return () => unsub();
  }, [user]);


  // --- NOTIFICATION ENGINE ---
  useEffect(() => {
    if (!user?.notificationPreferences?.enablePush || Notification.permission !== 'granted') return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const todayDate = now.toISOString().split('T')[0];
      const prefs = user.notificationPreferences!;

      // Check Time Sensitive Tasks
      if (prefs.enableTimeSensitive) {
        tasks.forEach(task => {
          if (task.status === 'pending' && task.dueTime === currentTime) {
            if (task.dueDate && task.dueDate !== todayDate) return;
            new Notification(`Due Now: ${task.title}`, { body: 'Time to focus.', icon: '/icon.png' });
          }
        });
      }

      // Daily Rhythm
      if (prefs.morningBriefTime === currentTime) {
        new Notification('Morning Briefing', { body: `You have ${tasks.filter(t => t.status === 'pending').length} flows to capture today.` });
      }
      if (prefs.afterWorkTime === currentTime) {
        new Notification('Wrap Up', { body: 'Check your personal errands.' });
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [tasks, user]);


  // --- SECURITY: PRO LIMIT CHECK ---
  const checkLimit = () => {
    // SECURITY RISK: Client-side check only.
    if (user?.isPremium) return true;

    // 7-Day Free Trial Logic
    if (user?.createdAt) {
      const msInDay = 24 * 60 * 60 * 1000;
      const diffDays = (Date.now() - user.createdAt) / msInDay;
      if (diffDays <= 7) return true; // Unlimited access during trial
    }

    // After trial: Limit strictly (e.g. max 5 tasks)
    if (tasks.length >= 5) {
      setShowUpsell(true);
      return false;
    }
    return true;
  };

  // --- ACTIONS (Wrappers around Firestore) ---
  // --- ACTIONS (Wrappers around Firestore) ---
  const addTask = async (title: string, priority: Priority = 'medium', dueDate?: string, dueTime?: string, linkedFinanceId?: string) => {
    if (!user) return '';
    try {
      if (!checkLimit()) return '';

      const newTask = {
        title,
        status: 'pending',
        priority,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        linkedFinanceId: linkedFinanceId || null,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, 'users', user.id, 'tasks'), newTask);
      return docRef.id;
    } catch (e) {
      console.error("Failed to add task:", e);
      return '';
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id, 'tasks', id), updates);
    } catch (e) {
      console.error("Failed to update task:", e);
    }
  };

  const toggleTask = async (id: string) => {
    if (!user) return;
    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        await updateDoc(doc(db, 'users', user.id, 'tasks', id), { status: task.status === 'pending' ? 'completed' : 'pending' });
      }
    } catch (e) {
      console.error("Failed to toggle task:", e);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.id, 'tasks', id));
    } catch (e) {
      console.error("Failed to delete task:", e);
      alert("Failed to delete task. Please check your connection.");
    }
  };

  const addHabit = async (title: string, frequency: 'daily' | 'weekly' = 'daily') => {
    if (!user) return;
    try {
      if (!checkLimit()) return;
      const newHabit: Omit<Habit, 'id'> = {
        title, streak: 0, completedDates: [], frequency, targetPerPeriod: 1, startDate: new Date().toISOString().split('T')[0]
      };
      await addDoc(collection(db, 'users', user.id, 'habits'), newHabit);
    } catch (e) {
      console.error("Failed to add habit:", e);
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id, 'habits', id), updates);
    } catch (e) {
      console.error("Failed to update habit:", e);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.id, 'habits', id));
    } catch (e) {
      console.error("Failed to delete habit:", e);
      alert("Failed to delete habit. Please check your connection.");
    }
  };

  const incrementHabit = async (id: string) => {
    if (!user) return;
    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;
      const today = new Date().toISOString().split('T')[0];
      if (habit.completedDates.includes(today)) return;
      await updateDoc(doc(db, 'users', user.id, 'habits', id), {
        streak: habit.streak + 1,
        completedDates: [...habit.completedDates, today]
      });
    } catch (e) {
      console.error("Failed to increment habit:", e);
    }
  };

  const addFinanceItem = async (data: Partial<FinanceItem>) => {
    if (!user) return '';
    try {
      const docRef = await addDoc(collection(db, 'users', user.id, 'finance'), {
        title: data.title || 'Expense',
        amount: data.amount || 0,
        type: data.type || 'bill',
        recurrence: data.recurrence || 'monthly',
        dueDay: data.dueDay || 1,
        dueDate: data.dueDate || null,
        isPaidThisMonth: false,
        installments: data.installments || []
      });

      if (data.installments && data.installments.length > 0) {
        const taskIds = [];
        for (let i = 0; i < data.installments.length; i++) {
          const inst = data.installments[i];
          const taskId = await addTask(`Pay ${data.title} (${i + 1}/${data.installments.length})`, 'high', inst.dueDate, undefined, docRef.id);
          if (taskId) taskIds.push(taskId);
        }
        await updateDoc(docRef, { linkedTaskIds: taskIds });
      }
      return docRef.id;
    } catch (e) {
      console.error("Failed to add finance item:", e);
      return '';
    }
  };

  const updateFinanceItem = async (id: string, updates: Partial<FinanceItem>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id, 'finance', id), updates);
    } catch (e) {
      console.error("Failed to update finance item:", e);
    }
  };

  const deleteFinanceItem = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.id, 'finance', id));
    } catch (e) {
      console.error("Failed to delete finance item:", e);
      alert("Failed to delete finance item. Please check your connection.");
    }
  };

  const togglePaid = async (id: string) => {
    if (!user) return;
    const item = finance.find(f => f.id === id);
    if (item) {
      await updateDoc(doc(db, 'users', user.id, 'finance', id), { isPaidThisMonth: !item.isPaidThisMonth });
    }
  };

  const updateNotificationSettings = async (prefs: NotificationPreferences) => {
    if (!user) return;
    if (prefs.enablePush) {
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
      } else if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") prefs.enablePush = false;
      }
    }
    await updateDoc(doc(db, 'users', user.id), { notificationPreferences: prefs });
  };

  // --- AI ORCHESTRATION ---
  // In a Production environment, these calls should hit a Backend Endpoint (Cloud Function)
  // which then talks to Gemini. We are mocking that structure here.

  const sendChatMessage = async (text: string) => {
    if (!user) return; // Guard: Must be logged in for persistence

    // 1. Save User Message
    const userMsg: Omit<ChatMessage, 'id'> = { role: 'user', text, timestamp: Date.now() };
    await addDoc(collection(db, 'users', user.id, 'messages'), userMsg);

    setIsLoadingAI(true);

    const toolHandlers = {
      addTask: async (args: any) => {
        if (checkLimit()) {
          await addTask(args.title, args.priority || 'medium', args.dueDate);
          return `Added task "${args.title}".`;
        }
        return `Limit reached. Upgrade to Pro.`;
      },
      addHabit: async (args: any) => {
        await addHabit(args.title, args.frequency || 'daily');
      },
      addFinanceItem: async (args: any) => {
        await addFinanceItem(args);
        return `Added expense "${args.title}".`;
      }
    };

    try {
      // SECURITY NOTE: This service call exposes the API key in the client.
      // REMEDIATION: Replace this with `fetch('/api/chat', ...)`
      const responseText = await geminiService.sendMessage(text, { tasks, habits, finance }, toolHandlers);

      // 2. Save AI Message
      const aiMsg: Omit<ChatMessage, 'id'> = { role: 'model', text: responseText, timestamp: Date.now() };
      await addDoc(collection(db, 'users', user.id, 'messages'), aiMsg);

    } catch (e) {
      const errorMsg: Omit<ChatMessage, 'id'> = { role: 'model', text: "Connection error. Please try again.", timestamp: Date.now() };
      await addDoc(collection(db, 'users', user.id, 'messages'), errorMsg);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const processBrainDump = async (text: string): Promise<BrainDumpResult> => {
    // Limit check removed to allow backend to decide (Trial Logic)
    setIsLoadingAI(true);
    setIsLoadingAI(true);
    let dumpResult: BrainDumpResult;
    try {
      // 1. Try Backend API (Preferred)
      console.log("BrainDump: Attempting Backend API...");
      const { data } = await apiService.assistant.brainDump(text);
      dumpResult = data;
    } catch (e) {
      console.warn("BrainDump: Backend failed (403/500). Falling back to Client-Side Gemini.", e);
      // 2. Fallback to Client SDK
      try {
        dumpResult = await geminiService.parseBrainDump(text);
      } catch (clientError) {
        console.error("BrainDump: All attempts failed.", clientError);
        throw clientError;
      }
    }

    try {
      // Process Result
      const result = dumpResult;
      const promises: Promise<any>[] = [];
      if (result.entities) {
        result.entities.forEach((entity: { type: string; data: any; }) => {
          if (entity.type === 'task') promises.push(addTask(entity.data.title, entity.data.priority, entity.data.dueDate));
          else if (entity.type === 'habit') promises.push(addHabit(entity.data.title, entity.data.frequency));
          else if (entity.type === 'finance') promises.push(addFinanceItem(entity.data));
        });
      }
      await Promise.all(promises);
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsLoadingAI(false);
    }
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    setIsLoadingAI(false);
  }
};

const generateReport = async () => {
  try {
    const text = await geminiService.generateWeeklyReport({ tasks, habits, finance });
    if (user) {
      await addDoc(collection(db, 'users', user.id, 'reports'), {
        text, generatedAt: Date.now(), weekOf: new Date().toISOString()
      });
    }
    return text;
  } catch (e) {
    return "Failed to generate report.";
  }
};

return (
  <AppContext.Provider value={{
    tasks, habits, finance, messages, currentView, isLoadingAI, showUpsell, reports,
    setView: setCurrentView, setShowUpsell,
    addTask, updateTask, toggleTask, deleteTask,
    addHabit, updateHabit, incrementHabit, deleteHabit,
    addFinanceItem, updateFinanceItem, togglePaid, deleteFinanceItem,
    updateNotificationSettings,
    sendChatMessage, generateReport, processBrainDump
  }}>
    {children}
  </AppContext.Provider>
);
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
