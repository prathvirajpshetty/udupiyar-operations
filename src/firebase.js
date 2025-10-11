import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPwWs1vahEggXH69oVwkD4dkxb0s0mYFU",
  authDomain: "udupiyar.firebaseapp.com",
  databaseURL: "https://udupiyar-default-rtdb.firebaseio.com",
  projectId: "udupiyar",
  storageBucket: "udupiyar.firebasestorage.app",
  messagingSenderId: "657052468819",
  appId: "1:657052468819:web:8b8b1e203359b8d8d328a6",
  measurementId: "G-N0P6CSS8Z2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Storage
export const auth = getAuth(app);
export const storage = getStorage(app);

// Sign in anonymously when the module loads
signInAnonymously(auth)
  .then(() => {
    console.log('Signed in anonymously');
  })
  .catch((error) => {
    console.error('Error signing in anonymously:', error);
  });
