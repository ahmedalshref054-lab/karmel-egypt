/* ============================================================
   firebase-init.js
   تهيئة خفيفة لـ Firebase على صفحات العميل العادية (الرئيسية، التصنيفات،
   تفاصيل المنتج، السلة، السياسات) — بدون تحميل Firebase Auth SDK
   لأنها مش محتاجاها هناك، وده بيخلي الصفحة أخف وأسرع.

   لوحات الأدمن (admin.html و admin-products.html) عندها تهيئة خاصة بيها
   جوه firebase-auth.js (لأنها محتاجة Auth كمان)، فمينفعش الملف ده يتحمّل
   جنبهم عشان منعملش initializeApp مرتين.

   ============================================================
   فصل بيئة Development عن Production:
   بيتم اختيار قاعدة البيانات تلقائياً حسب الدومين اللي الصفحة شغالة عليه:
   - localhost / 127.0.0.1  → مشروع الـ Demo (karmel-di / arab-store-b6f29)
   - أي دومين تاني (Vercel اللايف) → المشروع الأساسي (karmel-98999)
   كده أي تجربة بتتعمل لوكال ماتأثرش على بيانات العملاء الحقيقية أونلاين.
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
