// ===== باب الدخول (Intro Door) =====

document.addEventListener("DOMContentLoaded", () => {
  const doorWrap = document.getElementById("door-wrap");
  if (!doorWrap) return;

  function openDoor() {
    doorWrap.classList.add("door-open");
    setTimeout(() => {
      doorWrap.classList.remove("door-active");
    }, 800);
  }

  function closeDoor() {
    doorWrap.classList.add("door-active");
    doorWrap.classList.remove("door-open");
  }

  // تصفير حالة الباب فورًا (من غير أنيميشن) - مستخدمة لما الصفحة ترجع من ذاكرة المتصفح (bfcache)
  function forceOpenDoorInstantly() {
    doorWrap.classList.add("door-no-anim");
    doorWrap.classList.remove("door-active");
    doorWrap.classList.add("door-open");
    // إجبار المتصفح يطبق حالة "من غير أنيميشن" قبل ما نشيلها في الفريم اللي بعده
    void doorWrap.offsetWidth;
    requestAnimationFrame(() => {
      doorWrap.classList.remove("door-no-anim");
    });
  }

  // المرحلة 1: عند تحميل/إعادة تحميل أي صفحة -> الباب يتفتح بعد لحظة
  // استخدمنا "pageshow" بدل "load" لأن "load" مبيشتغلش تاني لما المتصفح يرجّع
  // الصفحة من الذاكرة (bfcache) عن طريق زرار الرجوع، وده كان بيخلي الباب يفضل مقفول للأبد
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      // الصفحة راجعة من الكاش -> افتح الباب فورًا من غير ما تستنى وبدون أنيميشن
      forceOpenDoorInstantly();
    } else {
      setTimeout(openDoor, 700);
    }
  });

  // المرحلة 2: عند الضغط على أي لينك حقيقي (href) داخل الموقع -> الباب يتقفل قبل الانتقال
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (
      link &&
      link.href &&
      !link.target &&
      link.origin === window.location.origin &&
      !link.href.includes("#")
    ) {
      e.preventDefault();
      closeDoor();
      setTimeout(() => {
        window.location.href = link.href;
      }, 800);
    }
  });

  // المرحلة 3: تغليف أي دالة تنقل بتتنفذ عن طريق onclick (زي دخول قسم أو فتح تفاصيل منتج)
  // بحيث الباب يتقفل الأول قبل ما التنقل يحصل، حتى لو الرابط مش <a href="...">
  function wrapNavigationFunction(fnName) {
    const originalFn = window[fnName];
    if (typeof originalFn !== "function") return;

    window[fnName] = function (...args) {
      closeDoor();
      setTimeout(() => {
        originalFn.apply(this, args);
      }, 800);
    };
  }

  ["goToCategory", "goToDirectProduct", "goToProductDetails"].forEach(wrapNavigationFunction);
});

