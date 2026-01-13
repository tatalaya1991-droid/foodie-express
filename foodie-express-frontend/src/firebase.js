import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmKzkJWivWRgFAFerBd4aTv4oSyrEitAo",
  authDomain: "foodieexpress-88c6b.firebaseapp.com",
  projectId: "foodieexpress-88c6b",
  storageBucket: "foodieexpress-88c6b.appspot.com",
  messagingSenderId: "751463456300",
  appId: "1:751463456300:web:e4566f122849f9469dfb89"
};

const app = initializeApp(firebaseConfig);

// AUTH
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
