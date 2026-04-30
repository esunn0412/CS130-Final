import { Platform } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { initializeApp } from "firebase/app";
// @ts-expect-error - getReactNativePersistence exists in the RN bundle but is missing from web types
import { browserLocalPersistence, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuxWO8F4FXYebD8V4so2yxmzU4KBNGwz0",
  authDomain: "emory-hacks-f3f9a.firebaseapp.com",
  databaseURL: "https://emory-hacks-f3f9a-default-rtdb.firebaseio.com",
  projectId: "emory-hacks-f3f9a",
  storageBucket: "emory-hacks-f3f9a.firebasestorage.app",
  messagingSenderId: "754783498331",
  appId: "1:754783498331:web:9bb40ba0dd355156a5cf7e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence:
    Platform.OS === "web"
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
