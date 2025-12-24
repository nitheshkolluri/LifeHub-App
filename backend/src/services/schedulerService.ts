import * as admin from 'firebase-admin';
import { db } from '../config/firebase.config';

// Ensure Firebase Admin is initialized (it is in firebase.config.ts)

export const triggerTaskCheck = async () => {
    try {
        const now = new Date();
        const startOfMinute = now.getTime();
        const endOfMinute = startOfMinute + 60000;

        console.log(`[Scheduler] Checking for tasks due between ${new Date(startOfMinute).toISOString()} and ${new Date(endOfMinute).toISOString()}`);

        // 1. UTC Timestamp Query (Global, O(1))
        // Requires Composite Index: collectionGroup: tasks -> status ASC, nextRemindAt ASC
        const tasksSnapshot = await db.collectionGroup('tasks')
            .where('status', '==', 'pending')
            .where('nextRemindAt', '>=', startOfMinute)
            .where('nextRemindAt', '<', endOfMinute)
            .get();

        if (tasksSnapshot.empty) {
            console.log("[Scheduler] No tasks found in this minute window.");
            return {
                status: 'success',
                message: 'No tasks due',
                count: 0
            };
        }

        console.log(`[Scheduler] Found ${tasksSnapshot.size} tasks due now.`);

        let successCount = 0;
        let failureCount = 0;

        // 2. Process each task
        for (const doc of tasksSnapshot.docs) {
            const task = doc.data();
            const userId = doc.ref.parent.parent?.id; // users/{userId}/tasks/{taskId}

            if (!userId) continue;

            // Double check 'notified' flag in case of retry overlaps
            if (task.notified) continue;

            // 3. Get User FCM Tokens
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            const tokens = userData?.fcmTokens || [];

            if (!tokens || tokens.length === 0) {
                console.log(`[Scheduler] User ${userId} has no FCM tokens.`);
                continue;
            }

            // 4. Send Notification
            const message: admin.messaging.MulticastMessage = {
                tokens: tokens,
                notification: {
                    title: "Task Due Now",
                    body: `It's time for: ${task.title}`,
                },
                data: {
                    taskId: doc.id,
                    url: '/',
                    priority: task.priority || 'medium'
                },
                android: {
                    priority: 'high',
                    notification: {
                        icon: 'stock_ticker_update',
                        color: '#4F46E5',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    }
                },
                webpush: {
                    headers: { Urgency: "high" },
                    fcmOptions: { link: "https://lifehub-frontend.web.app/" }
                }
            };

            const response = await admin.messaging().sendEachForMulticast(message);

            if (response.successCount > 0) {
                await doc.ref.update({ notified: true });
                successCount += response.successCount;
            }
            failureCount += response.failureCount;
        }

        return {
            status: 'success',
            message: 'Processed due tasks',
            processed: tasksSnapshot.size,
            notificationsSent: successCount,
            failures: failureCount
        };

    } catch (error: any) {
        console.error("Scheduler Error:", error);
        // Helpful error for initial setup regarding missing index
        if (error.code === 9 || error.message?.includes('index')) {
            console.error("⚠️ MISSING INDEX: You must create a composite index in Firebase Console.");
            console.error("Collection ID: tasks");
            console.error("Fields: status (Ascending), nextRemindAt (Ascending)");
        }
        throw error;
    }
};
