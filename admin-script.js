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
    await adminSignOut();
    // watchAdminAuthState هتتكفل بإخفاء لوحة التحكم وإظهار شاشة الدخول تلقائياً
}

function showAdminApp() {
    document.getElementById('admin-lock-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'block';

    // أي أوردر جديد أو تعديل حالة بعد كده هيوصل ويترسم لوحده تلقائياً بدون أي تحديث يدوي
    onLiveOrdersUpdate((orders) => renderBoard(orders));

    // أول عرض للوحة، بمجرد ما توصل أول نسخة من الأوردرات
    startLiveOrdersListener().then((orders) => {
        if (orders) renderBoard(orders);
    });
}

function formatOrderDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('ar-EG') + ' - ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

// جلب وعرض البيانات سحابياً
// ممكن تتنادى بأوردرات جاهزة من الـ listener اللحظي، أو من غير باراميتر لعمل جلب لمرة واحدة (استخدام احتياطي)
async function renderBoard(ordersParam) {
    const orders = ordersParam || await getOrders();

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

function renderOrderCard(order, status) {
    let actionButtons = `<button class="view-btn" onclick="openOrderModal('${order.id}')"><i class="fa-solid fa-eye"></i> عرض</button>`;

    if (status === 'incoming') {
        actionButtons += `<button class="advance-btn" onclick="moveOrder('${order.id}', 'preparing')">تحت التجهيز <i class="fa-solid fa-arrow-left"></i></button>`;
    } else if (status === 'preparing') {
        actionButtons += `<button class="advance-btn done-btn" onclick="moveOrder('${order.id}', 'done')">تم التجهيز <i class="fa-solid fa-check"></i></button>`;
    }

    return `
        <div class="order-card">
            <div class="order-card-top">
                <span class="order-id">${order.id}</span>
                <span class="order-time">${formatOrderDate(order.createdAt)}</span>
            </div>
            <p class="order-customer-name"><i class="fa-solid fa-user"></i> ${order.customer.name}</p>
            <p class="order-total"><i class="fa-solid fa-sack-dollar"></i> ${order.total} ج.م</p>
            <div class="order-card-actions">${actionButtons}</div>
            <button class="delete-order-btn" onclick="confirmDeleteOrder('${order.id}')"><i class="fa-solid fa-trash"></i> حذف الطلب</button>
        </div>
    `;
}

function confirmDeleteOrder(orderId) {
    if (confirm('متأكد إنك عايز تحذف الطلب ده؟ الحذف نهائي ومش هيرجع تاني.')) {
        deleteOrder(orderId);
    }
}

async function deleteOrder(orderId) {
    await deleteOrderFromCloud(orderId);
    renderBoard();
}

async function moveOrder(orderId, newStatus) {
    await updateOrderStatus(orderId, newStatus);
    renderBoard();
}

async function openOrderModal(orderId) {
    const orders = await getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const itemsHTML = order.items.map(item => `
        <div class="modal-item-row">
            <img src="${item.image}" alt="${item.name}">
            <div class="modal-item-info">
                <p>${item.name}</p>
                <span>${item.price} ج.م × ${item.quantity} = ${item.price * item.quantity} ج.م</span>
            </div>
        </div>
    `).join('');

    document.getElementById('order-modal-content').innerHTML = `
        <h2>تفاصيل الطلب ${order.id}</h2>
        <p class="modal-order-date">${formatOrderDate(order.createdAt)}</p>

        <div class="modal-section">
            <h3><i class="fa-solid fa-user"></i> بيانات العميل</h3>
            <p><strong>الاسم:</strong> ${order.customer.name}</p>
            <p><strong>الهاتف:</strong> ${order.customer.phone}</p>
            <p><strong>المحافظة:</strong> ${order.customer.governorate || '-'}</p>
            <p><strong>العنوان:</strong> ${order.customer.address}</p>
            <button class="whatsapp-contact-btn" onclick="openWhatsAppChat('${order.customer.phone}', 'أهلاً ${order.customer.name}، بخصوص طلبك رقم ${order.id} من كارميل مصر...')">
                <i class="fab fa-whatsapp"></i> تواصل مع العميل
            </button>
        </div>

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

function closeOrderModal() {
    document.getElementById('order-modal-overlay').classList.remove('active');
}

/* ملحوظة: تم حذف زرار وتم "تحديث" اليدوي - اللوحة بقت تستمع لحظياً
   لأي أوردر جديد أو تعديل حالة، فمحتاجاش تحديث يدوي خالص */

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
});