import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWpNuAnDOA63W-Dhb4SDqyDdVDuyjWhps",
  authDomain: "skincare-app-70195.firebaseapp.com",
  projectId: "skincare-app-70195",
  storageBucket: "skincare-app-70195.firebasestorage.app",
  messagingSenderId: "559100800370",
  appId: "1:559100800370:web:b1315a23507370036081eb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);