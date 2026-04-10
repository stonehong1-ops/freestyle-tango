import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

// Public Firebase Configuration (Used as fallbacks if environment variables are missing)
const DEFAULT_CONFIG = {
  apiKey: "AIzaSyCrtzGtNMc_gNC_rqROj52qVOLQ6vVQwgc",
  authDomain: "freestyle-tango-seoul.firebaseapp.com",
  projectId: "freestyle-tango-seoul",
  storageBucket: "freestyle-tango-seoul.firebasestorage.app",
  messagingSenderId: "87031621234",
  appId: "1:87031621234:web:53c87298461b95cce2c4eb"
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_CONFIG.apiKey,
  authDomain: "freestyle-tango-seoul.firebaseapp.com", // Strictly force Seoul domain to fix auth/configuration-not-found
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_CONFIG.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Messaging is only supported in browser environment
const messaging = typeof window !== "undefined" ? isSupported().then(supported => supported ? getMessaging(app) : null) : null;

export { app, db, storage, auth, messaging };
