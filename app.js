// استيراد مكاتب Firebase Firestore الأساسية عبر الـ CDN للويب
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// كائن الإعدادات والمفاتيح الرقمية للاتصال بمشروعك (Hattrick)
const firebaseConfig = {
    apiKey: "AIzaSyByQsqYZUchD3_yf2sn_otMWy2dj4eBBJI",
    authDomain: "hattrick-1484d.firebaseapp.com",
    projectId: "hattrick-1484d",
    storageBucket: "hattrick-1484d.firebasestorage.app",
    messagingSenderId: "595118670263",
    appId: "1:595118670263:web:4c9147c7d4dbac475ea832",
    measurementId: "G-TQYVW38THL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("تم تحديث النواة البرمجية لتطبيق Hattrick بنجاح!");

// ==========================================
// 1. نظام إنشاء الحسابات وتحديد الصلاحيات
// ==========================================

/**
 * دالة إنشاء حساب جديد (صاحب ملعب أو لاعب)
 * @param {string} userId - المعرف الرقمي الفريد للمستخدم
 * @param {object} userData - بيانات المستخدم الأساسية والمخصصة
 */
async function registerUserAccount(userId, userData) {
    try {
        const userRef = doc(db, "users", userId);
        
        if (userData.role === "owner") {
            // هيكلة بيانات صاحب الملعب
            await setDoc(userRef, {
                uid: userId,
                role: "owner",
                stadiumName: userData.stadiumName,
                locationText: userData.locationText,
                locationGeo: userData.locationGeo, // { lat: X, lng: Y }
                images: [], // مصفوفة لحفظ روابط الصور المرفوعة لاحقاً
                currency: userData.currency || "IQD", // دينار عراقي أو دولار
                createdAt: new Date()
            });
        } else if (userData.role === "player") {
            // هيكلة بيانات اللاعب
            await setDoc(userRef, {
                uid: userId,
                role: "player",
                playerName: userData.playerName,
                whatsapp: userData.whatsapp,
                createdAt: new Date()
            });
        }
        return { success: true, message: "تم إنشاء الحساب بنجاح!" };
    } catch (error) {
        console.error("خطأ برمجي أثناء إنشاء الحساب:", error);
        return { success: false, message: error.message };
    }
}

// ==========================================
// 2. نظام إدارة الأسعار المتقدمة وأوقات الذروة
// ==========================================

/**
 * دالة تخصيص وتعيين أسعار الساعات لأيام محددة يختارها صاحب الملعب بحرية
 * @param {string} stadiumId - معرف الملعب
 * @param {array} selectedDays - مصفوفة الأيام المختارة (مثال: ["الجمعة", "السبت"])
 * @param {number} defaultPrice - السعر العام لجميع الساعات
 * @param {object} peakHours - كائن يحتوي على الساعات المخصصة (أوقات الذروة) وأسعارها اليدوية المحددة
 */
async function configureStadiumPricing(stadiumId, selectedDays, defaultPrice, peakHours = {}) {
    try {
        for (const day of selectedDays) {
            const pricingRef = doc(db, "stadiums", stadiumId, "pricing", day);
            const hoursPricing = {};
            
            for (let h = 0; h < 24; h++) {
                // التحقق مما إذا كانت هذه الساعة تم زيادة سعرها يدوياً كأوقات ذروة
                const isPeak = peakHours.hasOwnProperty(`hour_${h}`);
                hoursPricing[`hour_${h}`] = {
                    hourLabel: `${h}:00`,
                    price: isPeak ? peakHours[`hour_${h}`] : defaultPrice
                };
            }
            await setDoc(pricingRef, hoursPricing);
        }
        return { success: true, message: "تم تطبيق إعدادات الأسعار بنجاح!" };
    } catch (error) {
        console.error("خطأ في إعداد الأسعار المخصصة:", error);
        return { success: false };
    }
}

// ==========================================
// 3. نظام الحجوزات الذكي (اليومي / الدائم) والقيود البرمجية
// ==========================================

/**
 * دالة حجز ساعة للملعب مع فرض قيود عدم الحجز المزدوج وتحديد نوع التكرار
 */
async function createBooking(stadiumId, playerId, dayName, hourNumber, bookingType) {
    try {
        // القيد الأول: التحقق برمجياً من أن اللاعب لم يحجز نفس الوقت في ملعب آخر
        const checkQuery = query(
            collection(db, "bookings"),
            where("playerId", "==", playerId),
            where("dayName", "==", dayName),
            where("hourNumber", "==", hourNumber),
            where("status", "==", "active")
        );
        const checkSnapshot = await getDocs(checkQuery);
        if (!checkSnapshot.empty) {
            return { success: false, message: "لا يمكنك حجز نفس الوقت في أكثر من ملعب!" };
        }

        // إنشاء مستند الحجز البرمجي
        const bookingRef = collection(db, "bookings");
        await addDoc(bookingRef, {
            stadiumId: stadiumId,
            playerId: playerId,
            dayName: dayName,
            hourNumber: hourNumber,
            bookingType: bookingType, // "today" أو "permanent"
            status: "active",
            createdAt: new Date()
        });

        // تحديث حالة الساعة في جدول المواعيد ليصبح أحمر (محجوز)
        const pricingRef = doc(db, "stadiums", stadiumId, "pricing", dayName);
        const updateData = {};
        updateData[`hour_${hourNumber}.isBooked`] = true;
        updateData[`hour_${hourNumber}.bookedBy`] = playerId;
        updateData[`hour_${hourNumber}.type`] = bookingType;
        
        await updateDoc(pricingRef, updateData);
        return { success: true, message: "تم الحجز بنجاح!" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "خطأ في معالجة الحجز." };
    }
}

// ==========================================
// 4. نظام إلغاء الحجز المشروط (شرط الـ 24 ساعة ومعالجة الإشعارات)
// ==========================================

/**
 * دالة طلب إلغاء الحجز من طرف اللاعب مع فحص شرط الـ 24 ساعة وإرسال إشعار معلق للأدمن
 */
async function requestBookingCancellation(bookingId, playerId, stadiumId, bookingTime) {
    try {
        const currentTime = new Date();
        const timeDifference = bookingTime.getTime() - currentTime.getTime();
        const hoursDifference = timeDifference / (1000 * 3600);

        // التحقق البرمجي من شرط الـ 24 ساعة قبل موعد الحجز
        if (hoursDifference < 24) {
            return { success: false, message: "لا يمكن إلغاء الحجز لأن الوقت المتبقي أقل من 24 ساعة!" };
        }

        // إرسال إشعار طلب الإلغاء كوثيقة معلقة لصاحب الملعب
        const notificationRef = collection(db, "cancellation_requests");
        await addDoc(notificationRef, {
            bookingId: bookingId,
            playerId: playerId,
            stadiumId: stadiumId,
            status: "pending", // معلق بانتظار موافقة صاحب الملعب
            createdAt: new Date()
        });

        return { success: true, message: "تم إرسال طلب الإلغاء لصاحب الملعب، بانتظار الموافقة." };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

/**
 * دالة معالجة طلب الإلغاء من قبل صاحب الملعب (موافق / مرفوض)
 */
async function handleCancellationRequest(requestId, action, bookingId, stadiumId, dayName, hourNumber) {
    try {
        const requestRef = doc(db, "cancellation_requests", requestId);
        
        if (action === "approve") {
            // تحديث طلب الإلغاء ليصبح مقبولاً
            await updateDoc(requestRef, { status: "approved" });
            
            // إلغاء الحجز الرئيسي
            const bookingRef = doc(db, "bookings", bookingId);
            await updateDoc(bookingRef, { status: "cancelled" });

            // إعادة الساعة لتصبح متاحة باللون الأخضر في جدول المواعيد
            const pricingRef = doc(db, "stadiums", stadiumId, "pricing", dayName);
            const updateData = {};
            updateData[`hour_${hourNumber}.isBooked`] = false;
            updateData[`hour_${hourNumber}.bookedBy`] = null;
            
            await updateDoc(pricingRef, updateData);
            return { success: true, message: "تم قبول الإلغاء وإعادة الساعة متاحة للجميع." };
            
        } else if (action === "reject") {
            // رفض الطلب وإبقاء الحجز باسم اللاعب معلقاً أو فعالاً
            await updateDoc(requestRef, { status: "rejected" });
            return { success: true, message: "تم رفض طلب الإلغاء وبقي الحجز فعالاً باسم المشترك." };
        }
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

// تصدير الدوال البرمجية الشاملة للمشروع
export { 
    registerUserAccount, 
    configureStadiumPricing, 
    createBooking, 
    requestBookingCancellation, 
    handleCancellationRequest 
};
