// ⚠️ CHANGE TO YOUR DATA FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyBZMjU3UYwlLRPNC5uSSTH7oWCWadDhl44",
  authDomain: "quiz-365-cc.firebaseapp.com",
  databaseURL: "https://quiz-365-cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quiz-365-cc",
  storageBucket: "quiz-365-cc.firebasestorage.app",
  messagingSenderId: "291087916264",
  appId: "1:291087916264:web:336472e74b37c7720cbd5d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();