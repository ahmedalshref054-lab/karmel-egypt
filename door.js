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

  // المرحلة 1: عند تحميل/إعادة تحميل أي صفحة -> الباب يتفتح بعد لحظة
  window.addEventListener("load", () => {
    setTimeout(openDoor, 700);
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

  ["goToCategory", "goToDirectProduct"].forEach(wrapNavigationFunction);
});

