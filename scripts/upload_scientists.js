import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import fs from "fs";
import path from "path";

const firebaseConfig = {
  apiKey: "AIzaSyD0u8eIs9_1Y4gY-vQ9hipbef2kGziQrEU",
  authDomain: "mi-pagina-chia.firebaseapp.com",
  databaseURL: "https://mi-pagina-chia-default-rtdb.firebaseio.com",
  projectId: "mi-pagina-chia",
  storageBucket: "mi-pagina-chia.firebasestorage.app",
  messagingSenderId: "325045210260",
  appId: "1:325045210260:web:1a2e9faf8759bb324bf881"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const jsonPath = path.resolve('..', 'cientificas.json');
const rawData = fs.readFileSync(jsonPath, 'utf-8');
const scientistsArray = JSON.parse(rawData);

await set(ref(db, 'scientists'), scientistsArray);

console.log('✅ Scientists data uploaded to Firebase Realtime Database');
