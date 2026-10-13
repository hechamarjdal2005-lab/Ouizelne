/* ==========================================================================
   script.js — Coopérative Féminine Ouizelne
   --------------------------------------------------------------------------
   General interactions & rendering:
     - sticky navbar state + mobile slide-in menu
     - scroll-reveal animations (IntersectionObserver)
     - animated number counters
     - scroll-progress + parallax bits
     - render product cards / category tiles from PRODUCTS
     - shop category filter + live search
     - contact form (no backend)
     - fill current year
   ========================================================================== */

(function () {
  "use strict";

  const PRODUCTS = window.PRODUCTS || [];
  const CATEGORIES = window.CATEGORIES || {};
  const money = (n) => n.toLocaleString("fr-MA") + " DH";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* =========================================================== NAVBAR */
  function initNav() {
    const nav = document.querySelector(".nav");
    const burger = document.getElementById("burger");
    const menu = document.getElementById("mobileMenu");

    if (nav) {
      const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (burger && menu) {
      const toggle = (open) => {
        const willOpen = open === undefined ? !menu.classList.contains("open") : open;
        menu.classList.toggle("open", willOpen);
        burger.classList.toggle("open", willOpen);
        burger.setAttribute("aria-expanded", String(willOpen));
        document.body.classList.toggle("no-scroll", willOpen);
      };
      burger.addEventListener("click", () => toggle());
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
      window.addEventListener("resize", () => { if (window.innerWidth >= 900) toggle(false); });
    }

    /* mark the active link */
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav__links a, .mobile-menu a[data-nav]").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
    });
  }

  /* =========================================================== REVEAL */
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    items.forEach((el, i) => {
      /* gentle stagger for elements that didn't set their own delay */
      if (!el.style.getPropertyValue("--reveal-delay")) {
        const group = el.closest("[data-reveal-group]");
        if (group) el.style.setProperty("--reveal-delay", (i % 4) * 90 + "ms");
      }
      io.observe(el);
    });
  }

  /* =========================================================== COUNTERS */
  function initCounters() {
    const nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.decimals && parseInt(el.dataset.decimals, 10)) || 0;
      const suffix = el.dataset.suffix || "";
      const dur = 1500;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        const val = target * eased;
        el.textContent = val.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  }

  /* =========================================================== PRODUCT CARDS */
  function mediaHTML(p) {
    const gradient = `linear-gradient(150deg, ${p.colors[0]}, ${p.colors[1]})`;
    const img = p.img
      ? `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">`
      : "";
    return `<div class="card__media" style="background:${gradient}">
        <span class="icon" aria-hidden="true">${p.icon}</span>
        ${img}
      </div>`;
  }

  function cardHTML(p) {
    const cat = CATEGORIES[p.category] ? CATEGORIES[p.category].label : "";
    return `<article class="card" data-reveal="zoom" data-cat="${p.category}"
                data-name="${esc(p.name.toLowerCase())}">
        ${mediaHTML(p)}
        <span class="card__tag">${esc(cat)}</span>
        <div class="card__body">
          <h3 class="card__name">${esc(p.name)}</h3>
          <p class="card__desc">${esc(p.desc)}</p>
          <div class="card__foot">
            <span class="price">${money(p.price)}</span>
            <button class="btn btn--primary btn--sm" data-add-to-cart="${p.id}"
                    aria-label="Add ${esc(p.name)} to cart">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.2 14h9.5c.8 0 1.4-.4 1.7-1.1l3-7A1 1 0 0 0 20.5 4H6.2l-.3-1.3A1 1 0 0 0 5 2H2v2h2.2l2.4 10.5c.2.8.9 1.5 1.6 1.5z"/></svg>
              Add
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderProducts() {
    document.querySelectorAll("[data-render='products']").forEach((box) => {
      const limit = parseInt(box.dataset.limit, 10);
      const only = box.dataset.category;
      let list = PRODUCTS.slice();
      if (only) list = list.filter((p) => p.category === only);
      if (limit) list = list.slice(0, limit);
      box.innerHTML = list.map(cardHTML).join("");
    });

    /* category tiles on the home page */
    document.querySelectorAll("[data-render='categories']").forEach((box) => {
      const grads = {
        argan:       "linear-gradient(155deg, #c98a3d, #7a4f22)",
        ground:      "linear-gradient(155deg, #b99a63, #6f5836)",
        cosmetics:   "linear-gradient(155deg, #c9764f, #8a4a3a)",
        handcrafted: "linear-gradient(155deg, #8b9c6e, #3f5135)"
      };
      box.innerHTML = Object.keys(CATEGORIES).map((key) => {
        const c = CATEGORIES[key];
        const n = PRODUCTS.filter((p) => p.category === key).length;
        return `<a class="cat-tile" href="shop.html?cat=${key}" data-reveal
                   style="--cat-gradient:${grads[key] || "var(--terracotta)"}">
            <span class="cat-tile__arrow" aria-hidden="true">↗</span>
            <span class="cat-tile__icon" aria-hidden="true">${c.icon}</span>
            <span class="cat-tile__name">${esc(c.label)}</span>
            <span class="cat-tile__count">${n} products</span>
          </a>`;
      }).join("");
    });
  }

  /* =========================================================== SHOP FILTER + SEARCH */
  function initShop() {
    const grid = document.querySelector("[data-render='products'][data-shop]");
    if (!grid) return;

    const chips = document.querySelectorAll(".chip[data-filter]");
    const search = document.getElementById("shopSearch");
    const countEl = document.getElementById("shopCount");
    const params = new URLSearchParams(location.search);
    let activeCat = params.get("cat") || "all";
    let query = "";

    /* pre-select chip from ?cat= */
    if (activeCat !== "all") {
      chips.forEach((c) => c.classList.toggle("active", c.dataset.filter === activeCat));
    }

    function apply() {
      const cards = grid.querySelectorAll(".card");
      let shown = 0;
      cards.forEach((card) => {
        const okCat = activeCat === "all" || card.dataset.cat === activeCat;
        const okQuery = !query || card.dataset.name.includes(query) ||
                        card.dataset.cat.includes(query);
        const visible = okCat && okQuery;
        card.style.display = visible ? "" : "none";
        /* ensure freshly-shown cards are revealed (they may not re-trigger the observer) */
        if (visible) card.classList.add("in");
        if (visible) shown++;
      });

      let empty = grid.querySelector(".empty-state");
      if (!shown) {
        if (!empty) {
          empty = document.createElement("div");
          empty.className = "empty-state";
          empty.innerHTML = `<div class="big">🔍</div><p>No products match your search.</p>`;
          grid.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
      if (countEl) countEl.textContent = shown + (shown === 1 ? " product" : " products");
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeCat = chip.dataset.filter;
        apply();
      });
    });

    if (search) {
      let t;
      search.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => { query = search.value.trim().toLowerCase(); apply(); }, 120);
      });
    }

    apply();
  }

  /* =========================================================== CONTACT FORM */
  function initForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#cf-name");
      const note = document.getElementById("formNote");
      if (note) {
        note.textContent = `Shukran ${name && name.value ? name.value.split(" ")[0] : ""}! Your message is ready — we usually reply within a day. 🌿`;
        note.classList.add("ok");
      }
      form.reset();
    });
  }

  /* =========================================================== TICKER */
  function initTicker() {
    document.querySelectorAll(".ticker__track").forEach((track) => {
      /* duplicate content so the -50% translate loops seamlessly */
      track.innerHTML += track.innerHTML;
    });
  }

  /* =========================================================== YEAR */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* =========================================================== SMOOTH ANCHORS */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* =========================================================== BOOT */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    renderProducts();
    initTicker();
    initReveal();
    initCounters();
    initShop();
    initForm();
    initYear();
    initAnchors();
  });
})();
