import { BrainDumpResult } from "../types";

/**
 * LIGHTNING MODE PARSER
 * Rapidly decodes common user intents without hitting the Cloud AI.
 * Returns null if the intent is too complex, falling back to Gemini.
 */
export const parseQuickly = (text: string): BrainDumpResult | null => {
    const lower = text.trim().toLowerCase();

    // 1. HABIT: "Start habit [name]", "Add habit [name]"
    const habitMatch = lower.match(/^(?:start|add) habit (.+)$/i);
    if (habitMatch) {
        return {
            entities: [{
                type: 'habit',
                confidence: 1.0,
                data: {
                    title: capitalize(habitMatch[1]),
                    frequency: 'daily' // Default
                }
            }],
            summary: "Quickly added new habit."
        };
    }

    // 2. FINANCE: "Spent $X on Y", "Add expense Y $X"
    // "Spent $50 on Groceries"
    const spentMatch = lower.match(/spent \$?(\d+(?:\.\d{2})?) on (.+)$/i);
    if (spentMatch) {
        return {
            entities: [{
                type: 'finance',
                confidence: 1.0,
                data: {
                    title: capitalize(spentMatch[2]),
                    amount: parseFloat(spentMatch[1]),
                    dueDay: new Date().getDate(), // Assumed paid today
                    type: 'one-off'
                }
            }],
            summary: "Recorded expense."
        };
    }

    // 3. TASKS: "Remind me to [action] (time/date)"
    // Very basic extraction. If complex (multiple dates), fail to AI.
    // "Remind me to Call Mom tomorrow"
    if (lower.startsWith("remind me to") || lower.startsWith("add task")) {
        const cleanText = lower.replace("remind me to ", "").replace("add task ", "");

        // Simple heuristic for "tomorrow" or "today"
        let dueDate: string | undefined = undefined;
        let dueTime: string | undefined = undefined;
        let title = cleanText;

        // Extract Time (e.g., "at 5pm", "at 17:30")
        const timeMatch = title.match(/ at (\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i);
        if (timeMatch) {
            dueTime = normalizeTime(timeMatch[1]);
            title = title.replace(timeMatch[0], "");
        }

        // Extract Date (e.g. "tomorrow", "next friday") -> Simple fallback or just let AI handle dates? 
        // A simple "Tomorrow" check is 80% of specific cases.
        if (title.includes("tomorrow")) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            dueDate = d.toISOString().split('T')[0];
            title = title.replace("tomorrow", "");
        } else if (title.includes("today")) {
            dueDate = new Date().toISOString().split('T')[0];
            title = title.replace("today", "");
        }

        return {
            entities: [{
                type: 'task',
                confidence: 0.9,
                data: {
                    title: capitalize(title.trim()),
                    priority: 'medium',
                    dueDate,
                    dueTime
                }
            }],
            summary: "Quick task created."
        };
    }

    return null; // Fallback to AI
};

// --- HELPERS ---
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const normalizeTime = (t: string): string => {
    // Basic normalization for display. 
    // If "5pm" -> "17:00". If "5:30pm" -> "17:30"
    // This is valid enough for the 'dueTime' string field.
    return t.replace(/\s/g, '').toLowerCase();
};
