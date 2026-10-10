/* لوحة تحكم الأوردرات السحابية - كارميل مصر */

// UID الحساب المسموح له بدخول لوحة الأوردرات (حساب الكول سنتر بس)
const ORDERS_ALLOWED_UID = 'KSv4NnnDPscvnOtwJ81L9NmJqJr2';

function checkAdminAuth() {
    // بيراقب حالة تسجيل الدخول باستمرار (مش فحص لمرة واحدة زي sessionStorage القديم)
    watchAdminAuthState((user) => {
        if (user && user.uid === ORDERS_ALLOWED_UID) {
            showAdminApp();
        } else if (user) {
            // حساب مسجل دخول فعلاً بس مش صاحب صلاحية الصفحة دي (زي حساب صاحب المعرض بالغلط)
            adminSignOut();
            alert('الحساب ده مش عنده صلاحية الدخول لصفحة متابعة الطلبات.');
        } else {
            document.getElementById('admin-lock-screen').style.display = 'flex';
            document.getElementById('admin-app').style.display = 'none';
        }
    });
}

async function attemptLogin(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email-input').value;
    const password = document.getElementById('admin-password-input').value;
    const errorEl = document.getElementById('admin-login-error');
    errorEl.textContent = '';

    try {
        await adminSignIn(email, password);
        // showAdminApp() هتتنفذ تلقائياً عن طريق watchAdminAuthState
    } catch (error) {
        errorEl.textContent = 'بيانات الدخول غلط، حاول تاني';
        console.error('Admin login failed:', error.code);
    }
}

async function handleAdminLogout() {
    stopLiveOrdersListener();
    stopLiveDailyReportsListener();
    await adminSignOut();
    // watchAdminAuthState هتتكفل بإخفاء لوحة التحكم وإظهار شاشة الدخول تلقائياً
}

function showAdminApp() {
    document.getElementById('admin-lock-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'block';

    // أي أوردر جديد أو تعديل حالة بعد كده هيوصل ويترسم لوحده تلقائياً بدون أي تحديث يدوي
    onLiveOrdersUpdate((orders) => renderBoard(orders));

    // نفس الفكرة بالظبط لعمود "التقرير اليومي" - أي أوردر يتحط "تم التجهيز" يظهر فوراً
    onLiveDailyReportsUpdate((reports) => renderDailyColumn(reports));

    // أول عرض للوحة، بمجرد ما توصل أول نسخة من الأوردرات
    startLiveOrdersListener().then((orders) => {
        if (orders) renderBoard(orders);
    });

    // أول عرض لعمود التقرير اليومي، بمجرد ما توصل أول نسخة من سجل التقارير
    startLiveDailyReportsListener().then((reports) => {
        if (reports) renderDailyColumn(reports);
    });

    // مراقبة دخول يوم جديد كل دقيقة، عشان عمود "التقرير اليومي" يتصفر لوحده
    // بالظبط مع أول لحظة بعد منتصف الليل حتى لو حد سايب الصفحة مفتوحة من غير ريفرش
    startMidnightWatcher();
}

let midnightWatcherStarted = false;
function startMidnightWatcher() {
    if (midnightWatcherStarted) return; // منمنعش تشغيل أكتر من مؤقت واحد لو الدالة اتنادت أكتر من مرة
    midnightWatcherStarted = true;

    let lastKnownDateKey = getTodayDateKey();
    setInterval(() => {
        const currentDateKey = getTodayDateKey();
        if (currentDateKey !== lastKnownDateKey) {
            lastKnownDateKey = currentDateKey;
            renderDailyColumn(); // إعادة رسم العمود بنفس البيانات المخزنة، لكن بفلتر تاريخ اليوم الجديد
        }
    }, 60 * 1000); // فحص كل دقيقة
}

// نحتفظ بآخر نسخة من الأوردرات وصلت عشان نقدر نجيب بيانات الأوردر كاملة
// وقت الضغط على "تم التجهيز" (محتاجينها كاملة عشان نحفظ نسخة في سجل التقارير)
let ordersCache = [];

// جلب وعرض البيانات سحابياً
// ممكن تتنادى بأوردرات جاهزة من الـ listener اللحظي، أو من غير باراميتر لعمل جلب لمرة واحدة (استخدام احتياطي)
async function renderBoard(ordersParam) {
    const orders = ordersParam || await getOrders();
    ordersCache = orders;

    const incoming = orders.filter(o => o.status === 'incoming');
    const preparing = orders.filter(o => o.status === 'preparing');
    const done = orders.filter(o => o.status === 'done');

    document.getElementById('count-incoming').textContent = incoming.length;
    document.getElementById('count-preparing').textContent = preparing.length;
    document.getElementById('count-done').textContent = done.length;

    document.getElementById('list-incoming').innerHTML = incoming.length
        ? incoming.map(o => renderOrderCard(o, 'incoming')).join('')
        : emptyColumnMsg('لا يوجد طلبات واردة حالياً');

    document.getElementById('list-preparing').innerHTML = preparing.length
        ? preparing.map(o => renderOrderCard(o, 'preparing')).join('')
        : emptyColumnMsg('لا يوجد طلبات قيد التجهيز');

    document.getElementById('list-done').innerHTML = done.length
        ? done.map(o => renderOrderCard(o, 'done')).join('')
        : emptyColumnMsg('لا يوجد طلبات مجهزة بعد');
}

function emptyColumnMsg(text) {
    return `<p class="empty-column-msg">${text}</p>`;
}

/* ============================================================
   عمود "التقرير اليومي" - بيعرض بس أوردرات النهاردة (اللي اتحطت
   "تم التجهيز" في نفس تاريخ اليوم الحالي). بيتصفر لوحده تلقائياً
   بكرة الصبح من غير أي حذف يدوي، لأن الفلترة على تاريخ اليوم الحالي.
   ============================================================ */
// آخر نسخة وصلت من سجل التقارير كاملة - مستخدمة عشان زرار "عرض" في عمود
// التقرير اليومي يقدر يجيب بيانات الأوردر منها (بعد ما يتنقل، مبيبقاش موجود في orders)
let dailyReportsCache = {};

function renderDailyColumn(reportsParam) {
    // لو اتنادت من غير أي بيانات جديدة (زي فحص منتصف الليل)، بنعيد الاستخدام
    // لآخر نسخة كانت متخزنة بدل ما نمسحها، وبس نعيد حساب فلتر تاريخ اليوم
    const reports = reportsParam !== undefined ? reportsParam : dailyReportsCache;
    dailyReportsCache = reports;
    const todayKey = getTodayDateKey();
    const todayOrders = reports[todayKey]
        ? Object.keys(reports[todayKey]).map(k => reports[todayKey][k])
        : [];

    document.getElementById('count-daily').textContent = todayOrders.length;
    document.getElementById('list-daily').innerHTML = todayOrders.length
        ? todayOrders.map(o => renderDailyReportCard(o)).join('')
        : emptyColumnMsg('لا يوجد أوردرات تم تجهيزها النهاردة بعد');
}

function renderDailyReportCard(order) {
    return `
        <div class="order-card">
            <div class="order-card-top">
                <span class="order-id">${order.id}</span>
                <span class="order-time">${formatOrderDate(order.createdAt)}</span>
            </div>
            <p class="order-customer-name"><i class="fa-solid fa-user"></i> ${order.customer.name}</p>
            <p class="order-total"><i class="fa-solid fa-sack-dollar"></i> ${order.total} ج.م</p>
            <div class="order-card-actions">
                <button class="view-btn" onclick="openDailyReportModal('${order.id}')"><i class="fa-solid fa-eye"></i> عرض</button>
            </div>
        </div>
    `;
}

function renderOrderCard(order, status) {
    let actionButtons = `<button class="view-btn" onclick="openOrderModal('${order.id}')"><i class="fa-solid fa-eye"></i> عرض</button>`;

    if (status === 'incoming') {
        actionButtons += `<button class="advance-btn" onclick="moveOrder('${order.id}', 'preparing')">تحت التجهيز <i class="fa-solid fa-arrow-left"></i></button>`;
    } else if (status === 'preparing') {
        actionButtons += `<button class="advance-btn done-btn" onclick="moveOrder('${order.id}', 'done')">تم التجهيز <i class="fa-solid fa-check"></i></button>`;
    } else if (status === 'done') {
        actionButtons += `<button class="advance-btn move-to-report-btn" onclick="moveToReport('${order.id}')">نقل للتقرير <i class="fa-solid fa-arrow-down"></i></button>`;
    }

    // تنبيه بصري بسيط لو الأوردر ده لسه محتاج تأكيد استلام دفع (تحويل إنستا باي/فودافون كاش)
    const paymentPendingBadge = order.paymentStatus === 'pending'
        ? `<p style="background:#fff4e5; color:#b8860b; font-size:12px; font-weight:bold; padding:5px 8px; border-radius:6px; margin-bottom:8px;"><i class="fa-solid fa-clock"></i> بانتظار تأكيد الدفع</p>`
        : '';

    return `
        <div class="order-card">
            <div class="order-card-top">
                <span class="order-id">${order.id}</span>
                <span class="order-time">${formatOrderDate(order.createdAt)}</span>
            </div>
            ${paymentPendingBadge}
            <p class="order-customer-name"><i class="fa-solid fa-user"></i> ${order.customer.name}</p>
            <p class="order-total"><i class="fa-solid fa-sack-dollar"></i> ${order.total} ج.م</p>
            <div class="order-card-actions">${actionButtons}</div>
            <button class="delete-order-btn" onclick="confirmDeleteOrder('${order.id}')"><i class="fa-solid fa-trash"></i> حذف الطلب</button>
        </div>
    `;
}

// كود بسيط لتأكيد حذف الطلب - غرضه منع الحذف بالغلط من موظف مستعجل،
// مش حماية أمنية حقيقية (الحماية الفعلية متغطية بتسجيل دخول الأدمن أصلاً)
const DELETE_ORDER_PIN = '2026';

function confirmDeleteOrder(orderId) {
    const enteredPin = prompt('اكتب كود حذف الطلب للتأكيد:');
    if (enteredPin === null) return; // اتضغط "إلغاء"

    if (enteredPin !== DELETE_ORDER_PIN) {
        alert('الكود غلط، لم يتم حذف الطلب.');
        return;
    }

    if (confirm('متأكد إنك عايز تحذف الطلب ده؟ الحذف نهائي ومش هيرجع تاني.')) {
        deleteOrder(orderId);
    }
}

async function deleteOrder(orderId) {
    await deleteOrderFromCloud(orderId);
    renderBoard();
}

async function moveOrder(orderId, newStatus) {
    if (newStatus === 'preparing') {
        const order = ordersCache.find(o => o.id === orderId);
        if (order && order.paymentStatus === 'pending') {
            const proceed = confirm('الطلب ده لسه دفعه متأكدش (تحويل لسه معلق). عايز تكمل من غير ما تأكد الدفع؟');
            if (!proceed) return;
        }
    }
    await updateOrderStatus(orderId, newStatus);
    renderBoard();
}

// نقل الأوردر يدويًا من عمود "الطلبات المجهزة" لعمود "التقرير اليومي":
// بنحفظ نسخة منه في سجل التقارير بتاريخ اليوم الحالي (هتظهر فوراً في عمود
// التقرير اليومي هنا وكمان في صفحة الأسعار)، وبعدها بنمسحه من عمود
// "الطلبات المجهزة" عشان يختفي من هناك وينزل تحت.
async function moveToReport(orderId) {
    const order = ordersCache.find(o => o.id === orderId);
    if (!order) return;

    await saveDailyReport({ ...order, status: 'done' });
    await deleteOrderFromCloud(orderId);
    renderBoard();
}

async function openOrderModal(orderId) {
    const orders = await getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    renderOrderModalContent(order);
}

// نسخة تانية بتفتح المودال لأوردر جاي من عمود "التقرير اليومي" (مش موجود في orders
// أصلاً بعد ما اتنقل، فبنجيب بياناته من آخر نسخة وصلت من سجل التقارير بدل ما نبحث في orders)
function openDailyReportModal(orderId) {
    const todayKey = getTodayDateKey();
    const order = dailyReportsCache[todayKey] ? dailyReportsCache[todayKey][orderId] : null;
    if (!order) return;
    renderOrderModalContent(order);
}

function renderOrderModalContent(order) {
    const itemsHTML = order.items.map(item => `
        <div class="modal-item-row">
            <img src="${item.image}" alt="${item.name}">
            <div class="modal-item-info">
                <p>${item.name}</p>
                <span>${item.price} ج.م × ${item.quantity} = ${item.price * item.quantity} ج.م</span>
            </div>
        </div>
    `).join('');

    // قسم بيانات الدفع: بيظهر بس للأوردرات اللي طريقة دفعها "تحويل"
    let paymentSectionHTML = '';
    if (order.paymentMethod === 'transfer') {
        const proofImageHTML = order.paymentProofImage
            ? `<a href="${order.paymentProofImage}" target="_blank"><img src="${order.paymentProofImage}" alt="إثبات التحويل" style="max-width:220px; border-radius:8px; border:1px solid #ddd; display:block; margin:10px 0;"></a>`
            : `<p style="color:#d81b1b; font-size:13px;">⚠️ العميل ماحملش صورة إثبات التحويل</p>`;

        const confirmButtonHTML = order.paymentStatus === 'pending'
            ? `<button class="whatsapp-contact-btn" style="background:#0d3b1e;" onclick="confirmPayment('${order.id}')"><i class="fa-solid fa-check"></i> تأكيد استلام الدفع</button>`
            : `<p style="color:#0d3b1e; font-weight:bold; font-size:13px;"><i class="fa-solid fa-circle-check"></i> تم تأكيد الدفع</p>`;

        paymentSectionHTML = `
            <div class="modal-section">
                <h3><i class="fa-solid fa-credit-card"></i> بيانات الدفع (تحويل)</h3>
                ${proofImageHTML}
                ${confirmButtonHTML}
            </div>
        `;
    }

    document.getElementById('order-modal-content').innerHTML = `
        <h2>تفاصيل الطلب ${order.id}</h2>
        <p class="modal-order-date">${formatOrderDate(order.createdAt)}</p>

        <div class="modal-section">
            <h3><i class="fa-solid fa-user"></i> بيانات العميل</h3>
            <p><strong>الاسم:</strong> ${order.customer.name}</p>
            <p><strong>الهاتف:</strong> ${order.customer.phone}</p>
            ${order.customer.phone2 ? `<p><strong>هاتف تاني:</strong> ${order.customer.phone2}</p>` : ''}
            <p><strong>المحافظة:</strong> ${order.customer.governorate || '-'}</p>
            <p><strong>العنوان:</strong> ${order.customer.address}</p>
            <button class="whatsapp-contact-btn" onclick="openWhatsAppChat('${order.customer.phone}', 'أهلاً ${order.customer.name}، بخصوص طلبك رقم ${order.id} من كارميل مصر...')">
                <i class="fab fa-whatsapp"></i> تواصل مع العميل
            </button>
        </div>

        ${paymentSectionHTML}

        <div class="modal-section">
            <h3><i class="fa-solid fa-bag-shopping"></i> المنتجات</h3>
            ${itemsHTML}
        </div>

        <div class="modal-total-row">
            <span>الإجمالي</span>
            <span>${order.total} ج.م</span>
        </div>
        ${order.shippingCost ? `<p style="text-align:left; font-size:12px; color:#999; margin-top:4px;">شامل رسوم شحن: ${order.shippingCost} ج.م</p>` : ''}
    `;

    document.getElementById('order-modal-overlay').classList.add('active');
}

// تأكيد استلام الدفع لأوردر تحويل - بيحدث الحالة سحابياً، وبيعيد رسم المودال فوراً بدون إغلاقه
async function confirmPayment(orderId) {
    await updatePaymentStatus(orderId, 'verified');

    // تحديث النسخة المحلية عشان المودال يتحدث فوراً من غير ما نستنى الـ listener اللحظي
    const cachedOrder = ordersCache.find(o => o.id === orderId);
    if (cachedOrder) {
        cachedOrder.paymentStatus = 'verified';
        renderOrderModalContent(cachedOrder);
    }
}

function closeOrderModal() {
    document.getElementById('order-modal-overlay').classList.remove('active');
}

/* ملحوظة: تم حذف زرار وتم "تحديث" اليدوي - اللوحة بقت تستمع لحظياً
   لأي أوردر جديد أو تعديل حالة، فمحتاجاش تحديث يدوي خالص */

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
});