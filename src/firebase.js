import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBr8FaX5c1Y6FVDicAzurx1wA__k3OYKAM",
  authDomain: "recruitease-6b088.firebaseapp.com",
  projectId: "recruitease-6b088",
  storageBucket: "recruitease-6b088.appspot.com",
  messagingSenderId: "680498181349",
  appId: "1:680498181349:web:2490ae408562ac4df4500c",
  measurementId: "G-VCH50G7HB5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export const db = getFirestore(app);

export default auth;
