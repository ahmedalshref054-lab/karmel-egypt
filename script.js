/* ============================================================
   ملف script.js الموحّد - يُحمَّل في كل صفحات الموقع
   يحتوي على: بيانات المنتجات + منطق السلة + السلة العائمة + الواتساب + لوحة التحكم
   ============================================================ */

/* 🔧 رقم الواتساب اللي هيستقبل الطلبات */
const WHATSAPP_NUMBER = "201069086119";

function goToCategory(categoryName) {
    window.location.href = `category.html?type=${categoryName}`;
}

function goToDirectProduct(category, productId) {
    window.location.href = `product.html?cat=${category}&id=${productId}`;
}

function moveSlider(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    if (slider) {
        const card = slider.querySelector('.natural-card') || slider.querySelector('.home-product-card');
        if (card) {
            const cardWidth = card.offsetWidth + 20;
            const beforeScroll = slider.scrollLeft;

            slider.scrollLeft += direction * cardWidth;

            // بعض المتصفحات بتعكس نظام scrollLeft في الصفحات RTL، فممكن السهم
            // يحاول يتحرك في اتجاه "مقفول" فيحس المستخدم إن الكروت عالقة.
            // هنا بنتأكد إن الحركة فعلاً حصلت، ولو ملحصلتش نجرب الاتجاه العكسي.
            if (slider.scrollLeft === beforeScroll) {
                slider.scrollLeft = beforeScroll - (direction * cardWidth);
            }
        }
    }
}

// ربط دوال التنقل بالنافذة العالمية لتعمل في أي صفحة وأي متصفح دون مشاكل
window.goToCategory = goToCategory;
window.goToDirectProduct = goToDirectProduct;
/* ============================================================
   1) قاعدة البيانات الشاملة لكل المنتجات في الموقع
   ============================================================ */
const CATEGORY_TITLES = {
    oils: "الزيوت",
    boxes: "البوكسات",
    packages: "الباكجات",
    natural: "المنتجات"
};

const allProductsMasterData = {
    oils: {
        title: CATEGORY_TITLES.oils,
        items: [
            { id: "o_rosemary", name: "زيت الروزماري", newPrice: "450 ج.م", oldPrice: "550 ج.م", discount: "خصم 18%", benefits: "يعزز نمو الشعر ويقوي البصيلات بشكل ملحوظ.", usage: "تدلك فروة الرأس ببضع قطرات يومياً.", image: "الزيوت.png" },
            { id: "o_jojoba", name: "زيت الجوجوبا", newPrice: "210 ج.م", oldPrice: "250 ج.م", discount: "خصم 16%", benefits: "مرطب عميق للشعر والبشرة يماثل زيوت الجسم الطبيعية.", usage: "يوضع على شعر رطب بعد الغسيل.", image: "الزيوت.png" },
            { id: "o_almond", name: "زيت اللوز الحلو", newPrice: "220 ج.م", oldPrice: "240 ج.م", discount: "خصم 8%", benefits: "ينعم الشعر ويزيد من لمعانه ويغذي الأطراف الجافة.", usage: "توضع قطرات بسيطة على أطراف الشعر.", image: "الزيوت.png" },
            { id: "o_karmel", name: "زيت كارميل", newPrice: "325 ج.م", oldPrice: "399 ج.م", discount: "خصم 19%", benefits: "تركيبة كارميل الخاصة للعناية المكثفة ومنع الهيشان.", usage: "يستخدم كحمام زيت مرتين في الأسبوع.", image: "الزيوت.png" }
        ]
    },
    boxes: {
        title: CATEGORY_TITLES.boxes,
        items: [
            { id: "b_power", name: "بوكس القوة الطبيعية", newPrice: "999 ج.م", oldPrice: "1199 ج.م", discount: "خصم 17%", benefits: "مجموعة متكاملة لإعادة الحيوية والنضارة الفائقة لبشرتك وشعرك.", usage: "يستخدم حسب جدول العناية المرفق مع البوكس.", image: "البوكسات.png" },
            { id: "b_hair", name: "البوكس السحري للعناية بالشعر", newPrice: "1349 ج.م", oldPrice: "1700 ج.م", discount: "خصم 21%", benefits: "أفضل الزيوت الطبيعية لتكثيف الشعر ومنع التساقط.", usage: "يستخدم بانتظام على فروة رأس نظيفة.", image: "البوكسات.png" },
            { id: "b_karmel_full", name: "مجموعة كارميل المتكاملة", newPrice: "1999 ج.م", oldPrice: "2500 ج.م", discount: "خصم 20%", benefits: "المجموعة الشاملة من براند كارميل للعناية اليومية المتكاملة.", usage: "اتباع الخطوات المدونة على عبوات المجموعة.", image: "البوكسات.png" },
            { id: "b_nutrition", name: "بوكس التغذية الطبيعية", newPrice: "999 ج.م", oldPrice: "1199 ج.م", discount: "خصم 17%", benefits: "تغذية عميقة وفائقة غنية بالفيتامينات الأساسية للشعر.", usage: "يستخدم مرتين أسبوعياً كروتين مغذي.", image: "البوكسات.png" }
        ]
    },
    packages: {
        title: CATEGORY_TITLES.packages,
        items: [
            { id: "p_sadr_tamer", name: "باكج السدر ونواة التمر", newPrice: "599 ج.م", oldPrice: "650 ج.م", discount: "خصم 8%", benefits: "مزيج طبيعي ومطحون بعناية فائقة لتغذية بصيلات الشعر وتقويتها من الجذور حتى الأطراف.", usage: "يخلط بالماء الدافئ ويوضع كقناع على الشعر لمدة ساعتين ثم يشطف.", image: "الباكدجات.jpeg" },
            { id: "p_sadr_mashat", name: "باكج السدر والمشاط", newPrice: "799 ج.م", oldPrice: "1000 ج.م", discount: "خصم 20%", benefits: "التركيبة التقليدية الغنية لتعزيز طول الشعر، ولمعانه، وضمان نعومة فائقة وحماية متكاملة.", usage: "يُعجن الخليط ويوضع على كامل الشعر والفروة مرة أسبوعياً.", image: "الباكدجات.jpeg" },
            { id: "p_sadr_moringa", name: "باكج السدر والمورينجا", newPrice: "599 ج.م", oldPrice: "650 ج.م", discount: "خصم 8%", benefits: "باكج غني بالفيتامينات ومضادات الأكسدة الطبيعية لتطهير فروة الرأس وتحفيز نمو الشعر بكثافة.", usage: "يوزع بالتساوي من الجذور للأطراف ويترك لمدة ساعتين قبل الغسيل.", image: "الباكدجات.jpeg" },
            { id: "p_sadr_henna", name: "باكج السدر وحناء المدينة", newPrice: "599 ج.م", oldPrice: "650 ج.م", discount: "خصم 8%", benefits: "حناء المدينة الأصلية الفاخرة ممزوجة بالسدر لتغذية طبيعية مكثفة ولون ساحر وصحي.", usage: "تُعجن وتترك لتتخمر لمدة 6 ساعات، ثم توضع على الشعر.", image: "الباكدجات.jpeg" }
        ]
    },
    natural: {
        title: CATEGORY_TITLES.natural,
        items: [
            { id: "prod_henna", name: "حناء بيور", newPrice: "500 ج.م", oldPrice: "600 ج.م", discount: "خصم 17%", benefits: "حناء المدينة الطبيعية 100% تعمل على تغذية الشعر من الجذور، تقوية البصيلات، وإعطاء لمعان طبيعي رائع للشعر.", usage: "تخلط كمية مناسبة بالماء الدافئ أو مغلي الأعشاب وتترك لتتخمر قليلاً، ثم توضع على الشعر من ساعتين إلى 4 ساعات وتشطف جيداً.", image: "hena.jpg" },
            { id: "prod_mashat_brown", name: "مشاط الشعر", newPrice: "549 ج.م", oldPrice: "699 ج.م", discount: "خصم 21%", benefits: "تركيبة عشبية ممتازة لتنعيم وتغذية الفروة، معالجة التقصف، وإعطاء الشعر حيوية ومظهر صحي جذاب.", usage: "يمكن عجنه مع الماء أو الزيت المفضل لديك، ويوزع على كامل الشعر والفروة لمدة ساعتين ثم يغسل.", image: "msh.jpg" },
            { id: "prod_sadr_pure", name: "سدر مطحون", newPrice: "349 ج.م", oldPrice: "450 ج.م", discount: "خصم 22%", benefits: "سدر طبيعي نقي ومطحون بعناية، يعمل كشامبو طبيعي ينظف الفروة، يقوي الشعر الخفيف، ويمنع التساقط.", usage: "يخلط بالماء الدافئ حتى تحصلي على قوام شبه سائل، يوضع على الفروة والشعر لمدة ساعة إلى ساعتين ثم يشطف بالماء فقط.", image: "mat.jpg" },
            { id: "prod_sadr_mask", name: "نواة التمر", newPrice: "499 ج.م", oldPrice: "599 ج.م", discount: "خصم 17%", benefits: "ماسك مكثف غني بخلاصة السدر والزيوت الطبيعية لترطيب الشعر الجاف والتالف وعلاج التقصف بعمق.", usage: "يوضع على شعر نظيف ورطب من الجذور للأطراف، يترك لمدة ساعة مع تغطيته، ثم يغسل جيداً بالشامبو المخفف.", image: "nawa.jpg" }
        ]
    }
};

// ملحوظة: كان هنا كود بيعيد حفظ نفس بيانات المنتجات في كل تحميل صفحة من غير داعي
// (البيانات أصلاً بتتحمل من الكاش فوق مباشرة، وapplyCloudProducts بقت هي المسؤولة عن الحفظ
// بشكل آمن كل ما يوصل تحديث فعلي من السيرفر)

/* ============================================================
   2) منطق السلة (تخزين دائم عبر localStorage)
   ============================================================ */
function getCart() {
    const cart = localStorage.getItem('auria_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('auria_cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(category, productId, event) {
    if (event) {
        event.stopPropagation();
    }

    if (!allProductsMasterData[category]) return;
    const product = allProductsMasterData[category].items.find(item => item.id === productId);
    if (!product) return;

    // 🔒 حماية إضافية: عدم السماح بإضافة المنتجات المخفية أو التي ستتوفر قريباً
    const isHidden = product.hidden === true || product.status === 'hidden';
    const isComingSoon = product.comingSoon === true || product.status === 'coming_soon';

    if (isHidden) {
        alert("عذراً، هذا المنتج غير متاح حالياً.");
        return;
    }
    if (isComingSoon) {
        alert("هذا المنتج غير متوفر حالياً وسيتوفر قريباً.");
        return;
    }

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseInt(product.newPrice),
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    showCartToast(`${product.name} اتضافت للسلة ✅`);
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = totalItems;
    }
    renderMiniCart();
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
});

/* ============================================================
   2.5) بيانات كروت الأقسام في الصفحة الرئيسية (الحاويات)
   نفس الصور والنصوص المكتوبة أصلاً في index.html، بتُستخدم كقيمة
   افتراضية فورية قبل ما يوصل أي تحديث سحابي من Firebase.
   ============================================================ */
const categoryCardsData = {
    boxes:    { image: "تيست البوكسات.jpeg",   label: "البوكسات" },
    natural:  { image: "تيست المنتجات.png",     label: "المنتجات" },
    packages: { image: "تيست الباكدج.png",      label: "الباكجات" },
    oils:     { image: "تيست 2.jpeg",           label: "الزيوت"  }
};

/* ============================================================
   3) قاعدة بيانات الطلبات (المشتركة مع لوحة الآدمن)
   ============================================================ */
/* ============================================================
   قاعدة بيانات الطلبات السحابية (Firebase Cloud Database)
   ============================================================ */

/* 🔗 ضع رابط الفايربيز الأزرق الخاص بك هنا بدلاً من الكلمة المكتوبة */
const FIREBASE_DB_URL = "https://karmel-98999-default-rtdb.firebaseio.com/"; 

// جلب الأوردرات من السحابة لمرة واحدة (تُستخدم في المودال وأماكن الطلب لحظة الحاجة فقط)
async function getOrders() {
    try {
        const authQuery = await buildAdminAuthQuery();
        const response = await fetch(`${FIREBASE_DB_URL}orders.json${authQuery}`);
        const data = await response.json();
        if (!data) return [];
        // تحويل الكائن القادم من فايربيز إلى مصفوفة مرتبة
        return Object.keys(data).map(key => data[key]);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

// دالة مساعدة: بترجع "?auth=TOKEN" لو الأدمن مسجل دخول (صفحات الأدمن فقط)، أو "" لو صفحة عميل عادية
async function buildAdminAuthQuery() {
    if (typeof getAdminIdToken !== 'function') return '';
    const token = await getAdminIdToken();
    return token ? `?auth=${token}` : '';
}

/* ============================================================
   استماع لحظي للأوردرات (Realtime Listener) - لوحة الكول سنتر بس
   بدل ما تحتاج تضغط "تحديث"، أي أوردر جديد أو تعديل حالة يوصل
   ويترسم في الصفحة تلقائياً فور حدوثه.
   ============================================================ */
let ordersListenerStarted = false;
const ordersUpdateCallbacks = [];

// أي صفحة عايزة تعيد رسم نفسها تلقائياً كل ما الأوردرات تتغير لحظياً، تسجل دالتها هنا
function onLiveOrdersUpdate(callback) {
    ordersUpdateCallbacks.push(callback);
}

/**
 * بتبدأ الاستماع اللحظي لمسار "orders" كامل، وبترجع Promise بتتحل بمجرد وصول
 * أول نسخة (زي getOrders بالظبط عشان أي كود قديم يفضل شغال)، وبعد كده بتفضل
 * مستمعة وتنادي أي دالة اتسجلت عن طريق onLiveOrdersUpdate تلقائياً مع كل تحديث.
 *
 * محتاجة توكن أدمن صالح (نفس شرط الـ Rules)، فبتتسجل بعد ما يتأكد إن فيه
 * مستخدم مسجل دخول فعلاً.
 */
function startLiveOrdersListener() {
    return new Promise((resolve) => {
        if (typeof firebase === 'undefined' || !firebase.database) {
            // لو الـ Database SDK مش محمّل لأي سبب، نرجع لطلب عادي لمرة واحدة
            getOrders().then((orders) => { resolve(orders); });
            return;
        }

        if (ordersListenerStarted) {
            resolve(null);
            return;
        }
        ordersListenerStarted = true;

        let isFirstSnapshot = true;
        firebase.database().ref('orders').on('value', (snapshot) => {
            const data = snapshot.val();
            const orders = data ? Object.keys(data).map(key => data[key]) : [];

            if (isFirstSnapshot) {
                isFirstSnapshot = false;
                resolve(orders);
            } else {
                // تحديث لحظي فعلي: بيحصل تلقائياً كل ما عميل يعمل أوردر جديد أو حالة تتغير
                ordersUpdateCallbacks.forEach(cb => {
                    try { cb(orders); } catch (e) { console.error(e); }
                });
            }
        }, (error) => {
            console.error("خطأ في الاتصال اللحظي بالأوردرات:", error);
            resolve([]);
        });
    });
}

// إيقاف الاستماع اللحظي (مثلاً عند تسجيل الخروج) لتفادي أخطاء صلاحيات في الـ Console
// والسماح بإعادة البدء بشكل نظيف لو حساب مختلف سجل دخول في نفس التاب
function stopLiveOrdersListener() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('orders').off('value');
    }
    ordersListenerStarted = false;
}

// حفظ أوردر جديد سحابياً
async function saveOrderToCloud(newOrder) {
    try {
        await fetch(`${FIREBASE_DB_URL}orders/${newOrder.id}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
        });
    } catch (error) {
        console.error("Error saving order:", error);
    }
}

// تحديث حالة الأوردر من لوحة التحكم سحابياً (محتاج توكن أدمن)
async function updateOrderStatus(orderId, newStatus) {
    try {
        const authQuery = await buildAdminAuthQuery();
        await fetch(`${FIREBASE_DB_URL}orders/${orderId}/status.json${authQuery}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStatus)
        });
    } catch (error) {
        console.error("Error updating order status:", error);
    }
}

// حذف أوردر من السحابة نهائياً (محتاج توكن أدمن)
async function deleteOrderFromCloud(orderId) {
    try {
        const authQuery = await buildAdminAuthQuery();
        await fetch(`${FIREBASE_DB_URL}orders/${orderId}.json${authQuery}`, {
            method: 'DELETE'
        });
    } catch (error) {
        console.error("Error deleting order:", error);
    }
}

/* ربط فتح شات الواتساب مع العميل من كارت تفاصيل الآدمن */
function openWhatsAppChat(phone, message) {
    let cleanPhone = phone.trim().replace(/[\s\+\-]/g, '');
    if (!cleanPhone.startsWith('20') && cleanPhone.startsWith('01')) {
        cleanPhone = '20' + cleanPhone.substring(1);
    }
    const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

// ضع الرابط الذي حصلت عليه من جوجل شيت هنا بين القوسين
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxCUeYXXws7vx9r2XaHfVtXXSpht8-P7CZKGBUhTPjWzzvPGFVf2TJ2gWkFBg4vPGWIjQ/exec";

// 🔒 لازم تكون نفس القيمة المكتوبة في متغير SHARED_SECRET جوه كود Google Apps Script
const GOOGLE_SHEET_SECRET = "f97e7540-0e1a-42ee-a03e-72d5be346fda";

/* إرسال نسخة من الطلب لجوجل شيت في نفس لحظة تسجيله في الفايربيز */
async function saveOrderToGoogleSheets(order) {
    try {
        // ⚠️ لازم نطابق أسماء الحقول بالظبط زي ما الـ Apps Script بتاعنا بيتوقعها:
        // secret, id, createdAt, customer{name,phone,address}, items[{name,quantity}], total
        const payload = {
            secret: GOOGLE_SHEET_SECRET,
            id: order.id,
            createdAt: order.createdAt,
            customer: {
                name: order.customer.name,
                phone: order.customer.phone,
                governorate: order.customer.governorate,
                address: order.customer.address
            },
            items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity
            })),
            shippingCost: order.shippingCost || 0,
            total: order.total
        };

        // مهلة أمان: لو الشيت اتأخر أكتر من 10 ثواني بنلغي الطلب بدل ما يفضل معلّق للأبد
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // ملحوظة مهمة: Google Apps Script مش بيدعم CORS بالطريقة العادية،
        // فبنستخدم mode: 'no-cors' عشان الطلب يتبعت وينفذ بنجاح حتى لو مقدرناش نقرأ رد السيرفر
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log("تم إرسال نسخة الطلب لجوجل شيت بنجاح ✅ (رقم الطلب: " + order.id + ")");
    } catch (error) {
        // لو فشل الاتصال بالشيت لأي سبب (نت بطيء، الرابط اتغير، أو تجاوز المهلة) منسيبوش يوقف باقي العملية
        // الطلب يفضل محفوظ في الفايربيز بأمان حتى لو الشيت فشل في اللحظة دي
        console.error("تعذر إرسال نسخة الطلب لجوجل شيت:", error);
    }
}

/* ============================================================
   إرسال الطلب وإدخاله للآدمن (بدون تحويل للواتساب)
   ============================================================ *//* ============================================================
   إرسال الطلب وإدخاله للآدمن وللشيت (إصدار الاستقرار التام)
   ============================================================ */
async function sendOrderToWhatsApp(customerName, customerPhone, customerAddress, customerGovernorate, shippingCost) {
    const cart = getCart();
    if (cart.length === 0) {
        alert("سلتك فارغة حالياً!");
        return;
    }

    // إظهار "جاري إرسال طلبك..." على الزرار فور الضغط على تأكيد الطلب
    const submitBtn = document.querySelector('.submit-order-btn');
    let originalBtnHTML = '';
    if (submitBtn) {
        originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إرسال طلبك... ⏳';
    }

    let productsTotal = 0;
    cart.forEach(item => {
        productsTotal += item.price * item.quantity;
    });
    const shipping = (typeof shippingCost === 'number' && shippingCost > 0) ? shippingCost : 0;
    const totalPrice = productsTotal + shipping;
    const orderId = 'KM-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'incoming',
        total: totalPrice,
        shippingCost: shipping,
        customer: {
            name: customerName,
            phone: customerPhone,
            governorate: customerGovernorate,
            address: customerAddress
        },
        items: cart
    };

    try {
        // 1. حفظ الطلب سحابياً في الفايربيز للوحة التحكم الأصلية
        await saveOrderToCloud(newOrder);
        // 2. إرسال الطلب تلقائياً إلى جدول بيانات جوجل شيت للطباعة
        await saveOrderToGoogleSheets(newOrder);

        localStorage.removeItem('auria_cart');
        updateCartCount();

        alert(`✅ تم استلام طلبك بنجاح! \nرقم الطلب الخاص بك هو: ${orderId} \n\nشكرًا لتسوقك من كارميل مصر، سيتواصل معك فريق خدمة العملاء قريباً لتأكيد الشحن.`);
        window.location.href = 'index.html';
    } catch (error) {
        // لو حصل أي خطأ غير متوقع، منسيبش الزرار معلّق - نرجعه لحالته الطبيعية ونوضح للعميل
        console.error("حدث خطأ أثناء إرسال الطلب:", error);
        alert("عذراً، حدث خطأ أثناء إرسال طلبك. برجاء المحاولة مرة أخرى.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    }
}

/* ملحوظة: الدالة القديمة المكررة (النسخة البسيطة بدون timeout) اتشالت من هنا
   عشان منفضلش عندنا تعريفين بنفس الاسم - كانت بتلغي النسخة الأفضل اللي فوق فعلياً */
/* ============================================================
   5) السلة العائمة (Floating Mini-Cart)
   ============================================================ */
function injectFloatingCart() {
    const currentPage = window.location.pathname;
    if (currentPage.endsWith('cart.html')) return;
    // السلة العائمة بتاعة العميل مالهاش أي داعي تظهر في لوحات تحكم الأدمن
    if (currentPage.endsWith('admin.html') || currentPage.endsWith('admin-products.html')) return;
    if (document.getElementById('floating-cart-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
        .icon-link { position: relative; }
        #cart-count {
            position: absolute;
            top: -8px;
            left: -10px;
            background: #d81b1b;
            color: #fff;
            font-size: 11px;
            font-weight: bold;
            min-width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
        }
        .floating-cart-btn {
            position: fixed;
            bottom: 24px;
            left: 24px;
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: #0d3b1e;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            box-shadow: 0 6px 18px rgba(0,0,0,0.25);
            cursor: pointer;
            z-index: 9998;
            border: none;
            transition: transform 0.2s ease;
        }
        .floating-cart-btn:hover { transform: scale(1.08); }
        .floating-cart-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #d81b1b;
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            min-width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
        }
        .cart-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
        }
        .cart-overlay.active { opacity: 1; pointer-events: all; }
        .cart-drawer {
            position: fixed;
            top: 0;
            right: -420px;
            width: 380px;
            max-width: 90vw;
            height: 100%;
            background: #fff;
            z-index: 10000;
            box-shadow: -6px 0 20px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            transition: right 0.3s ease;
        }
        .cart-drawer.active { right: 0; }
        .cart-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 20px;
            border-bottom: 1px solid #eee;
        }
        .cart-drawer-header h3 { margin: 0; font-size: 18px; color: #0d3b1e; }
        .cart-close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #555; }
        .cart-drawer-items { flex: 1; overflow-y: auto; padding: 10px 20px; }
        .cart-empty-msg { text-align: center; color: #888; margin-top: 40px; font-size: 15px; }
        .mini-cart-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
        .mini-cart-item img { width: 62px; height: 62px; object-fit: cover; border-radius: 8px; background: #f5f5f5; }
        .mini-cart-item-info { flex: 1; }
        .mini-cart-item-name { font-size: 14px; font-weight: 600; color: #222; margin: 0 0 6px; }
        .mini-cart-item-price { font-size: 13px; color: #0d3b1e; font-weight: bold; }
        .mini-cart-item-qty { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .qty-btn { width: 24px; height: 24px; border: 1px solid #ccc; background: #fafafa; border-radius: 6px; cursor: pointer; font-size: 14px; line-height: 1; }
        .mini-cart-item-remove { background: none; border: none; color: #c0392b; font-size: 16px; cursor: pointer; align-self: flex-start; }
        .cart-drawer-footer { padding: 16px 20px 20px; border-top: 1px solid #eee; }
        .cart-subtotal-row { display: flex; justify-content: space-between; font-size: 15px; margin-bottom: 14px; font-weight: bold; color: #222; }
        .cart-checkout-btn {
            display: block; width: 100%; padding: 12px; background: #0d3b1e; color: #fff;
            border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: bold;
            text-align: center; text-decoration: none; box-sizing: border-box;
        }
        .cart-checkout-btn:hover { background: #12522a; }
        .cart-toast {
            position: fixed; bottom: 95px; left: 24px; background: #0d3b1e; color: #fff;
            padding: 10px 16px; border-radius: 8px; font-size: 13px; z-index: 10001;
            opacity: 0; transform: translateY(10px); transition: all 0.25s ease; pointer-events: none;
            max-width: 80vw;
        }
        .cart-toast.show { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <button class="floating-cart-btn" id="floating-cart-btn" onclick="openMiniCart()" aria-label="فتح السلة">
            <i class="fa-solid fa-bag-shopping"></i>
            <span class="floating-cart-badge" id="floating-cart-badge">0</span>
        </button>
        <div class="cart-overlay" id="cart-overlay" onclick="closeMiniCart()"></div>
        <aside class="cart-drawer" id="cart-drawer">
            <div class="cart-drawer-header">
                <h3>سلة المشتريات</h3>
                <button class="cart-close-btn" onclick="closeMiniCart()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="cart-drawer-items" id="cart-drawer-items">
                <p class="cart-empty-msg">السلة فارغة، ابدأ بإضافة منتجاتك المفضلة </p>
            </div>
            <div class="cart-drawer-footer">
                <div class="cart-subtotal-row">
                    <span>الإجمالي</span>
                    <span id="cart-subtotal">0 ج.م</span>
                </div>
                <a class="cart-checkout-btn" href="cart.html">إتمام الشراء</a>
            </div>
        </aside>
        <div class="cart-toast" id="cart-toast"></div>
    `;
    document.body.appendChild(wrapper);
}

function renderMiniCart() {
    const cart = getCart();

    const floatingBadge = document.getElementById('floating-cart-badge');
    if (floatingBadge) {
        floatingBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    const itemsContainer = document.getElementById('cart-drawer-items');
    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="cart-empty-msg">السلة فارغة، ابدأ بإضافة منتجاتك المفضلة 🛍️</p>';
    } else {
        itemsContainer.innerHTML = cart.map(item => `
            <div class="mini-cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="mini-cart-item-info">
                    <p class="mini-cart-item-name">${item.name}</p>
                    <span class="mini-cart-item-price">${item.price} ج.م</span>
                    <div class="mini-cart-item-qty">
                        <button class="qty-btn" onclick="changeMiniCartQty('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="changeMiniCartQty('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="mini-cart-item-remove" onclick="removeMiniCartItem('${item.id}')" aria-label="حذف">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalEl = document.getElementById('cart-subtotal');
    if (subtotalEl) subtotalEl.textContent = subtotal + ' ج.م';
}

function changeMiniCartQty(productId, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart(cart);
}

function removeMiniCartItem(productId) {
    const cart = getCart().filter(i => i.id !== productId);
    saveCart(cart);
}

function openMiniCart() {
    injectFloatingCart();
    renderMiniCart();
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeMiniCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

let cartToastTimer = null;
function showCartToast(message) {
    const toast = document.getElementById('cart-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(cartToastTimer);
    cartToastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    injectFloatingCart();
    renderMiniCart();
});

function toggleMenu() {
    document.getElementById('nav-menu').classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }
});
/* ============================================================
   [تحديث] جلب المنتجات والأسعار من الفايربيز وتحديث الصفحة الرئيسية (مع ذاكرة مؤقتة فورية)
   ============================================================ */

/* ============================================================
   جلب المنتجات والأسعار من الفايربيز لحظياً (Realtime Listener)
   بدل الفحص الدوري - أي تعديل من الداشبورد يظهر عند العميل فوراً
   بدون ما يعمل Refresh خالص
   ============================================================ */

// جلب البيانات من الذاكرة المحلية فوراً (قبل حتى بدء تحميل الصفحة) لتجنب أي تأخير في أول ظهور
const localCachedProducts = localStorage.getItem('allProductsData');
if (localCachedProducts) {
    try {
        const parsedData = JSON.parse(localCachedProducts);
        Object.assign(allProductsMasterData, parsedData);
    } catch (e) {
        console.error("خطأ في قراءة الكاش المحلي:", e);
    }
}

function applyCloudProducts(cloudProducts) {
    if (cloudProducts && Object.keys(cloudProducts).length > 0) {
        Object.keys(cloudProducts).forEach(cat => {
            if (allProductsMasterData[cat]) {
                allProductsMasterData[cat].items = cloudProducts[cat].items;
            }
        });
        // نفضل نحدث الكاش المحلي كمان، عشان أول ظهور للصفحة يبقى سريع حتى لو النت بطيء لحظتها.
        // ده اختياري بحت: لو فشل الحفظ (مثلاً بسبب حجم كبير لصور base64 قديمة لسه موجودة)،
        // مينفعش نوقف باقي العملية (تحديث الشاشة لحظياً)، بس نتجاهل فشل الكاش ونكمل عادي.
        try {
            localStorage.setItem('allProductsData', JSON.stringify(allProductsMasterData));
        } catch (cacheError) {
            console.warn("تعذر حفظ نسخة محلية من المنتجات (على الأغلب الحجم كبير بسبب صور قديمة base64)، لكن التحديث اللحظي هيكمل عادي:", cacheError);
        }
    }
}

let productsListenerStarted = false;
const productsUpdateCallbacks = [];

// أي صفحة عايزة تعيد رسم نفسها تلقائياً كل ما سعر أو منتج يتغير لحظياً، تسجل دالتها هنا
function onLiveProductsUpdate(callback) {
    productsUpdateCallbacks.push(callback);
}

/**
 * بتاخد أول نسخة من بيانات المنتجات (وترجع Promise بتتحل بمجرد وصولها، تماماً
 * زي القديمة عشان الصفحات الحالية تفضل شغالة زي ما هي)، وبعد كده بتفضل مستمعة
 * لأي تغيير لحظي وتنادي أي دالة اتسجلت عن طريق onLiveProductsUpdate تلقائياً.
 *
 * لو Firebase Database SDK مش محمّل في الصفحة دي لأي سبب، بترجع تلقائياً لطلب
 * REST عادي لمرة واحدة (تحديث لحظي مش هيشتغل في الحالة دي بس الصفحة تفضل شغالة).
 */
function initializeAndLoadProducts() {
    return new Promise((resolve) => {
        if (typeof firebase === 'undefined' || !firebase.database) {
            fetch(`${FIREBASE_DB_URL}products.json`)
                .then(res => res.json())
                .then(cloudProducts => { applyCloudProducts(cloudProducts); resolve(); })
                .catch(error => { console.error("خطأ في الاتصال بالسيرفر:", error); resolve(); });
            return;
        }

        if (productsListenerStarted) {
            resolve();
            return;
        }
        productsListenerStarted = true;

        let isFirstSnapshot = true;
        firebase.database().ref('products').on('value', (snapshot) => {
            applyCloudProducts(snapshot.val());
            if (isFirstSnapshot) {
                isFirstSnapshot = false;
                resolve();
            } else {
                // تحديث لحظي فعلي: بيحصل تلقائياً كل ما الأدمن يغيّر سعر أو منتج
                productsUpdateCallbacks.forEach(cb => {
                    try { cb(); } catch (e) { console.error(e); }
                });
            }
        }, (error) => {
            console.error("خطأ في الاتصال اللحظي بقاعدة البيانات:", error);
            resolve();
        });
    });
}

/* ============================================================
   استماع لحظي لبيانات كروت الأقسام (الحاويات) - نفس نمط المنتجات بالظبط
   ============================================================ */
function applyCloudCategoryCards(cloudData) {
    if (cloudData && Object.keys(cloudData).length > 0) {
        Object.keys(cloudData).forEach(catKey => {
            if (categoryCardsData[catKey]) {
                categoryCardsData[catKey] = { ...categoryCardsData[catKey], ...cloudData[catKey] };
            }
        });
    }
}

let categoryCardsListenerStarted = false;
const categoryCardsUpdateCallbacks = [];

// أي صفحة عايزة تعيد رسم كروت الأقسام تلقائياً كل ما تتغير لحظياً، تسجل دالتها هنا
function onLiveCategoryCardsUpdate(callback) {
    categoryCardsUpdateCallbacks.push(callback);
}

function initializeAndLoadCategoryCards() {
    return new Promise((resolve) => {
        if (typeof firebase === 'undefined' || !firebase.database) {
            fetch(`${FIREBASE_DB_URL}categoryCards.json`)
                .then(res => res.json())
                .then(cloudData => { applyCloudCategoryCards(cloudData); resolve(); })
                .catch(error => { console.error("خطأ في الاتصال بالسيرفر:", error); resolve(); });
            return;
        }

        if (categoryCardsListenerStarted) {
            resolve();
            return;
        }
        categoryCardsListenerStarted = true;

        let isFirstSnapshot = true;
        firebase.database().ref('categoryCards').on('value', (snapshot) => {
            applyCloudCategoryCards(snapshot.val());
            if (isFirstSnapshot) {
                isFirstSnapshot = false;
                resolve();
            } else {
                categoryCardsUpdateCallbacks.forEach(cb => {
                    try { cb(); } catch (e) { console.error(e); }
                });
            }
        }, (error) => {
            console.error("خطأ في الاتصال اللحظي ببيانات الحاويات:", error);
            resolve();
        });
    });
}

// بترسم كروت الأقسام الأربعة في الصفحة الرئيسية بناءً على categoryCardsData الحالية
function renderCategoryCards() {
    Object.keys(categoryCardsData).forEach(catKey => {
        const card = categoryCardsData[catKey];
        const imgEl = document.getElementById(`category-card-img-${catKey}`);
        const btnEl = document.getElementById(`category-card-btn-${catKey}`);
        if (imgEl && card.image) imgEl.src = card.image;
        if (btnEl && card.label) btnEl.textContent = card.label;
    });
}

function renderHomePageProducts() {
    const oilsSlider = document.getElementById('oils-slider');
    const boxesSlider = document.getElementById('boxes-slider');
    const packagesSlider = document.getElementById('packages-slider');
    const naturalSlider = document.getElementById('naturalProductsSlider');

    // 1. قسم الزيوت
    if (oilsSlider && allProductsMasterData.oils) {
        oilsSlider.innerHTML = allProductsMasterData.oils.items
            .filter(item => !(item.hidden === true || item.status === 'hidden')) // تصفية المنتجات المخفية
            .map(item => {
                const isComingSoon = item.comingSoon === true || item.status === 'coming_soon';
                const buttonHTML = isComingSoon 
                    ? `<button class="cart-add-btn" disabled onclick="event.stopPropagation();" style="background: #c5a880; color: #fff; cursor: not-allowed; border: none;"><i class="fa-solid fa-hourglass-half"></i> سيتوفر قريباً</button>`
                    : `<button class="cart-add-btn" onclick="addToCart('oils', '${item.id}', event)">إضافة للسلة</button>`;

                return `
                    <div class="home-product-card" onclick="goToDirectProduct('oils', '${item.id}')">
                        <span class="home-discount-badge">${item.discount}</span>
                        <img src="${item.image}" alt="${item.name}" class="home-product-image" loading="lazy">
                        <div class="home-product-info">
                            <h3 class="home-product-name">${item.name}</h3>
                            <div class="home-product-prices">
                                <span class="home-old-price">${item.oldPrice}</span>
                                <span class="home-new-price">${item.newPrice}</span>
                            </div>
                            ${buttonHTML}
                        </div>
                    </div>
                `;
            }).join('');
    }

    // 2. قسم البوكسات
    if (boxesSlider && allProductsMasterData.boxes) {
        boxesSlider.innerHTML = allProductsMasterData.boxes.items
            .filter(item => !(item.hidden === true || item.status === 'hidden')) // تصفية المنتجات المخفية
            .map(item => {
                const isComingSoon = item.comingSoon === true || item.status === 'coming_soon';
                const buttonHTML = isComingSoon 
                    ? `<button class="cart-add-btn" disabled onclick="event.stopPropagation();" style="background: #c5a880; color: #fff; cursor: not-allowed; border: none;"><i class="fa-solid fa-hourglass-half"></i> سيتوفر قريباً</button>`
                    : `<button class="cart-add-btn" onclick="addToCart('boxes', '${item.id}', event)">إضافة للسلة</button>`;

                return `
                    <div class="home-product-card" onclick="goToDirectProduct('boxes', '${item.id}')">
                        <span class="home-discount-badge">${item.discount}</span>
                        <img src="${item.image}" alt="${item.name}" class="home-product-image" loading="lazy">
                        <div class="home-product-info">
                            <h3 class="home-product-name">${item.name}</h3>
                            <div class="home-product-prices">
                                <span class="home-old-price">${item.oldPrice}</span>
                                <span class="home-new-price">${item.newPrice}</span>
                            </div>
                            ${buttonHTML}
                        </div>
                    </div>
                `;
            }).join('');
    }

    // 3. قسم الباكجات
    if (packagesSlider && allProductsMasterData.packages) {
        packagesSlider.innerHTML = allProductsMasterData.packages.items
            .filter(item => !(item.hidden === true || item.status === 'hidden')) // تصفية المنتجات المخفية
            .map(item => {
                const isComingSoon = item.comingSoon === true || item.status === 'coming_soon';
                const buttonHTML = isComingSoon 
                    ? `<button class="cart-add-btn" disabled onclick="event.stopPropagation();" style="background: #c5a880; color: #fff; cursor: not-allowed; border: none;"><i class="fa-solid fa-hourglass-half"></i> سيتوفر قريباً</button>`
                    : `<button class="cart-add-btn" onclick="addToCart('packages', '${item.id}', event)">إضافة للسلة</button>`;

                return `
                    <div class="home-product-card" onclick="goToDirectProduct('packages', '${item.id}')">
                        <span class="home-discount-badge">${item.discount}</span>
                        <img src="${item.image}" alt="${item.name}" class="home-product-image" loading="lazy">
                        <div class="home-product-info">
                            <h3 class="home-product-name">${item.name}</h3>
                            <div class="home-product-prices">
                                <span class="home-old-price">${item.oldPrice}</span>
                                <span class="home-new-price">${item.newPrice}</span>
                            </div>
                            ${buttonHTML}
                        </div>
                    </div>
                `;
            }).join('');
    }

    // 4. قسم المنتجات الطبيعية
    if (naturalSlider && allProductsMasterData.natural) {
        naturalSlider.innerHTML = allProductsMasterData.natural.items
            .filter(item => !(item.hidden === true || item.status === 'hidden')) // تصفية المنتجات المخفية
            .map(item => {
                const isComingSoon = item.comingSoon === true || item.status === 'coming_soon';
                const buttonHTML = isComingSoon 
                    ? `<button class="cart-add-btn" disabled onclick="event.stopPropagation();" style="background: #c5a880; color: #fff; cursor: not-allowed; border: none;"><i class="fa-solid fa-hourglass-half"></i> قريباً ⌛</button>`
                    : `<button class="cart-add-btn" onclick="addToCart('natural', '${item.id}', event)">إضافة للسلة 🛒</button>`;

                return `
                    <div class="natural-card" onclick="goToDirectProduct('natural', '${item.id}')">
                        <div class="natural-badge">${item.discount}</div>
                        <div class="natural-img-box">
                            <img src="${item.image}" alt="${item.name}" loading="lazy">
                        </div>
                        <h3 class="natural-title">${item.name}</h3>
                        <div class="natural-price-box">
                            <span class="nat-new-price">${item.newPrice}</span>
                            <span class="nat-old-price">${item.oldPrice}</span>
                        </div>
                        ${buttonHTML}
                    </div>
                `;
            }).join('');
    }
}

// تحميل فوري من الكاش أولاً، ثم تحديث في الخلفية بهدوء، وبعد كده أي تحديث لحظي هيرسم الصفحة تلقائياً
document.addEventListener("DOMContentLoaded", () => {
    renderHomePageProducts(); // ارسم الكروت فوراً بالأسعار المحفوظة بـ 0 ثانية تأخير
    onLiveProductsUpdate(renderHomePageProducts); // أي تعديل من الداشبورد بعد كده هيرسم الصفحة تلقائياً بدون Refresh
    initializeAndLoadProducts().then(() => {
        renderHomePageProducts(); // أعد الرسم فور وصول أول نسخة فعلية من السيرفر
    });

    // كروت الأقسام (الحاويات) - نفس المنطق بالظبط
    renderCategoryCards();
    onLiveCategoryCardsUpdate(renderCategoryCards);
    initializeAndLoadCategoryCards().then(() => {
        renderCategoryCards();
    });
});