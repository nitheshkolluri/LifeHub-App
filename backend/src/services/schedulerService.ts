import * as admin from 'firebase-admin';
import * as cron from 'node-cron';

// Ensure Firebase Admin is initialized (it is in firebase.config.ts)

export const startTaskScheduler = () => {
    console.log("⏰ Task Scheduler Started (Every Minute)");

    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Robust Date/Time Formatting
            const pad = (n: number) => n < 10 ? '0' + n : n;
            const dateKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`; // YYYY-MM-DD
            const timeKey = `${pad(now.getHours())}:${pad(now.getMinutes())}`; // HH:MM

            console.log(`[Scheduler] Checking tasks for ${dateKey} at ${timeKey}...`);

            // 1. Query all users (Scalability Warning: For massive app, use Collection Group Index)
            // For now, iterating users is fine.
            // Better: collectionGroup('tasks').where('dueDate', '==', dateKey).where('dueTime', '==', timeKey)

            const tasksSnapshot = await admin.firestore().collectionGroup('tasks')
                .where('dueDate', '==', dateKey)
                .where('dueTime', '==', timeKey)
                .where('status', '==', 'pending')
                .get();

            if (tasksSnapshot.empty) {
                // console.log("[Scheduler] No tasks found."); // reducing noise
                return;
            }

            console.log(`[Scheduler] Found ${tasksSnapshot.size} tasks due now.`);

            // 2. Process each task
            for (const doc of tasksSnapshot.docs) {
                const task = doc.data();
                const userId = doc.ref.parent.parent?.id; // users/{userId}/tasks/{taskId}

                if (!userId) continue;

                // Check if already notified to avoid dupes (though query matches specifics)
                if (task.notified) continue;

                // 3. Get User FCM Tokens
                const userDoc = await admin.firestore().collection('users').doc(userId).get();
                const userData = userDoc.data();
                const tokens = userData?.fcmTokens || [];

                if (tokens.length === 0) {
                    console.log(`[Scheduler] User ${userId} has no FCM tokens.`);
                    continue;
                }

                console.log(`[Scheduler] Sending to ${tokens.length} devices for User ${userId}`);

                // 4. Send Notification
                const message: admin.messaging.MulticastMessage = {
                    tokens: tokens,
                    notification: {
                        title: "Task Due Now",
                        body: `It's time for: ${task.title}`,
                    },
                    data: {
                        taskId: doc.id,
                        url: '/' // Click action
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            icon: 'stock_ticker_update',
                            color: '#4F46E5', // Indigo-600
                            clickAction: 'FLUTTER_NOTIFICATION_CLICK' // Standard web
                        }
                    },
                    webpush: {
                        headers: {
                            Urgency: "high"
                        },
                        fcmOptions: {
                            link: "https://lifehub-frontend-710009842508.us-central1.run.app/"
                        }
                    }
                };

                const response = await admin.messaging().sendEachForMulticast(message);
                console.log(`[Scheduler] Sent success: ${response.successCount}, failure: ${response.failureCount}`);

                if (response.failureCount > 0) {
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            console.error(`[Scheduler] Failure error:`, resp.error);
                            // Remove bad tokens?
                        }
                    });
                }

                // 5. Mark as Notified
                // await doc.ref.update({ notified: true });
                // Optional: We rely on the time passing so it won't match next minute. 
                // But updating is safer.
                await doc.ref.update({ notified: true });
            }

        } catch (error) {
            console.error("Scheduler Error:", error);
        }
    });
};
