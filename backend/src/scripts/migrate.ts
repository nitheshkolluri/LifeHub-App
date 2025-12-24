
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Load Env
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Initialize Firebase
const serviceAccount = require('../../service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function migrate() {
    console.log("🚀 Starting Migration: add nextRemindAt timestamps...");

    // We assume the migration runs in the TIMEZONE of the developer (or close enough for testing)
    // For a perfect migration, we'd need user timezone, but we'll assume Local Machine Time 
    // matches the user's intent for now since we are in dev.

    const tasksSnapshot = await db.collectionGroup('tasks').where('status', '==', 'pending').get();

    console.log(`Found ${tasksSnapshot.size} pending tasks.`);

    let updatedCount = 0;

    for (const doc of tasksSnapshot.docs) {
        const data = doc.data();

        // Skip if already has it
        if (data.nextRemindAt) continue;

        if (data.dueDate && data.dueTime) {
            // Parse as Local Time (Machine Time)
            const dateStr = `${data.dueDate}T${data.dueTime}`;
            const ts = new Date(dateStr).getTime();

            if (!isNaN(ts)) {
                await doc.ref.update({ nextRemindAt: ts });
                console.log(`✅ Updated ${doc.id}: ${dateStr} -> ${ts}`);
                updatedCount++;
            } else {
                console.warn(`⚠️ Could not parse date for ${doc.id}: ${dateStr}`);
            }
        }
    }

    console.log(`✨ Migration Complete. Updated ${updatedCount} tasks.`);
}

migrate().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
