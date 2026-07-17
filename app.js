/**
 * دالة حفظ بيانات التواصل الاجتماعي مع تركيب الروابط تلقائياً
 * @param {string} fieldId - معرف الملعب
 * @param {string} username - اسم المستخدم لملعبك بالتطبيق
 * @param {object} rawSocialData - كائن يحتوي على أسماء الحسابات فقط التي أدخلها المستخدم
 */
async function updateStadiumProfileWithAutoLinks(fieldId, username, rawSocialData) {
    try {
        const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
        
        // التحقق من توافر اسم المستخدم للملعب
        const available = await isUsernameAvailable(cleanUsername);
        const currentDoc = await db.collection("fields").doc(fieldId).get();
        const currentData = currentDoc.data();
        
        if (!available && currentData.username !== cleanUsername) {
            return { success: false, message: "اسم المستخدم هذا محجوز بالفعل لملعب آخر!" };
        }

        // تركيب الروابط تلقائياً بناءً على الأسماء المدخلة فقط
        let instagramLink = "";
        if (rawSocialData.instagram) {
            instagramLink = `https://instagram.com/${rawSocialData.instagram.trim()}`;
        }

        let facebookLink = "";
        if (rawSocialData.facebook) {
            facebookLink = `https://facebook.com/${rawSocialData.facebook.trim()}`;
        }

        let tiktokLink = "";
        if (rawSocialData.tiktok) {
            // تنظيف اسم تيك توك في حال أدخل المستخدم رمز @ تلقائياً
            const cleanTiktok = rawSocialData.tiktok.trim().replace('@', '');
            tiktokLink = `https://tiktok.com/@${cleanTiktok}`;
        }

        let whatsappLink = "";
        if (rawSocialData.whatsapp) {
            // تنظيف رقم الهاتف من أي رموز أو مسافات (مثال: +964-77000 إلى 96477000)
            const cleanPhone = rawSocialData.whatsapp.trim().replace(/[+\-\s]/g, '');
            whatsappLink = `https://wa.me/${cleanPhone}`;
        }

        // تحديث البيانات في Firestore بالروابط الجاهزة والكاملة
        await db.collection("fields").doc(fieldId).update({
            username: cleanUsername,
            socialMedia: {
                instagram: instagramLink,
                facebook: facebookLink,
                whatsapp: whatsappLink,
                tiktok: tiktokLink
            }
        });

        // توليد رابط المشاركة الخاص بالتطبيق
        const shareableLink = `https://khomasi-app.web.app/stadium/${cleanUsername}`;

        return { 
            success: true, 
            message: "تم تركيب الروابط وحفظ الملف الشخصي بنجاح!",
            shareableLink: shareableLink
        };
    } catch (error) {
        console.error("خطأ في تحديث الملف الشخصي والروابط التلقائية:", error);
        return { success: false, message: "حدث خطأ أثناء الحفظ: " + error.message };
    }
}
