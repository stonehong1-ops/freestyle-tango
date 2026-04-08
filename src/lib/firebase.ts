import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

// Public Firebase Configuration (Used as fallbacks if environment variables are missing)
const DEFAULT_CONFIG = {
  apiKey: "AIzaSyAtxlSfk4vVLPZjj5E1Ibw1Mfu5tIr6Few",
  authDomain: "tangostay-7355e.firebaseapp.com",
  projectId: "tangostay-7355e",
  storageBucket: "tangostay-7355e.firebasestorage.app",
  messagingSenderId: "537832909151",
  appId: "1:537832909151:web:e0502f6e4bf4702e2eeeea"
};

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId;

const firebaseConfig = {
  // Hardcoding the CORRECT case-sensitive API Key (39 chars) directly to bypass ANY environment variable or truncated key issues
  apiKey: "AIzaSyAtxlSfk4vVLPZjj5E1Ibw1Mfu5tIr6Few",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tangostay-7355e.firebaseapp.com",
  projectId: projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tangostay-7355e.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "537832909151",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:537832909151:web:e0502f6e4bf4702e2eeeea",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Messaging is only supported in browser environment
const messaging = typeof window !== "undefined" ? isSupported().then(supported => supported ? getMessaging(app) : null) : null;

export { app, db, storage, auth, messaging };
