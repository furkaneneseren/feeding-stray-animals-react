import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"

const firebaseConfig = {
    //YOUR FIREBASE CONFIG---
};

const app = initializeApp(firebaseConfig);
const Storage = getStorage(app);
const storageRef = ref(Storage);
const db = getFirestore(app);
const auth = getAuth(app);


export { Storage, db, storageRef, auth };

