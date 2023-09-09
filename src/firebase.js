// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCe464UXs1C52CD9CG1FFYScBd_SXKpa4Y",
    authDomain: "recipe-share-0.firebaseapp.com",
    projectId: "recipe-share-0",
    storageBucket: "recipe-share-0.appspot.com",
    messagingSenderId: "5571302192",
    appId: "1:5571302192:web:30c7785eda95fa5b316ef5",
    measurementId: "G-CRJZ1YEVPC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { app, auth, db };
