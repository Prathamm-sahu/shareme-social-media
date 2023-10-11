import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCZHvHNF7xw5Mx1cfMuBIToryoviqjnmzM",
  authDomain: "shareme-social-media-app-feb4a.firebaseapp.com",
  projectId: "shareme-social-media-app-feb4a",
  storageBucket: "shareme-social-media-app-feb4a.appspot.com",
  messagingSenderId: "799568668960",
  appId: "1:799568668960:web:d57659d205089a73a40f45",
  measurementId: "G-3JR2Y3Q59N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Setting Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

//Setting firestore
export const db = getFirestore(app);


//Setting storage
export const storage = getStorage(app);