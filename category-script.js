/* هذا الملف بيعتمد على script.js (لازم يتحمّل قبله في category.html)
   بيستخدم نفس قاعدة بيانات المنتجات الحقيقية (allProductsMasterData) بدل بيانات وهمية منفصلة */

const urlParams = new URLSearchParams(window.location.search);
const categoryType = urlParams.get('type') || 'natural';

let currentCategoryItems = [];

function extractPrice(priceString) {
    return parseInt(priceString) || 0;
}

function renderProductsGrid(items) {
    const gridElement = document.getElementById("products-grid");

    // 1. تصفية وحجب المنتجات المحددة كـ (مخفي) أولاً قبل العرض
    const visibleItems = items.filter(item => !(item.hidden === true || item.status === 'hidden'));

    if (!visibleItems || visibleItems.length === 0) {
        gridElement.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>قريباً سيتم إضافة منتجات.</p>";
        return;
    }

    let cardsHTML = "";
    visibleItems.forEach(item => {
        // 2. التحقق مما إذا كان المنتج معلماً كـ (قريباً) لتغيير شكل زر السلة وإيقاف تفعيله
        const isComingSoon = item.comingSoon === true || item.status === 'coming_soon';
        const buttonHTML = isComingSoon 
            ? `<button class="add-to-cart-btn" disabled onclick="event.stopPropagation();" style="background: #c5a880; color: #fff; cursor: not-allowed; border: none;"><i class="fa-solid fa-hourglass-half"></i> سيتوفر قريباً</button>`
            : `<button class="add-to-cart-btn" onclick="addToCart('${categoryType}', '${item.id}', event)">إضافة للسلة</button>`;

        cardsHTML += `
            <div class="product-card" onclick="goToProductDetails('${categoryType}', '${item.id}')">
                <span class="discount-badge">${item.discount}</span>
                <img src="${item.image}" alt="${item.name}" class="product-image" loading="lazy">
                <div class="product-info">
                    <h3 class="product-name">${item.name}</h3>
                    <div class="product-prices">
                        <span class="old-price">${item.oldPrice}</span>
                        <span class="new-price">${item.newPrice}</span>
                    </div>
                    ${buttonHTML}
                </div>
            </div>
        `;
    });
    gridElement.innerHTML = cardsHTML;
}

function sortItems(items, mode) {
    const sorted = [...items];
    if (mode === 'low-high') {
        sorted.sort((a, b) => extractPrice(a.newPrice) - extractPrice(b.newPrice));
    } else if (mode === 'high-low') {
        sorted.sort((a, b) => extractPrice(b.newPrice) - extractPrice(a.newPrice));
    }
    return sorted;
}

// تشغيل فوري وسريع للأقسام
document.addEventListener("DOMContentLoaded", () => {
    const titleElement = document.getElementById("category-title");
    const sortSelect = document.getElementById("sort-select");

    // 1. اعرض المنتجات فوراً وبشكل لحظي من الذاكرة المحلية المخزنة مسبقاً
    const currentCategory = allProductsMasterData[categoryType] || allProductsMasterData['natural'];
    titleElement.textContent = currentCategory.title;
    currentCategoryItems = currentCategory.items;
    
    renderProductsGrid(currentCategoryItems); // عرض لحظي 0ms

    // 2. تفعيل فرز الأسعار
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sorted = sortItems(currentCategoryItems, sortSelect.value);
            renderProductsGrid(sorted);
        });
    }

    // 3. في الخلفية، اطلب من السيرفر تحديث الأسعار دون تعطيل الزائر
    if (typeof initializeAndLoadProducts !== 'undefined') {
        // أي تعديل لحظي بعد كده (سعر، إخفاء منتج، إلخ) هيرسم الشبكة تلقائياً من غير Refresh
        if (typeof onLiveProductsUpdate === 'function') {
            onLiveProductsUpdate(() => {
                const liveCategory = allProductsMasterData[categoryType] || allProductsMasterData['natural'];
                currentCategoryItems = sortItems(liveCategory.items, sortSelect ? sortSelect.value : 'latest');
                renderProductsGrid(currentCategoryItems);
            });
        }

        initializeAndLoadProducts().then(() => {
            // تحديث صامت للكروت بالأسعار الجديدة في حال وجود أي تحديث سحابي
            const updatedCategory = allProductsMasterData[categoryType] || allProductsMasterData['natural'];
            currentCategoryItems = updatedCategory.items;
            renderProductsGrid(currentCategoryItems);
        });
    }
});

// دالة التحويل لصفحة تفاصيل المنتج
function goToProductDetails(category, productId) {
    window.location.href = `product.html?cat=${category}&id=${productId}`;
}

// ربط الدالة عالمياً بالمتصفح لحل مشكلة عدم استجابة الضغط نهائياً في بعض الهواتف
window.goToProductDetails = goToProductDetails;