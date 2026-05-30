import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCnwKBOKmaJt0IM9RgFaMvlQcwJzPmAEGM",
  authDomain: "rivaangarments-7f8ea.firebaseapp.com",
  projectId: "rivaangarments-7f8ea",
  storageBucket: "rivaangarments-7f8ea.firebasestorage.app",
  messagingSenderId: "112533057943",
  appId: "1:112533057943:web:cacd3c0d24b405099014d2",
  measurementId: "G-VDHH7QEL7N"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function initAnalytics() {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  return supported ? getAnalytics(app) : null;
}
