import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../lib/firebase';

/**
 * Analytics Service
 * Tracks user events for business intelligence and optimization
 */

// Event names (standardized)
export const AnalyticsEvents = {
    // Authentication
    SIGN_UP: 'sign_up',
    LOGIN: 'login',
    LOGOUT: 'logout',

    // Tasks
    TASK_CREATED: 'task_created',
    TASK_COMPLETED: 'task_completed',
    TASK_DELETED: 'task_deleted',

    // Habits
    HABIT_CREATED: 'habit_created',
    HABIT_COMPLETED: 'habit_completed',
    HABIT_STREAK_MILESTONE: 'habit_streak_milestone',

    // Finance
    FINANCE_ITEM_ADDED: 'finance_item_added',
    FINANCE_ITEM_PAID: 'finance_item_paid',

    // AI Assistant
    AI_CHAT_MESSAGE: 'ai_chat_message',
    BRAIN_DUMP_USED: 'brain_dump_used',
    REPORT_GENERATED: 'report_generated',

    // Subscription
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    SUBSCRIPTION_REACTIVATED: 'subscription_reactivated',
    UPGRADE_PROMPT_SHOWN: 'upgrade_prompt_shown',
    UPGRADE_PROMPT_CLICKED: 'upgrade_prompt_clicked',

    // Onboarding
    ONBOARDING_STARTED: 'onboarding_started',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',

    // Account
    ACCOUNT_DELETED: 'account_deleted',
    DATA_EXPORTED: 'data_exported',

    // Errors
    ERROR_OCCURRED: 'error_occurred',
} as const;

/**
 * Track a custom event
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (!analytics) {
        console.warn('Analytics not initialized');
        return;
    }

    try {
        logEvent(analytics, eventName, {
            ...params,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Analytics tracking error:', error);
    }
};

/**
 * Set user ID for analytics
 */
export const setAnalyticsUserId = (userId: string) => {
    if (!analytics) return;

    try {
        setUserId(analytics, userId);
    } catch (error) {
        console.error('Set user ID error:', error);
    }
};

/**
 * Set user properties
 */
export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
    if (!analytics) return;

    try {
        setUserProperties(analytics, properties);
    } catch (error) {
        console.error('Set user properties error:', error);
    }
};

/**
 * Track page view
 */
export const trackPageView = (pageName: string, pageTitle?: string) => {
    trackEvent('page_view', {
        page_name: pageName,
        page_title: pageTitle || pageName,
    });
};

/**
 * Track error
 */
export const trackError = (error: Error, context?: string) => {
    trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
        error_message: error.message,
        error_stack: error.stack,
        context,
    });
};

/**
 * Track task events
 */
export const trackTaskCreated = (priority: string, hasDeadline: boolean) => {
    trackEvent(AnalyticsEvents.TASK_CREATED, {
        priority,
        has_deadline: hasDeadline,
    });
};

export const trackTaskCompleted = (priority: string, daysToComplete?: number) => {
    trackEvent(AnalyticsEvents.TASK_COMPLETED, {
        priority,
        days_to_complete: daysToComplete,
    });
};

/**
 * Track habit events
 */
export const trackHabitCreated = (frequency: string) => {
    trackEvent(AnalyticsEvents.HABIT_CREATED, {
        frequency,
    });
};

export const trackHabitStreakMilestone = (streak: number, habitName: string) => {
    trackEvent(AnalyticsEvents.HABIT_STREAK_MILESTONE, {
        streak,
        habit_name: habitName,
    });
};

/**
 * Track subscription events
 */
export const trackSubscriptionStarted = (plan: string, amount: number) => {
    trackEvent(AnalyticsEvents.SUBSCRIPTION_STARTED, {
        plan,
        amount,
        currency: 'USD',
    });
};

export const trackUpgradePromptShown = (location: string) => {
    trackEvent(AnalyticsEvents.UPGRADE_PROMPT_SHOWN, {
        location,
    });
};

export const trackUpgradePromptClicked = (location: string) => {
    trackEvent(AnalyticsEvents.UPGRADE_PROMPT_CLICKED, {
        location,
    });
};

/**
 * Track AI usage
 */
export const trackAIChatMessage = (messageLength: number, isPremium: boolean) => {
    trackEvent(AnalyticsEvents.AI_CHAT_MESSAGE, {
        message_length: messageLength,
        is_premium: isPremium,
    });
};

export const trackBrainDumpUsed = (itemsCreated: number) => {
    trackEvent(AnalyticsEvents.BRAIN_DUMP_USED, {
        items_created: itemsCreated,
    });
};

/**
 * Track onboarding
 */
export const trackOnboardingStep = (stepNumber: number, stepName: string) => {
    trackEvent(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, {
        step_number: stepNumber,
        step_name: stepName,
    });
};

export default {
    trackEvent,
    setAnalyticsUserId,
    setAnalyticsUserProperties,
    trackPageView,
    trackError,
    trackTaskCreated,
    trackTaskCompleted,
    trackHabitCreated,
    trackHabitStreakMilestone,
    trackSubscriptionStarted,
    trackUpgradePromptShown,
    trackUpgradePromptClicked,
    trackAIChatMessage,
    trackBrainDumpUsed,
    trackOnboardingStep,
};
