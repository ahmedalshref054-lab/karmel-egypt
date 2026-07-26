/* ============================================================
   firebase-init.js
   تهيئة خفيفة لـ Firebase على صفحات العميل العادية (الرئيسية، التصنيفات،
   تفاصيل المنتج، السلة، السياسات) — بدون تحميل Firebase Auth SDK
   لأنها مش محتاجاها هناك، وده بيخلي الصفحة أخف وأسرع.

   لوحات الأدمن (admin.html و admin-products.html) عندها تهيئة خاصة بيها
   جوه firebase-auth.js (لأنها محتاجة Auth كمان)، فمينفعش الملف ده يتحمّل
   جنبهم عشان منعملش initializeApp مرتين.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyA2sZJJlbtGcCJQXom-DXpjSTSKlvjNblU",
  authDomain: "karmel-98999.firebaseapp.com",
  databaseURL: "https://karmel-98999-default-rtdb.firebaseio.com",
  projectId: "karmel-98999",
  storageBucket: "karmel-98999.firebasestorage.app",
  messagingSenderId: "682392453852",
  appId: "1:682392453852:web:03c7bad2824dd71e14aa19"
};

firebase.initializeApp(firebaseConfig);
