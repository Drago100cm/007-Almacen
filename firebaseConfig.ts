import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA6171CpJaj1gjYU2A3Xkix0lZjVJtLOE8",
  authDomain: "proyectojs-9a2d7.firebaseapp.com",
  projectId: "proyectojs-9a2d7",
  storageBucket: "proyectojs-9a2d7.appspot.com",
  messagingSenderId: "926570533339",
  appId: "1:926570533339:android:7b71b7a4541ea264bdd7fe"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);

export { app, db, auth, storage };
