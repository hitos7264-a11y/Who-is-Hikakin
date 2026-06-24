/* =====================================================================
   main.js - 共通：ナビ開閉、現在ページマーク、IntersectionObserver
   ===================================================================== */
(function() {
  // ナビ：現在ページのリンクをアクティブに
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });

  // モバイルナビ開閉
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  // フェードイン on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
  document.querySelectorAll(".timeline-item").forEach(el => io.observe(el));
})();
