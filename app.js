// 1. استيراد مكتبات Firebase الأساسية وقاعدة بيانات Firestore من السحابة مباشرة
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, updateDoc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. إعدادات مشروعك الحقيقي (Hattrick) مأخوذة بدقة من صورتك
const firebaseConfig = {
    apiKey: "AIzaSyByQsqYZUchD3_yf2sn_otMWy2dj4eBBJI",
    authDomain: "hattrick-1484d.firebaseapp.com",
    projectId: "hattrick-1484d",
    storageBucket: "hattrick-1484d.firebasestorage.app",
    messagingSenderId: "595118670263",
    appId: "1:595118670263:web:4c9147c7d4dbac475ea832",
    measurementId: "G-TQYVW38THL"
};

// 3. تفعيل الاتصال البرمجي مع قاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("تم تفعيل الاتصال بنجاح بمشروع Hattrick السحابي!");

// تصدير قاعدة البيانات ليتم استخدامها في واجهات الملاعب وتوليد الروابط
export { db };
