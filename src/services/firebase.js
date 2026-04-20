import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZYuARee8H3xs86w5UQizIPbApc-cev_M",
  authDomain: "digital-detox-2d831.firebaseapp.com",
  projectId: "digital-detox-2d831",
  storageBucket: "digital-detox-2d831.firebasestorage.app",
  messagingSenderId: "924218664970",
  appId: "1:924218664970:web:8c184b0072d10639ee97f3"
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);


export const db = getFirestore(app);