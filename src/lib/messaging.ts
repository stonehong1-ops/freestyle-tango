import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { app, db } from "./firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

function getVapidKey(): string {
  // Use environment variable from Vercel, fallback to the confirmed working key
  return (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BDS8Ua-puwNksC_h4T_sjqRVO5A0BbGzYeeTUVjXV0ycihBXGx0OSYDgFBZhIsHTr_grqk2LKVV-EjgAVBi-d-s").trim();
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting permission:", error);
    return false;
  }
}

/**
 * Register FCM Token and save to Firestore
 */
export async function registerFCMToken(userPhone?: string): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;
    
    // Check support
    if (!(await isSupported())) return null;

    // Get VAPID Key
    const vapidKey = getVapidKey();

    // Register/Get Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // Get Token
    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      const cleanPhone = userPhone?.replace(/[^0-9]/g, '');
      await setDoc(doc(collection(db, "fcm_tokens"), currentToken), {
        token: currentToken,
        userId: cleanPhone || null,
        updatedAt: serverTimestamp(),
        lastSeen: new Date().toISOString(),
        platform: 'web',
        userAgent: window.navigator.userAgent
      }, { merge: true });
      
      return currentToken;
    }
    return null;
  } catch (error) {
    console.error("FCM registration failed:", error);
    throw error;
  }
}

/**
 * Listener for foreground messages
 */
export function onMessageListener(callback?: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log("Foreground Message received: ", payload);
      if (callback) callback(payload);
    });
  } catch (e) {
    console.error("onMessageListener initialization failed:", e);
    return () => {};
  }
}
