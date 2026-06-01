/* =====================================================================
   HD360 Moinhos — main.js
   Comportamento: drawer, reveal, count-up, toggle de calma, cookies, nav.
   Tudo respeita prefers-reduced-motion / .calm (público TEA).
   ===================================================================== */
(function () {
  "use strict";

  const root = document.documentElement;
  const calm = () =>
    root.classList.contains("calm") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toggle "Reduzir animações" (persistente) ---------- */
  const CALM_KEY = "hd360-calm";
  if (localStorage.getItem(CALM_KEY) === "1") root.classList.add("calm");
  if (/[?&]calm=1/.test(location.search)) root.classList.add("calm");
  const calmBtn = document.querySelector("[data-calm-toggle]");
  if (calmBtn) {
    const sync = () => calmBtn.setAttribute("aria-pressed", root.classList.contains("calm") ? "true" : "false");
    sync();
    calmBtn.addEventListener("click", () => {
      const on = root.classList.toggle("calm");
      localStorage.setItem(CALM_KEY, on ? "1" : "0");
      sync();
    });
  }

  /* ---------- Nav: estado "scrolled" ---------- */
  const nav = document.querySelector("[data-nav]");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Drawer mobile ---------- */
  const burger = document.querySelector("[data-burger]");
  const drawer = document.querySelector("[data-drawer]");
  const backdrop = document.querySelector("[data-drawer-backdrop]");

  function trapFocus(container) {
    const f = container.querySelectorAll('a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return () => {};
    const first = f[0], last = f[f.length - 1];
    const onKey = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    container.addEventListener("keydown", onKey);
    return () => container.removeEventListener("keydown", onKey);
  }

  if (burger && drawer && backdrop) {
    let release = () => {};
    const open = () => {
      drawer.classList.add("is-open"); backdrop.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      release = trapFocus(drawer);
      drawer.querySelector("a,button")?.focus();
    };
    const close = () => {
      drawer.classList.remove("is-open"); backdrop.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      release(); burger.focus();
    };
    burger.addEventListener("click", () =>
      burger.getAttribute("aria-expanded") === "true" ? close() : open());
    backdrop.addEventListener("click", close);
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    drawer.querySelector("[data-drawer-close]")?.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
  }

  /* ---------- Reveal on scroll (+ stagger via --i) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (calm() || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.intersectionRatio > 0.12) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
            if (e.target.hasAttribute("data-count")) countUp(e.target);
            e.target.querySelectorAll?.("[data-count]").forEach(countUp);
          }
        }
      }, { threshold: [0, 0.12] });
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Count-up ---------- */
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const prefix = (el.textContent.trim().match(/^[+~]/) || [""])[0];
    if (calm()) { el.textContent = prefix + target; return; }
    const dur = 1200, t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  // count-up para stats fora de .reveal
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (!el.closest(".reveal") && "IntersectionObserver" in window && !calm()) {
      const io2 = new IntersectionObserver((ents) => {
        ents.forEach((en) => { if (en.isIntersecting) { countUp(en.target); io2.unobserve(en.target); } });
      }, { threshold: 0.4 });
      io2.observe(el);
    } else if (calm()) { countUp(el); }
  });

  /* ---------- Banner de cookies ---------- */
  const COOKIE_KEY = "hd360-cookies";
  const cookies = document.querySelector("[data-cookies]");
  if (cookies && !localStorage.getItem(COOKIE_KEY)) {
    setTimeout(() => cookies.classList.add("is-in"), 900);
    cookies.querySelectorAll("[data-cookie-accept]").forEach((b) =>
      b.addEventListener("click", () => {
        localStorage.setItem(COOKIE_KEY, b.dataset.cookieAccept || "all");
        cookies.classList.remove("is-in");
      })
    );
  }

  /* ---------- Vídeo do hero (autoplay calmo + controles) ---------- */
  const video = document.querySelector("[data-hero-video]");
  const playBtn = document.querySelector("[data-video-play]");
  const muteBtn = document.querySelector("[data-video-mute]");
  if (video) {
    // Autoplay só quando não estamos em modo calmo / movimento reduzido
    const tryAutoplay = () => {
      if (calm()) return;
      const p = video.play();
      if (p && p.catch) p.catch(() => {}); // ignora bloqueio de autoplay
    };
    if (video.readyState >= 2) tryAutoplay();
    else video.addEventListener("loadeddata", tryAutoplay, { once: true });

    const syncPlay = () => {
      if (!playBtn) return;
      const playing = !video.paused && !video.ended;
      playBtn.classList.toggle("is-playing", playing);
      playBtn.setAttribute("aria-label", playing ? "Pausar vídeo" : "Reproduzir vídeo");
    };
    video.addEventListener("play", syncPlay);
    video.addEventListener("pause", syncPlay);
    syncPlay();

    if (playBtn) playBtn.addEventListener("click", () => {
      if (video.paused) video.play(); else video.pause();
    });
    if (muteBtn) muteBtn.addEventListener("click", () => {
      video.muted = !video.muted;
      muteBtn.classList.toggle("is-muted", video.muted);
      muteBtn.setAttribute("aria-label", video.muted ? "Ativar som" : "Desativar som");
    });
  }

  /* ---------- Reels do Instagram (carrossel) ---------- */
  const reelsTrack = document.querySelector("[data-reels-track]");
  if (reelsTrack) {
    let current = null; // vídeo tocando no momento (um por vez)
    reelsTrack.querySelectorAll(".reel").forEach((reel) => {
      const media = reel.querySelector(".reel__media");
      const video = reel.querySelector("[data-reel]");
      const playBtn = reel.querySelector("[data-reel-play]");
      const toggle = reel.querySelector("[data-reel-toggle]");
      const mute = reel.querySelector("[data-reel-mute]");

      const play = () => {
        if (current && current !== video) current.pause();
        current = video;
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      };
      const togglePlay = () => { if (video.paused) play(); else video.pause(); };

      playBtn?.addEventListener("click", togglePlay);
      toggle?.addEventListener("click", togglePlay);
      video.addEventListener("play", () => media.classList.add("is-playing"));
      video.addEventListener("pause", () => media.classList.remove("is-playing"));
      video.addEventListener("ended", () => media.classList.remove("is-playing"));
      mute?.addEventListener("click", () => {
        video.muted = !video.muted;
        mute.classList.toggle("is-muted", video.muted);
        mute.setAttribute("aria-label", video.muted ? "Ativar som" : "Desativar som");
      });
    });

    // setas prev/next + estado desabilitado nas pontas
    const prev = document.querySelector("[data-reels-prev]");
    const next = document.querySelector("[data-reels-next]");
    const updateArrows = () => {
      const max = reelsTrack.scrollWidth - reelsTrack.clientWidth - 2;
      if (prev) prev.disabled = reelsTrack.scrollLeft <= 2;
      if (next) next.disabled = reelsTrack.scrollLeft >= max;
    };
    const amount = () => reelsTrack.clientWidth * 0.85;
    prev?.addEventListener("click", () => reelsTrack.scrollBy({ left: -amount(), behavior: calm() ? "auto" : "smooth" }));
    next?.addEventListener("click", () => reelsTrack.scrollBy({ left: amount(), behavior: calm() ? "auto" : "smooth" }));
    reelsTrack.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();
  }

  /* ---------- Ano dinâmico no rodapé ---------- */
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
