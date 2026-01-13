// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmKzkJWiwRGfAFerBd4aTv4oSyrEitAJo",
  authDomain: "foodieexpress-88c6b.firebaseapp.com",
  projectId: "foodieexpress-88c6b",
  storageBucket: "foodieexpress-88c6b.appspot.com",
  messagingSenderId: "751463456300",
  appId: "1:751463456300:web:e4566f122849f9469dfb89",
};

// 🔥 Init Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
