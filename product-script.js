/* هذا الملف بيعتمد على script.js (لازم يتحمّل قبله في product.html)
   بيقرأ id و category من رابط الصفحة، يعرض بيانات المنتج، ويفعّل زرار الإضافة للسلة */

function renderProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    const id = urlParams.get('id');

    // نقرأ البيانات مباشرة من قاعدة البيانات الموحدة المتاحة في الكاش فوراً
    let product = null;
    if (typeof allProductsMasterData !== 'undefined' && cat && id) {
        const categoryData = allProductsMasterData[cat];
        if (categoryData) {
            product = categoryData.items.find(item => item.id === id);
        }
    }

    if (!product) {
        document.getElementById("p-name").textContent = "المنتج غير موجود";
        const addBtn = document.getElementById("p-add-btn");
        if (addBtn) addBtn.disabled = true;
        return;
    }

    // 🔒 1. فحص ما إذا كان المنتج معلماً كـ (مخفي) لحجبه عن العميل في حال الدخول برابط مباشر
    const isHidden = product.hidden === true || product.status === 'hidden';
    if (isHidden) {
        document.title = "Karmel Egypt - المنتج غير متاح";
        document.getElementById("p-name").textContent = "عذراً، هذا المنتج غير متاح حالياً";
        document.getElementById("p-benefits").textContent = "تم إيقاف عرض هذا المنتج مؤقتاً بطلب من إدارة المتجر.";
        document.getElementById("p-usage").textContent = "-";
        
        const addBtn = document.getElementById("p-add-btn");
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = "غير متاح حالياً";
            addBtn.style.background = "#a5a5a5";
            addBtn.style.color = "#fff";
            addBtn.style.cursor = "not-allowed";
        }
        return;
    }

    // حقن بيانات المنتج في عناصر الصفحة فوراً وبشكل لحظي 0ms
    document.title = `Karmel Egypt - ${product.name}`;
    document.getElementById("p-name").textContent = product.name;
    document.getElementById("p-image").src = product.image;
    document.getElementById("p-image").alt = product.name;
    document.getElementById("p-discount").textContent = product.discount;
    document.getElementById("p-old-price").textContent = product.oldPrice;
    document.getElementById("p-new-price").textContent = product.newPrice;

    // 📝 2. حقن النبذة التعريفية تحت الاسم
    const briefEl = document.getElementById("p-brief");
    if (briefEl) {
        if (product.brief && product.brief.trim() !== "") {
            briefEl.textContent = product.brief;
            briefEl.style.display = "block";
        } else {
            briefEl.style.display = "none";
        }
    }

    // تفعيل التنسيق والخط العريض والتباعد المريح للنصوص عبر CSS ديناميكي
    applyProfessionalStyles();

    // حقن النصوص (الفوائد والاستخدام)
    document.getElementById("p-benefits").textContent = product.benefits;
    document.getElementById("p-usage").textContent = product.usage;

    // 📦 3. حقن وإظهار المكونات للبوكسات والباكجات فقط بشكل منسق واحترافي تلقائياً
    renderComponentsSection(cat, product);

    // 🔒 4. فحص ما إذا كان المنتج معلماً كـ (قريباً) لتغيير عمل وزر السلة
    const isComingSoon = product.comingSoon === true || product.status === 'coming_soon';
    const addBtn = document.getElementById("p-add-btn");
    
    if (addBtn) {
        const newAddBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAddBtn, addBtn);
        
        if (isComingSoon) {
            newAddBtn.disabled = true;
            newAddBtn.textContent = "سيتوفر قريباً ⌛";
            newAddBtn.style.background = "#c5a880";
            newAddBtn.style.color = "#fff";
            newAddBtn.style.cursor = "not-allowed";
            newAddBtn.style.border = "none";
        } else {
            newAddBtn.disabled = false;
            newAddBtn.innerHTML = `<i class="fa-solid fa-cart-plus"></i> إضافة إلى السلة`;
            newAddBtn.style.background = ""; 
            newAddBtn.style.color = "";
            newAddBtn.style.cursor = "pointer";
            newAddBtn.addEventListener("click", (event) => {
                addToCart(cat, id, event);
            });
        }
    }
}

// دالة لحقن وعرض المكونات ديناميكياً بدون كسر التصميم الأصلي لصفحتك
function renderComponentsSection(cat, product) {
    const compContainer = document.getElementById("p-components-container");
    const compEl = document.getElementById("p-components");
    const compTitle = document.getElementById("p-components-title");

    if (compContainer && compEl) {
        const hasComponents = product.components && product.components.trim() !== "";
        const isTargetCategory = cat === 'boxes' || cat === 'packages';

        if (isTargetCategory && hasComponents) {
            if (compTitle) {
                compTitle.textContent = cat === 'boxes' ? "مكونات البوكس الشامل:" : "مكونات الباكج المطور:";
            }
            compEl.textContent = product.components;
            compContainer.style.display = "block";
        } else {
            compContainer.style.display = "none";
        }
    }
}

// دالة لحقن تنسيقات الخطوط الاحترافية وتجنب تداخل الكلمات (CSS Injector)
function applyProfessionalStyles() {
    let styleTag = document.getElementById("karmel-custom-fonts-style");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "karmel-custom-fonts-style";
        styleTag.textContent = `
            #p-benefits, #p-usage, #p-components {
                white-space: pre-wrap !important; /* للحفاظ على الأسطر الجديدة */
                line-height: 1.95 !important;     /* مسافة مريحة وممتازة بين السطور */
                font-size: 15px !important;       /* حجم خط مثالي للقراءة */
                font-weight: 600 !important;      /* خط عريض (Bold) ومقروء بوضوح */
                color: #2c2c2c !important;        /* لون خط غامق وممتاز */
                text-align: justify;              /* محاذاة أطراف النصوص بشكل منسق */
                margin-top: 10px;
            }
        `;
        document.head.appendChild(styleTag);
    }
}

// تشغيل صفحة تفاصيل المنتج - بانتظار أحدث بيانات من السيرفر قبل أي عرض
// (بدل عرض النسخة القديمة المحفوظة محلياً الأول ثم استبدالها، وده كان بيسبب "ومضة" للبيانات القديمة)
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof initializeAndLoadProducts !== 'undefined') {
        // أي تعديل لحظي لنفس المنتج بعد كده (سعر، وصف، إخفاء) هيحدث الصفحة تلقائياً من غير Refresh
        if (typeof onLiveProductsUpdate === 'function') {
            onLiveProductsUpdate(renderProductDetails);
        }
        try {
            await initializeAndLoadProducts();
        } catch (error) {
            // لو فشل الاتصال بالسيرفر لأي سبب، منسيبش الصفحة فاضية -
            // نكمل ونعرض من آخر نسخة متاحة في الذاكرة بدل ما نعلّق الصفحة للأبد
            console.error("تعذر جلب أحدث بيانات المنتج، سيتم العرض من آخر نسخة متاحة:", error);
        }
    }
    renderProductDetails();
});