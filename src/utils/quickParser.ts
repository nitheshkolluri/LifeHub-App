
import { BrainDumpResult } from "../types";

// Helper: The core logic for ONE thought
const getLocalDateString = (d: Date = new Date()) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

const parseSingleIntent = (text: string): BrainDumpResult | null => {
    const lower = text.trim();

    // 1. HABIT: "Start habit [name]", "Add habit [name]"
    // Also "Add a ritual to [name]"
    const habitMatch = lower.match(/^(?:start|add|create)\s+(?:a\s+)?(?:habit|ritual)\s+(?:to\s+)?(.+)$/i);
    if (habitMatch) {
        return {
            entities: [{
                type: 'habit',
                confidence: 1.0,
                data: {
                    title: capitalize(habitMatch[1].replace(/^to\s+/, '')), // remove leading 'to' if dup
                    frequency: 'daily'
                }
            }],
            summary: "Created habit."
        };
    }

    // 2. FINANCE
    // STRICTER: Must have explicit context OR currency symbol
    // Matches: "Spent 50 on X", "Paid 50", "$50 for X", "50 dollars on"
    const spentMatch = lower.match(/(?:spent|paid|cost|bought|added expense)\s+(?:.*?)\$?(\d+(?:\.\d{2})?)\s*(?:on|for)?\s*(.+)$/i) ||
        lower.match(/\$(\d+(?:\.\d{2})?)\s*(?:on|for)?\s*(.+)$/i);

    if (spentMatch) {
        const amount = parseFloat(spentMatch[1]);
        const description = spentMatch[2].trim();
        const keywords = ["afterpay", "zip", "klarna", "affirm"];
        const isBNPL = keywords.some(k => lower.includes(k));

        if (isBNPL) {
            const installment = amount / 4;
            const entities = [];
            for (let i = 0; i < 4; i++) {
                const d = new Date();
                d.setDate(d.getDate() + (i * 14));
                entities.push({
                    type: 'finance',
                    confidence: 1.0,
                    data: {
                        title: `${capitalize(description)} (${i + 1}/4)`,
                        amount: parseFloat(installment.toFixed(2)),
                        dueDate: getLocalDateString(d),
                        type: 'bill'
                    }
                });
            }
            return { entities, summary: `Split payment.` };
        }

        return {
            entities: [{
                type: 'finance',
                confidence: 1.0,
                data: {
                    title: capitalize(description),
                    amount: amount,
                    dueDay: new Date().getDate(),
                    type: 'one-off'
                }
            }],
            summary: "Recorded expense."
        };
    }

    // 3. TASKS (Fallback for everything else)
    // Relaxed Logic: "Study history", "Go for a run", "Call mom" -> All Tasks.
    // Restriction: Block profanity/vulgarity.

    const badWords = ["fuck", "shit", "bitch", "cunt", "asshole", "dick", "pussy", "whore", "slut", "bastard"];
    if (badWords.some(w => lower.includes(w))) {
        return null; // Silent reject for now, or could return specific error.
    }

    // Clean common prefixes if they exist, but don't require them.
    let cleanText = lower.replace(/^(?:remind me to|remind me|add task|remember to|i want to|need to|to|please)\s+/i, "");

    // Capitalize first letter
    cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

    let dueDate: string | undefined = undefined;
    let dueTime: string | undefined = undefined;
    let title = cleanText;

    // Detect Time (Robust Regex)
    // Matches: "at 5pm", "5pm", "11:20PM", "11:20 pm", "09:20AM"
    const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i;
    const timeMatch = title.match(timeRegex);

    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const meridian = timeMatch[3]?.trim().toLowerCase().replace(/\./g, '');
        if (meridian === 'pm' && hours < 12) hours += 12;
        if (meridian === 'am' && hours === 12) hours = 0;
        dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        title = title.replace(timeRegex, "").trim();

        // INTELLIGENT DEFAULT: If time is set, assume Today unless specified
        if (!dueDate) {
            dueDate = getLocalDateString();
        }
    }

    // RUN-ON SENTENCE DETECTOR
    // If the remaining title STILL contains action verbs like "Call", "Buy", "Remind",
    // then the user likely chained commands without "AND".
    // Example: "Buy coffee Call mom" -> Title: "coffee Call mom".
    // Action: Fail to null -> Cloud AI handles sophisticated splitting.
    const runOnRegex = /\b(remind me|add task|remember to|call|buy|get|pay|check|email|text|msg|message|write)\b/i;

    const match = title.match(runOnRegex);
    // If match found, AND it is NOT at the very start (index 0), then it's a run-on.
    if (match && match.index! > 0) {
        return null;
    }

    // Detect Date
    if (/\btomorrow\b/i.test(title)) {
        const d = new Date(); d.setDate(d.getDate() + 1);
        dueDate = getLocalDateString(d);
        title = title.replace("tomorrow", "");
    } else if (title.includes("today")) {
        dueDate = getLocalDateString();
        title = title.replace("today", "");
    }

    return {
        entities: [{
            type: 'task',
            confidence: 0.9,
            data: { title: capitalize(title.trim()), priority: 'medium', dueDate, dueTime }
        }],
        summary: "Task created."
    };

    // 4. FALLBACK: RETURN NULL
    return null;
};

// EMERGENCY FALLBACK: When Cloud AI Fails (Offline/Error), we still try to be smart.
export const emergencyParse = (text: string): BrainDumpResult => {
    const rawLower = text.toLowerCase();

    // 1. Afterpay/Split Logic (Local Implementation)
    if (rawLower.includes("afterpay") || rawLower.includes("split")) {
        // Try to extract amount: "$800" or "800 dollars"
        const amountMatch = rawLower.match(/\$?(\d+)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
        const perPayment = amount > 0 ? amount / 4 : 0;

        const entities: any[] = [];
        for (let i = 0; i < 4; i++) {
            const d = new Date();
            d.setDate(d.getDate() + (i * 14));
            entities.push({
                type: 'finance', // Fallback to task if finance not supported, but we use 'finance' here
                // Actually, user wants Tasks for reminders usually? Let's use Task to be safe/visible
                data: {
                    title: `Pay Installment (${i + 1}/4) ${amount > 0 ? '$' + perPayment : ''} - ${text.slice(0, 20)}...`,
                    priority: i === 0 ? 'high' : 'medium',
                    dueDate: getLocalDateString(d)
                }
            });
        }

        // Also add the rest of the text as separate tasks if they exist
        // e.g. "Buy milk and Afterpay..."
        return {
            entities: entities.map(e => ({ type: 'task' as const, confidence: 0.5, data: e.data })),
            summary: "Emergency Split (Offline Mode)"
        };
    }

    // 2. Simple Sentence Splitter
    // Split by period, "and", "then"
    const segments = rawLower.split(/(?:[\.\?!]+|(?:\s+)(?:and|also|then)(?:\s+))/).map(s => s.trim()).filter(s => s.length > 2);

    const entities = segments.map(seg => ({
        type: 'task' as const,
        confidence: 0.8,
        data: {
            title: seg.charAt(0).toUpperCase() + seg.slice(1),
            priority: 'medium',
            dueDate: getLocalDateString()
        }
    }));

    return {
        entities: entities,
        summary: "Offline Split"
    };
};

export const parseQuickly = (text: string): BrainDumpResult | null => {
    const rawLower = text.toLowerCase();

    // --- COMPLEXITY SENTINEL ---
    // If the input requires "High IQ" logic (BNPL, Finance Math, Complex chaining),
    // we MUST delegate to the Cloud AI. Regex is too dumb for "$800 split into 4".
    const complexityTriggers = [
        "afterpay", "klarna", "zip", "affirm", "split", // BNPL
        "payment", "rent", "bill", // Finance context often needs AI
        "$", // Currency math
        ".and", "am.and", "pm.and", // Typos that regex struggles with
        "bitcoin", "invest", "stock", "medical", "drug", "advice", // SAFETY: Force these to Backend for refusal
    ];

    if (complexityTriggers.some(trigger => rawLower.includes(trigger))) {
        return null; // Force Cloud Fallback
    }

    // PRE-PROCESSING: Split Logic
    // "Do X and Do Y" -> ["Do X", "Do Y"]
    // "Do X. Do Y" -> ["Do X", "Do Y"]
    // "Do X.And Do Y" -> ["Do X", "Do Y"]
    // const rawLower = text.toLowerCase(); // REMOVED DUPLICATE

    // Aggressive Split:
    // 1. Periods/Question Marks/Exclamations (with or without space)
    // 2. Conjunctions (and, also, then, plus) surrounded by optional space
    const segments = rawLower.split(/(?:[\.\?!]+|(?:\s+)(?:and|also|then|plus)(?:\s+))/).map(s => s.trim()).filter(s => s.length > 0);

    if (segments.length > 1) {
        let combinedEntities: any[] = [];
        let summaries: string[] = [];
        let successCount = 0;
        let validSegments = 0;

        segments.forEach(seg => {
            if (seg.length < 3) return; // Ignore noise
            validSegments++;

            const res = parseSingleIntent(seg);
            if (res && res.entities) {
                combinedEntities = [...combinedEntities, ...res.entities];
                summaries.push(res.summary);
                successCount++;
            }
        });

        // SAFETY CHECK:
        if (successCount < validSegments) {
            return null;
        }

        if (combinedEntities.length > 0) {
            return {
                entities: combinedEntities,
                summary: summaries.join(" + ")
            };
        }
    }

    return parseSingleIntent(rawLower);
};

const capitalize = (s: string) => s && s.charAt(0).toUpperCase() + s.slice(1);
