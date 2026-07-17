// 1. استيراد مكاتب Firebase Firestore الأساسية عبر الـ CDN للويب
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. كائن الإعدادات والمفاتيح الرقمية للاتصال بمشروعك (Hattrick)
const firebaseConfig = {
    apiKey: "AIzaSyByQsqYZUchD3_yf2sn_otMWy2dj4eBBJI",
    authDomain: "hattrick-1484d.firebaseapp.com",
    projectId: "hattrick-1484d",
    storageBucket: "hattrick-1484d.firebasestorage.app",
    messagingSenderId: "595118670263",
    appId: "1:595118670263:web:4c9147c7d4dbac475ea832",
    measurementId: "G-TQYVW38THL"
};

// 3. تفعيل وتشغيل السحابة برمجياً
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("تم تفعيل قاعدة البيانات بنجاح وجاهزة لاستقبال البيانات برمجياً!");

// 4. ربط عناصر واجهة HTML بالكود (قم بتغيير المعرفات لتطابق ملف الـ HTML لديك)
const stadiumNameInput = document.getElementById("stadiumName"); // حقل إدخال اسم الملعب
const instaInput = document.getElementById("instaAccount");       // حقل إدخال حساب الإنستغرام
const saveButton = document.getElementById("saveBtn");           // زر حفظ البيانات

// 5. مراقبة نقر المستخدم على زر الحفظ لتنفيذ عملية الإرسال
saveButton.addEventListener("click", async (e) => {
    e.preventDefault(); // منع الصفحة من إعادة التحميل التلقائي

    // استخراج القيم النصية وتنظيف الفراغات الزائدة
    const nameValue = stadiumNameInput.value.trim();
    const instaValue = instaInput.value.trim();

    // التحقق البرمجي من أن الحقول ليست فارغة قبل الإرسال
    if (nameValue === "" || instaValue === "") {
        alert("يرجى ملء جميع الحقول أولاً!");
        return;
    }

    try {
        // إرسال البيانات كـ "مستند جديد" إلى مجموعة الملاعب (stadiums) بمعرف تلقائي
        const docRef = await addDoc(collection(db, "stadiums"), {
            name: nameValue,
            instagram: instaValue.toLowerCase(), // تحويل الحساب لأحرف صغيرة تفادياً للأخطاء
            createdAt: new Date() // تسجيل وقت وتاريخ الإضافة برمجياً
        });

        console.log("تم حفظ المستند بنجاح بالمعرف الرقمي:", docRef.id);
        alert("تم حفظ بيانات الملعب بنجاح في قاعدة البيانات!");
        
        // تفريغ الحقول بعد الحفظ الناجح
        stadiumNameInput.value = "";
        instaInput.value = "";

    } catch (error) {
        console.error("حدث خطأ برمجي أثناء محاولة إرسال البيانات السحابية:", error);
        alert("فشلت عملية الحفظ، راجع لوحة التحكم البرمجية (Console).");
    }
});
