// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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

const auth = getAuth(app);
const email = process.env.REACT_APP_FIREBASE_EMAIL;
const password = process.env.REACT_APP_FIREBASE_PASSWORD;
// console.log("FBA - Email: ", email)

signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // console.log("FBA - Successfully")
    })
    .catch((error) => {
        const errorCode = error.code;
        console.log("FBA - Error code: ", errorCode)
        const errorMessage = error.message;
        console.log("FBA - Error message: ", errorMessage)
    });

export default app;