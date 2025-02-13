// firebaseClient.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBx4O-qbAKZQldiOjm2beil6L3gxftFWlQ",
  authDomain: "juristo.firebaseapp.com",
  projectId: "juristo",
  storageBucket: "juristo.appspot.com",
  messagingSenderId: "500246453376",
  appId: "1:500246453376:web:87d99f821f9b37248eda65",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging and export it
const messaging = getMessaging(app);

export { app, messaging };
