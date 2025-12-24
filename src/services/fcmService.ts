import { getToken, onMessage } from "firebase/messaging";
import { messaging, db, auth } from "../lib/firebase";
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { getEnv } from "../utils/env";

export const fcmService = {
    async requestPermission(): Promise<string | null> {
        if (!messaging) return null;

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const vapidKey = getEnv('VITE_FIREBASE_VAPID_KEY');
                if (!vapidKey) {
                    console.error("VAPID Key missing in env!");
                    return null;
                }

                const token = await getToken(messaging, {
                    vapidKey: vapidKey
                });

                if (token) {
                    console.log("FCM Token:", token);
                    await this.saveTokenToUser(token);
                    return token;
                }
            }
        } catch (error) {
            console.error("FCM Permission Error:", error);
        }
        return null;
    },

    async saveTokenToUser(token: string) {
        if (!auth.currentUser) return;
        const userRef = doc(db, "users", auth.currentUser.uid);
        // Use arrayUnion to support multiple devices per user
        await setDoc(userRef, { fcmTokens: arrayUnion(token) }, { merge: true });
    },

    listenForMessages(callback: (payload: any) => void) {
        if (messaging) {
            onMessage(messaging, (payload) => {
                console.log("Foreground Message:", payload);
                callback(payload);
            });
        }
    }
};
