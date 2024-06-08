// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKwRXFUSpmTlmI5Do0q5O7maM6FWmEZS4",
    authDomain: "blockly-5f08e.firebaseapp.com",
    projectId: "blockly-5f08e",
    storageBucket: "blockly-5f08e.appspot.com",
    messagingSenderId: "674629587214",
    appId: "1:674629587214:web:3beb7f2db6d5ea13d4c75f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;