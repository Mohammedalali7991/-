/**
 * دالة توليد رابط مشاركة الملعب باستخدام رابط GitHub Pages الفعلي الخاص بك
 * @param {string} stadiumUsername - اسم المستخدم الخاص بالملعب المخزن في Firestore
 * @returns {string} الرابط النهائي الكلي القابل للمشاركة مع الزبائن
 */
function generateLiveStadiumLink(stadiumUsername) {
    // تنظيف اسم المستخدم لضمان سلامة الرابط
    const cleanUsername = stadiumUsername.trim().toLowerCase();
    
    // الرابط الأساسي الجديد الخاص بك على GitHub Pages الذي حصلت عليه للتو
    const githubBaseUrl = "https://Mohammedalali7791.github.io/khomasi";
    
    // تركيب الرابط ليوجه الزبون مباشرة إلى صفحة الزبائن مع تمرير اسم الملعب كمُعامل (Parameter)
    const finalShareLink = `${githubBaseUrl}/customer.html?stadium=${cleanUsername}`;
    
    // طباعة الرابط في وحدة التحكم للفحص البرمجي
    console.log("تم توليد رابط المشاركة الحي بنجاح:", finalShareLink);
    
    return finalShareLink;
}

// مثال تشغيلي للفحص:
// console.log(generateLiveStadiumLink("stars_pitch"));
// المخرج سيكون: https://Mohammedalali7791.github.io/khomasi/customer.html?stadium=stars_pitch
