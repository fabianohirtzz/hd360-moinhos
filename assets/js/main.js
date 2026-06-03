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
          // Revela assim que o elemento entra na viewport. Não exigimos uma
          // fração mínima do elemento, senão blocos mais altos que a tela
          // (ex.: o corpo de um artigo longo) nunca alcançariam o limiar.
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
            if (e.target.hasAttribute("data-count")) countUp(e.target);
            e.target.querySelectorAll?.("[data-count]").forEach(countUp);
          }
        }
      }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
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

  /* ---------- Reels do Instagram (coverflow 3D) ---------- */
  const reelsStage = document.querySelector("[data-reels-stage]");
  if (reelsStage) {
    const captionEl = document.querySelector("[data-reels-caption]");
    const slides = [...reelsStage.querySelectorAll(".reel")].map((reel) => ({
      reel,
      media: reel.querySelector(".reel__media"),
      video: reel.querySelector("[data-reel]"),
      cap: (reel.querySelector(".reel__cap")?.textContent || "").trim(),
      playBtn: reel.querySelector("[data-reel-play]"),
      toggle: reel.querySelector("[data-reel-toggle]"),
      mute: reel.querySelector("[data-reel-mute]"),
    }));
    const total = slides.length;
    const half = Math.floor(total / 2);
    let index = half;       // começa no card central (igual ao componente)
    let current = null;     // vídeo tocando (um por vez)
    let autoTimer = null;
    let paused = false;     // pausa o giro automático (hover/foco/assistindo)

    // posiciona cada card: central nítido, laterais girados + desfoque gaussiano
    const render = () => {
      slides.forEach((s, i) => {
        let pos = (i - index + total) % total;
        if (pos > half) pos -= total;
        const isCenter = pos === 0;
        const isAdjacent = Math.abs(pos) === 1;
        const visible = Math.abs(pos) <= 1;
        s.reel.style.transform =
          "translate(-50%, -50%) translateX(" + pos * 45 + "%) " +
          "scale(" + (isCenter ? 1 : isAdjacent ? 0.85 : 0.7) + ") " +
          "rotateY(" + pos * -10 + "deg)";
        s.reel.style.zIndex = isCenter ? 10 : isAdjacent ? 5 : 1;
        s.reel.style.opacity = isCenter ? 1 : isAdjacent ? 0.4 : 0;
        s.reel.style.filter = isCenter ? "blur(0px)" : "blur(6px)";
        s.reel.style.visibility = visible ? "visible" : "hidden";
        s.reel.classList.toggle("is-center", isCenter);
        s.reel.classList.toggle("is-side", !isCenter && visible);
        s.reel.setAttribute("aria-hidden", isCenter ? "false" : "true");
        // botões fora do centro não recebem foco (não focável dentro de aria-hidden)
        [s.playBtn, s.toggle, s.mute].forEach((b) => { if (b) b.tabIndex = isCenter ? 0 : -1; });
      });
      if (captionEl) captionEl.textContent = slides[index].cap;
    };

    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
    const startAuto = () => {
      stopAuto();
      if (calm()) return; // sem giro automático em modo calmo / reduced-motion (público TEA)
      autoTimer = setInterval(() => { if (!paused && !current) go(1); }, 6000);
    };

    const goTo = (i) => {
      if (current) { current.pause(); current = null; } // troca de card encerra o vídeo
      index = (i + total) % total;
      render();
    };
    const go = (dir) => goTo(index + dir);

    const playCenter = () => {
      const s = slides[index];
      if (!s.video) return;
      if (current && current !== s.video) current.pause();
      current = s.video;
      s.video.muted = false; // ao dar play, habilita o som
      s.mute?.classList.remove("is-muted");
      s.mute?.setAttribute("aria-label", "Desativar som");
      const p = s.video.play();
      if (p && p.catch) p.catch(() => {});
      stopAuto(); // enquanto assiste, não gira sozinho
    };

    slides.forEach((s, i) => {
      const togglePlay = () => { if (s.video.paused) playCenter(); else s.video.pause(); };
      s.playBtn?.addEventListener("click", (e) => { e.stopPropagation(); togglePlay(); });
      s.toggle?.addEventListener("click", (e) => { e.stopPropagation(); togglePlay(); });
      s.mute?.addEventListener("click", (e) => {
        e.stopPropagation();
        s.video.muted = !s.video.muted;
        s.mute.classList.toggle("is-muted", s.video.muted);
        s.mute.setAttribute("aria-label", s.video.muted ? "Ativar som" : "Desativar som");
      });
      s.video?.addEventListener("play", () => s.media.classList.add("is-playing"));
      s.video?.addEventListener("pause", () => {
        s.media.classList.remove("is-playing");
        if (current === s.video) { current = null; startAuto(); } // ao pausar, retoma o giro
      });
      // clicar num card lateral traz ele ao centro
      s.reel.addEventListener("click", () => { if (i !== index) go(i - index); });
    });

    document.querySelector("[data-reels-prev]")?.addEventListener("click", () => go(-1));
    document.querySelector("[data-reels-next]")?.addEventListener("click", () => go(1));

    // pausa o giro com o ponteiro/foco em cima
    const hold = () => { paused = true; };
    const release = () => { paused = false; };
    reelsStage.addEventListener("pointerenter", hold);
    reelsStage.addEventListener("pointerleave", release);
    reelsStage.addEventListener("focusin", hold);
    reelsStage.addEventListener("focusout", release);

    render();
    startAuto();
    window.addEventListener("resize", render);
  }

  /* ---------- Filtro de especialidades (Atendimento) ---------- */
  const filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    const cards = document.querySelectorAll("[data-cat]");
    filterBar.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.filter;
        filterBar.querySelectorAll("[data-filter]").forEach((b) =>
          b.classList.toggle("is-active", b === btn));
        cards.forEach((c) => {
          const show = cat === "todos" || (c.dataset.cat || "").split(" ").includes(cat);
          c.hidden = !show;
        });
      });
    });
  }

  /* ---------- Switcher de unidades (Unidades) ---------- */
  const unitTabs = document.querySelector("[data-unit-tabs]");
  if (unitTabs) {
    const panels = document.querySelectorAll("[data-unit]");
    unitTabs.querySelectorAll("[data-unit-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.unitGo;
        unitTabs.querySelectorAll("[data-unit-go]").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach((p) => { p.hidden = p.dataset.unit !== id; });
      });
    });
  }

  /* ---------- Galeria de fotos + lightbox ---------- */
  const galleries = document.querySelectorAll("[data-gallery]");
  if (galleries.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Galeria de fotos");
    lb.innerHTML =
      '<img class="lightbox__img" alt="" />' +
      '<button class="lightbox__btn lightbox__close" data-lb-close aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lightbox__btn lightbox__prev" data-lb-prev aria-label="Foto anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<button class="lightbox__btn lightbox__next" data-lb-next aria-label="Próxima foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
      '<span class="lightbox__count" data-lb-count></span>';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector(".lightbox__img");
    const lbCount = lb.querySelector("[data-lb-count]");
    let items = [], idx = 0, lastFocus = null;

    const render = () => {
      const it = items[idx];
      lbImg.src = it.src; lbImg.alt = it.alt || "";
      lbCount.textContent = (idx + 1) + " / " + items.length;
    };
    const openLb = (list, i) => {
      items = list; idx = i; lastFocus = document.activeElement;
      render(); lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lb.querySelector("[data-lb-close]").focus();
    };
    const closeLb = () => {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      lastFocus && lastFocus.focus && lastFocus.focus();
    };
    const go = (d) => { idx = (idx + d + items.length) % items.length; render(); };

    galleries.forEach((g) => {
      const triggers = Array.from(g.querySelectorAll("[data-gallery-item]"));
      const list = triggers.map((t) => {
        const img = t.querySelector("img");
        return { src: t.dataset.full || (img && img.src) || "", alt: img ? img.alt : "" };
      });

      // Carrossel em leque (modelo designali): 5 fotos visíveis, as duas laterais
      // recortadas pela borda; setas avançam; o cartão central abre o lightbox.
      const stack = g.classList.contains("gallery--stack");
      if (stack) {
        const glows = ["rgba(0,165,234,.55)", "rgba(255,199,0,.55)", "rgba(251,60,99,.5)", "rgba(143,100,200,.55)", "rgba(168,196,32,.55)"];
        const N = triggers.length;
        const half = Math.floor(N / 2);
        let cur = Math.min(2, half);   // foto central inicial (mostra as 5 primeiras)
        triggers.forEach((t, i) => t.style.setProperty("--glow", glows[i % glows.length]));

        const layout = () => {
          const W = g.clientWidth || 1;
          const cw = parseFloat(getComputedStyle(triggers[0]).width) || 220;
          const X2 = Math.max(cw * 0.62, W / 2 - cw * 0.30);  // laterais recortadas pela borda
          const X1 = X2 * 0.54;
          triggers.forEach((t, i) => {
            let pos = ((i - cur) % N + N) % N;
            if (pos > half) pos -= N;
            const a = Math.abs(pos);
            const x = pos === 0 ? 0 : a === 1 ? (pos < 0 ? -X1 : X1) : (pos < 0 ? -X2 : X2);
            const y = a === 0 ? 0 : a === 1 ? 8 : 18;
            const sc = a === 0 ? 1 : a === 1 ? 0.9 : 0.82;
            t.style.setProperty("--x", x.toFixed(1) + "px");
            t.style.setProperty("--y", y + "px");
            t.style.setProperty("--rot", (pos * -1.5) + "deg");
            t.style.setProperty("--sc", sc.toFixed(3));
            t.style.setProperty("--z", String(a === 0 ? 30 : a === 1 ? 20 : 10));
            t.classList.toggle("is-shown", a <= 2);
            t.classList.toggle("is-center", pos === 0);
            t.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
            t.tabIndex = pos === 0 ? 0 : -1;
          });
        };
        const move = (d) => { cur = (cur + d + N) % N; layout(); };
        layout();
        // ResizeObserver recalcula quando a galeria ganha largura (troca de unidade / resize)
        if ("ResizeObserver" in window) new ResizeObserver(layout).observe(g);
        else window.addEventListener("resize", layout);

        const nav = g.nextElementSibling && g.nextElementSibling.classList.contains("gallery__nav") ? g.nextElementSibling : null;
        nav?.querySelector("[data-gallery-prev]")?.addEventListener("click", () => move(-1));
        nav?.querySelector("[data-gallery-next]")?.addEventListener("click", () => move(1));

        // centro abre o lightbox; clicar numa lateral visível a traz para o centro
        triggers.forEach((t, i) => t.addEventListener("click", () => {
          if (t.classList.contains("is-center")) { openLb(list, i); return; }
          if (!t.classList.contains("is-shown")) return;
          let pos = ((i - cur) % N + N) % N;
          if (pos > half) pos -= N;
          move(pos);
        }));
      } else {
        triggers.forEach((t, i) => t.addEventListener("click", () => openLb(list, i)));
      }
    });

    lb.querySelector("[data-lb-close]").addEventListener("click", closeLb);
    lb.querySelector("[data-lb-prev]").addEventListener("click", () => go(-1));
    lb.querySelector("[data-lb-next]").addEventListener("click", () => go(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    });
  }

  /* ---------- Formulários (ouvidoria, newsletter) — sucesso local ---------- */
  document.querySelectorAll("[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.classList.add("is-sent");
      const ok = form.querySelector("[data-form-success]");
      if (ok) {
        ok.setAttribute("tabindex", "-1");
        try { ok.focus({ preventScroll: true }); } catch (_) {}
        ok.scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "center" });
      }
    });
  });

  /* ---------- FAQ: abre um por vez dentro do mesmo grupo ---------- */
  document.querySelectorAll("[data-accordion]").forEach((group) => {
    const items = group.querySelectorAll("details");
    items.forEach((d) => d.addEventListener("toggle", () => {
      if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
    }));
  });

  /* ---------- Peças de quebra-cabeça decorativas (float + parallax) ---------- */
  const puzzleFields = document.querySelectorAll(".hero__bg, .page-hero__bg, [data-puzzles]");
  if (puzzleFields.length) {
    const cols = ["var(--azul)", "var(--amarelo)", "var(--rosa)", "var(--lilas)", "var(--verde)"];
    // posições perto das bordas (longe do texto central), tamanhos/cores/giros variados
    const presets = [
      { t: "12%", l: "5%",  s: 46, c: 0, o: .14, pf: 8,   px: .12, r0: -8,  r1: 6 },
      { t: "20%", l: "90%", s: 34, c: 2, o: .12, pf: 9,   px: .18, r0: 6,   r1: -8 },
      { t: "72%", l: "9%",  s: 30, c: 3, o: .12, pf: 7,   px: .22, r0: -4,  r1: 10 },
      { t: "78%", l: "84%", s: 52, c: 4, o: .11, pf: 10,  px: .10, r0: 8,   r1: -6 },
      { t: "44%", l: "48%", s: 26, c: 1, o: .10, pf: 8.5, px: .16, r0: -10, r1: 8 },
    ];
    puzzleFields.forEach((field, fi) => {
      const n = field.hasAttribute("data-puzzles") ? (parseInt(field.dataset.puzzles, 10) || 4) : 4;
      for (let k = 0; k < n; k++) {
        const p = presets[(k + fi) % presets.length];
        const bit = document.createElement("span");
        bit.className = "puzzles__bit";
        bit.setAttribute("aria-hidden", "true");
        bit.dataset.px = p.px;
        bit.style.cssText =
          "top:" + p.t + ";left:" + p.l + ";--s:" + p.s + "px;--pc:" + cols[(p.c + fi) % cols.length] +
          ";--po:" + p.o + ";--pf:" + p.pf + "s;--r0:" + p.r0 + "deg;--r1:" + p.r1 + "deg";
        bit.innerHTML = '<span><svg viewBox="0 0 24 24"><use href="#ic-puzzle"/></svg></span>';
        field.appendChild(bit);
      }
    });

    // parallax leve no scroll (desligado em modo calmo / reduced-motion)
    const bits = Array.from(document.querySelectorAll(".puzzles__bit"));
    if (bits.length && !calm()) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const vh = window.innerHeight || 1;
        bits.forEach((b) => {
          const f = b.parentElement;
          if (!f) return;
          const center = f.getBoundingClientRect().top + b.offsetTop + b.offsetHeight / 2;
          const rel = (center - vh / 2) / vh;            // -1..1 ao redor do centro da tela
          const sp = parseFloat(b.dataset.px) || .12;
          b.style.transform = "translateY(" + (rel * sp * -120).toFixed(1) + "px)";
        });
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    }
  }

  /* ---------- Ano dinâmico no rodapé ---------- */
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();


/* ===== Blog: filtro por categoria (com pre-filtro por URL) ===== */
(function () {
  const filters = document.querySelector('[data-blog-filters]');
  const grid = document.querySelector('[data-blog-grid]');
  if (!filters || !grid) return;

  function apply(cat) {
    filters.querySelectorAll('[data-filter]').forEach(b =>
      b.classList.toggle('is-active', b.getAttribute('data-filter') === cat));
    grid.querySelectorAll('.post').forEach(card => {
      const match = cat === 'all' || card.getAttribute('data-category') === cat;
      card.hidden = !match;
    });
  }

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (btn) apply(btn.getAttribute('data-filter'));
  });

  // Pre-filtro por ?cat=
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat');
  const known = [...filters.querySelectorAll('[data-filter]')].map(b => b.getAttribute('data-filter'));
  apply(cat && known.includes(cat) ? cat : 'all');
})();

/* ===== Blog: carrossel showcase ===== */
(function () {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const track = root.querySelector('[data-carousel-track]');
  const viewport = root.querySelector('[data-carousel-viewport]');
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const dotsWrap = document.querySelector('[data-carousel-dots]');
  const slides = [...track.children];
  if (!slides.length) return;

  let index = 0;

  function perView() {
    if (window.matchMedia('(max-width: 640px)').matches) return 1;
    if (window.matchMedia('(max-width: 980px)').matches) return 2;
    return 3;
  }
  function maxIndex() { return Math.max(0, slides.length - perView()); }

  function go(i) {
    index = Math.min(Math.max(0, i), maxIndex());
    const slideW = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap || '24') || 24;
    track.style.transform = 'translateX(-' + (index * (slideW + gap)) + 'px)';
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index >= maxIndex();
    if (dotsWrap) dotsWrap.querySelectorAll('button').forEach((d, di) =>
      d.classList.toggle('is-active', di === index));
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ir para o grupo ' + (i + 1));
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    }
  }

  if (prev) prev.addEventListener('click', () => go(index - 1));
  if (next) next.addEventListener('click', () => go(index + 1));

  // Swipe / drag
  let startX = 0, dragging = false;
  viewport.addEventListener('pointerdown', (e) => { dragging = true; startX = e.clientX; });
  window.addEventListener('pointerup', (e) => {
    if (!dragging) return; dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildDots(); go(index); }, 150); });

  buildDots();
  go(0);
})();
