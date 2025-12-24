import * as admin from 'firebase-admin';
import * as cron from 'node-cron';

// Ensure Firebase Admin is initialized (it is in firebase.config.ts)

export const startTaskScheduler = () => {
    console.log("⏰ Task Scheduler Started (Every Minute)");

    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // Format: YYYY-MM-DD
            const dateKey = now.toLocaleDateString('en-CA');
            // Format: HH:MM
            const timeKey = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            // console.log(`Checking tasks for ${dateKey} at ${timeKey}...`);

            // 1. Query all users (Scalability Warning: For massive app, use Collection Group Index)
            // For now, iterating users is fine.
            // Better: collectionGroup('tasks').where('dueDate', '==', dateKey).where('dueTime', '==', timeKey)

            const tasksSnapshot = await admin.firestore().collectionGroup('tasks')
                .where('dueDate', '==', dateKey)
                .where('dueTime', '==', timeKey)
                .where('status', '==', 'pending')
                .get();

            if (tasksSnapshot.empty) return;

            console.log(`Found ${tasksSnapshot.size} tasks due now.`);

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
                    console.log(`User ${userId} has no FCM tokens.`);
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
                console.log(`Sent ${response.successCount} notifications for task ${doc.id}`);

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
