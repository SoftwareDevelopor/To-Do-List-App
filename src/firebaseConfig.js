// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMnVaSE9AzooVqZeGKwOMoSSlDAHn9PfQ",
  authDomain: "to-do-list-app-9b083.firebaseapp.com",
  projectId: "to-do-list-app-9b083",
  storageBucket: "to-do-list-app-9b083.firebasestorage.app",
  messagingSenderId: "634860324714",
  appId: "1:634860324714:web:39293b8c08d1778e2b8713"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;