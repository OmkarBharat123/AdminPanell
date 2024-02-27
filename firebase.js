import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyDM7TphLfyp5ClfiEdEC_JOQ6jTBvIszgs",
  authDomain: "adminpanal-84e6c.firebaseapp.com",
  projectId: "adminpanal-84e6c",
  storageBucket: "adminpanal-84e6c.appspot.com",
  messagingSenderId: "1052688828458",
  appId: "1:1052688828458:web:2288c733b1283ebe2fdb53",
  measurementId: "G-8T7Q7048L3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage=getStorage(app)

