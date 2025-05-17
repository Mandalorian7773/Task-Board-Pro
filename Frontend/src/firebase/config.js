import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAoHT4V5AJusPD8W4pw4g-3jzGt2wrKvRo",
  authDomain: "task-board-8a4a4.firebaseapp.com",
  projectId: "task-board-8a4a4",
  storageBucket: "task-board-8a4a4.firebasestorage.app",
  messagingSenderId: "19678583053",
  appId: "1:19678583053:web:f802bcb0ee031536253844",
  measurementId: "G-MCRPDCZCQ2"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics }; 