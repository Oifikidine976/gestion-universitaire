import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtwL1x9hEmLVhT2C6TxCqmqD-vOwS1A2Y",
  authDomain: "gestion-universitaire-461a7.firebaseapp.com",
  projectId: "gestion-universitaire-461a7",
  storageBucket: "gestion-universitaire-461a7.firebasestorage.app",
  messagingSenderId: "369466959986",
  appId: "1:369466959986:web:eb200ad8ed8f2d24cebaeb"
};

const app = initializeApp(firebaseConfig);

// La connexion des utilisateurs
export const auth = getAuth(app);
// La base de données
export const db = getFirestore(app);