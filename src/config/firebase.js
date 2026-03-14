// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDygkudpOl0-OwwkUaXCFEYMJhLDzaenco",
    authDomain: "dsasolver2406.firebaseapp.com",
    projectId: "dsasolver2406",
    storageBucket: "dsasolver2406.firebasestorage.app",
    messagingSenderId: "857525838748",
    appId: "1:857525838748:web:8adde34494796ea2cd1e59",
    measurementId: "G-QXNW9RWRHV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
