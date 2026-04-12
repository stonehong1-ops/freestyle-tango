import { getMessaging, getToken, onMessage, isSupported, deleteToken } from "firebase/messaging";
import { app, db } from "./firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

function getVapidKey(): string {
  // Use environment variable from Vercel, fallback to the confirmed working key for freestyle-tango-seoul
  return (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BGE10DMSIrZ4x2zjgpKxgnfWOmGCDJ9CSwBeezhSGW_tdAAzinIyLVcurYf3uLY20NOvOHKudztAG_PdopcU8IY").trim();
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
    console.log('[FCM] Registering Service Worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { 
      scope: '/',
      updateViaCache: 'none' // 매번 서버에서 최신 SW 파일을 체크하도록 강제
    });
    console.log('[FCM] Service Worker registered with scope:', registration.scope);
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);

    // 1. Fundamental Migration: Force drop native push subscriptions
    const migrationFlag = "seoul_token_migrated_v3";
    if (localStorage.getItem(migrationFlag) !== "true") {
      console.log("[FCM] Executing fundamental token wipe for migration...");
      try {
        // Drop native push subscription directly from Service Worker
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.pushManager) {
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              await sub.unsubscribe();
              console.log("[FCM] Native service worker push subscription wiped.");
            }
          }
        }
        // Then drop Firebase cached token
        await deleteToken(messaging);
        console.log("[FCM] Firebase token wiped.");
        localStorage.setItem(migrationFlag, "true");
      } catch (e: any) {
        console.error("Migration token wipe failed:", e);
      }
    }

    console.log("Requesting FCM token for phone:", userPhone);
    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      const cleanPhone = userPhone?.replace(/[^0-9]/g, '');
      
      // 1. Save Token
      await setDoc(doc(collection(db, "fcm_tokens"), currentToken), {
        token: currentToken,
        userId: cleanPhone || null,
        updatedAt: serverTimestamp(),
        lastSeen: new Date().toISOString(),
        platform: 'web',
        userAgent: window.navigator.userAgent
      }, { merge: true });

      // 2. Force Enable Push Settings for this user (Self-healing)
      if (cleanPhone) {
        await setDoc(doc(collection(db, "users"), cleanPhone), {
          phone: cleanPhone, // Ensure phone field exists
          settings: {
            pushEnabled: true,
            updatedAt: serverTimestamp()
          }
        }, { merge: true });
        console.log(`[FCM] Push settings forced to ON for ${cleanPhone}`);
      }
      
      return currentToken;
    }
    return null;
  } catch (error: any) {
    console.error("FCM registration failed:", error);
    try {
      if (typeof window !== 'undefined') {
        const errorMsg = error?.message || String(error);
        await setDoc(doc(collection(db, "fcm_errors"), new Date().getTime().toString()), {
          errorMessage: errorMsg,
          stack: error?.stack || null,
          userAgent: window.navigator.userAgent,
          timestamp: serverTimestamp()
        });
      }
    } catch (e) {} // ignore logging errors
    throw error;
  }
} // End of registerFCMToken

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
