import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Fallback for storage bucket: newer projects use .firebasestorage.app, older ones use .appspot.com
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                     (projectId ? `${projectId}.firebasestorage.app` : undefined) ||
                     (projectId ? `${projectId}.appspot.com` : undefined);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
