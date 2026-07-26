/* ============================================================
   firebase-auth.js
   مسؤول عن: تسجيل دخول/خروج الأدمن عبر Firebase Authentication،
   وتوفير الـ ID Token اللازم لتوقيع طلبات الـ REST الحساسة
   (الأوردرات + حفظ المنتجات) قبل إرسالها لـ Firebase RTDB.

   يُحمَّل بعد Firebase SDK (compat) مباشرة، وقبل admin-script.js
   أو أي سكريبت جوه admin-products.html.

   ملحوظة: بيعمل initializeApp خاص بيه، فمينفعش يتحمّل مع firebase-init.js
   في نفس الصفحة (ده بتاع صفحات العميل بس) عشان منعملش تهيئة مرتين.

   ============================================================
   فصل بيئة Development عن Production:
   بيتم اختيار قاعدة البيانات تلقائياً حسب الدومين اللي لوحة الأدمن شغالة عليه:
   - localhost / 127.0.0.1  → مشروع الـ Demo (arab-store-b6f29)
   - أي دومين تاني (Vercel اللايف) → المشروع الأساسي (karmel-98999)
   مهم: حسابات الأدمن (الإيميل/الباسورد) مختلفة بين المشروعين، لازم تسجل
   دخول بحساب الديمو وانت شغال لوكال، وبحساب الأساسي وانت شغال أونلاين.
   ============================================================ */

const isLocalEnvironment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

// المشروع الأساسي (Production) - العملاء الحقيقيين
const productionFirebaseConfig = {
    apiKey: "AIzaSyA2sZJJlbtGcCJQXom-DXpjSTSKlvjNblU",
    authDomain: "karmel-98999.firebaseapp.com",
    databaseURL: "https://karmel-98999-default-rtdb.firebaseio.com",
    projectId: "karmel-98999",
    storageBucket: "karmel-98999.firebasestorage.app",
    messagingSenderId: "682392453852",
    appId: "1:682392453852:web:03c7bad2824dd71e14aa19"
};

// مشروع الديمو (Development) - للتجربة المحلية بس (localhost)
const demoFirebaseConfig = {
    apiKey: "AIzaSyBfLPM_2Xnu7mtzgDac1vQUjp8CI7k8Y7U",
    authDomain: "arab-store-b6f29.firebaseapp.com",
    databaseURL: "https://arab-store-b6f29-default-rtdb.firebaseio.com",
    projectId: "arab-store-b6f29",
    storageBucket: "arab-store-b6f29.firebasestorage.app",
    messagingSenderId: "978962812156",
    appId: "1:978962812156:web:12c5d0f20e39bfbce61b79",
    measurementId: "G-XZRZ4H0HSD"
};

const firebaseConfig = isLocalEnvironment ? demoFirebaseConfig : productionFirebaseConfig;

firebase.initializeApp(firebaseConfig);
const auriaAuth = firebase.auth();

// مهم جداً: بيخلي كل تاب/صفحة في المتصفح ليها جلسة دخول منفصلة تماماً (session-scoped)
// بدل الوضع الافتراضي (local) اللي بيشارك حالة الدخول بين كل الصفحات على نفس الدومين.
// من غيرها: تسجيل الدخول في صفحة (زي الأسعار) كان بيتسبب في تسجيل خروج تلقائي
// من الصفحة التانية (الأوردرات) لو مفتوحة بحساب مختلف، والعكس صحيح.
auriaAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch((error) => {
    console.error('Failed to set Firebase Auth persistence:', error);
});

/**
 * تسجيل دخول الأدمن بالإيميل والباسورد عن طريق Firebase Authentication الحقيقي.
 * بيرجع الـ user object لو نجح، أو يرمي error لو فشل (اتمسك في الكود اللي بينادي الدالة).
 */
async function adminSignIn(email, password) {
    const credential = await auriaAuth.signInWithEmailAndPassword(email, password);
    return credential.user;
}

/** تسجيل خروج الأدمن الحالي */
async function adminSignOut() {
    await auriaAuth.signOut();
}

/**
 * بيراقب حالة تسجيل الدخول باستمرار (مش مرة واحدة بس)، وده أهم فرق عن sessionStorage القديم:
 * لو التوكن انتهت صلاحيته أو الأدمن اتقفل حسابه من الكونسول، هيتسجل خروجه فعلياً بره الواجهة.
 * callback بياخد باراميتر واحد: الـ user object (أو null لو مسجلش دخول).
 */
function watchAdminAuthState(callback) {
    auriaAuth.onAuthStateChanged(callback);
}

/**
 * بيرجع أحدث ID Token صالح للمستخدم المسجل دخوله حالياً.
 * بيتضاف كـ query param (?auth=TOKEN) لأي طلب REST محتاج صلاحية أدمن في الـ RTDB Rules.
 * بيرجع null لو مفيش حد مسجل دخول.
 */
async function getAdminIdToken() {
    const user = auriaAuth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
}

/** بيرجع إيميل الأدمن المسجل دخوله حالياً، أو null لو مفيش حد مسجل دخول */
function getCurrentAdminEmail() {
    return auriaAuth.currentUser ? auriaAuth.currentUser.email : null;
}

/**
 * إعادة التحقق من هوية الأدمن بالباسورد الحالي - خطوة إلزامية من Firebase
 * قبل السماح بأي تعديل حساس زي تغيير الإيميل أو الباسورد، حتى لو الشخص مسجل دخول فعلاً.
 * بترمي error لو الباسورد الحالي غلط.
 */
async function reauthenticateAdmin(currentPassword) {
    const user = auriaAuth.currentUser;
    if (!user) throw new Error('no-current-user');
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    await user.reauthenticateWithCredential(credential);
}

/** تغيير إيميل الحساب الحالي - لازم يتنادى بعد reauthenticateAdmin مباشرة */
async function changeAdminEmail(newEmail) {
    const user = auriaAuth.currentUser;
    if (!user) throw new Error('no-current-user');
    await user.updateEmail(newEmail);
}

/** تغيير باسورد الحساب الحالي - لازم يتنادى بعد reauthenticateAdmin مباشرة */
async function changeAdminPassword(newPassword) {
    const user = auriaAuth.currentUser;
    if (!user) throw new Error('no-current-user');
    await user.updatePassword(newPassword);
}
