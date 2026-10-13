/* ==========================================================================
   cart.js — Coopérative Féminine Ouizelne
   --------------------------------------------------------------------------
   - Cart stored in localStorage (key: ouizelne_cart) so it survives page
     changes and browser restarts.
   - Injects its own drawer markup so every page stays clean.
   - Exposes window.OuizelneCart with .add(id), .remove(id), .setQty(id, n),
     .open(), .close(), .count(), .total().
   - "Order via WhatsApp" builds a formatted message and opens wa.me.
   ========================================================================== */

(function () {
  "use strict";

  /* --- CHANGE THE WHATSAPP NUMBER HERE (international format, no + or spaces) */
  const WHATSAPP_NUMBER = "212600000000";

  const STORAGE_KEY = "ouizelne_cart";
  const currency = "DH";

  const products = window.PRODUCTS || [];
  const findProduct = (id) => products.find((p) => p.id === id);
  const money = (n) => n.toLocaleString("fr-MA") + " " + currency;

  /* ----------------------------------------------------------- state */
  let cart = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(raw)) return [];
      /* keep only lines whose product still exists */
      return raw
        .filter((line) => line && findProduct(line.id))
        .map((line) => ({ id: line.id, qty: Math.max(1, parseInt(line.qty, 10) || 1) }));
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* storage full / disabled — cart still works for this page */
    }
  }

  /* ----------------------------------------------------------- dom build */
  function buildDrawer() {
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="cart-overlay" id="cartOverlay"></div>
      <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping cart" aria-hidden="true">
        <div class="cart-drawer__grip" aria-hidden="true"></div>
        <div class="cart-head">
          <h2>Your Basket</h2>
          <button class="close" id="cartClose" aria-label="Close cart">✕</button>
        </div>
        <div class="cart-body" id="cartBody"></div>
        <div class="cart-foot" id="cartFoot" hidden>
          <div class="cart-total">
            <span>Total</span>
            <strong id="cartTotal">0 ${currency}</strong>
          </div>
          <p class="hint">No online payment — we confirm every order personally on WhatsApp. 🤝</p>
          <button class="btn btn--wa btn--block" id="cartOrder">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5s0-.4 0-.5-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1 2.9 1.2 3.1 2.1 3.2 5 4.5c.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4s-.3-.2-.6-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
            Order via WhatsApp
          </button>
        </div>
      </aside>
    `;
    document.body.appendChild(el.querySelector("#cartOverlay"));
    document.body.appendChild(el.querySelector("#cartDrawer"));
  }

  /* Build once and cache refs */
  let drawer, overlay, bodyEl, footEl, totalEl, badgeEl;

  function init() {
    if (!document.getElementById("cartDrawer")) buildDrawer();
    drawer  = document.getElementById("cartDrawer");
    overlay = document.getElementById("cartOverlay");
    bodyEl  = document.getElementById("cartBody");
    footEl  = document.getElementById("cartFoot");
    totalEl = document.getElementById("cartTotal");
    badgeEl = document.getElementById("cartBadge");

    overlay.addEventListener("click", close);
    document.getElementById("cartClose").addEventListener("click", close);
    document.getElementById("cartOrder").addEventListener("click", orderViaWhatsApp);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    /* Close when the drawer is swiped down on mobile */
    addSwipeToClose();

    render();
  }

  function addSwipeToClose() {
    let startY = 0, startX = 0, dragging = false;
    drawer.addEventListener("touchstart", (e) => {
      if (window.innerWidth >= 720) return;
      const t = e.touches[0];
      startY = t.clientY; startX = t.clientX;
      dragging = bodyEl.scrollTop <= 0;
    }, { passive: true });
    drawer.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      const dy = t.clientY - startY;
      const dx = Math.abs(t.clientX - startX);
      if (dy > 6 && dy > dx) {
        drawer.style.transition = "none";
        drawer.style.transform = "translateY(" + dy + "px)";
      } else {
        dragging = false;
      }
    }, { passive: true });
    drawer.addEventListener("touchend", (e) => {
      if (!dragging) return;
      drawer.style.transition = "";
      drawer.style.transform = "";
      const dy = (e.changedTouches[0].clientY - startY);
      if (dy > 110) close();
      dragging = false;
    });
  }

  /* ----------------------------------------------------------- rendering */
  function render() {
    /* badge */
    const count = cart.reduce((s, l) => s + l.qty, 0);
    if (badgeEl) {
      badgeEl.textContent = count;
      badgeEl.classList.toggle("show", count > 0);
    }

    if (!cart.length) {
      bodyEl.innerHTML = `
        <div class="cart-empty">
          <div class="big">🧺</div>
          <p>Your basket is still empty.</p>
          <p style="font-size:.9rem">Have a look at our hand-made organic products.</p>
          <a class="btn btn--olive btn--sm" href="shop.html" onclick="OuizelneCart.close()">Browse the shop</a>
        </div>`;
      footEl.hidden = true;
      return;
    }

    bodyEl.innerHTML = cart.map(lineHTML).join("");
    footEl.hidden = false;

    const total = cart.reduce((s, l) => {
      const p = findProduct(l.id);
      return s + (p ? p.price * l.qty : 0);
    }, 0);
    totalEl.textContent = money(total);

    /* wire line buttons */
    bodyEl.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { act, id } = btn.dataset;
        if (act === "inc") setQty(id, qtyOf(id) + 1);
        else if (act === "dec") setQty(id, qtyOf(id) - 1);
        else if (act === "rm") remove(id, false);
      });
    });
  }

  function qtyOf(id) {
    const l = cart.find((x) => x.id === id);
    return l ? l.qty : 0;
  }

  function mediaHTML(p) {
    const style = `style="background:linear-gradient(150deg,${p.colors[0]},${p.colors[1]})"`;
    const img = p.img ? `<img src="${p.img}" alt="${esc(p.name)}" onerror="this.remove()">` : "";
    return `<div class="cart-line__media" ${style}>${p.icon}${img}</div>`;
  }

  function lineHTML(line) {
    const p = findProduct(line.id);
    if (!p) return "";
    return `
      <div class="cart-line">
        ${mediaHTML(p)}
        <div>
          <div class="cart-line__top">
            <div>
              <h3 class="cart-line__name">${esc(p.name)}</h3>
              <p class="cart-line__price">${money(p.price)} each</p>
            </div>
            <button class="cart-line__remove" data-act="rm" data-id="${p.id}" aria-label="Remove ${esc(p.name)}">🗑</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;">
            <div class="qty">
              <button data-act="dec" data-id="${p.id}" aria-label="Decrease quantity">−</button>
              <span class="qty__val">${line.qty}</span>
              <button data-act="inc" data-id="${p.id}" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-line__line-total">${money(p.price * line.qty)}</span>
          </div>
        </div>
      </div>`;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  /* ----------------------------------------------------------- actions */
  function add(id, qty) {
    const p = findProduct(id);
    if (!p) return;
    const n = qty || 1;
    const line = cart.find((x) => x.id === id);
    if (line) line.qty += n;
    else cart.push({ id, qty: n });
    save();
    render();
    bump();
    toast(`${p.icon} ${p.name} added`);
  }

  function remove(id, silent) {
    const p = findProduct(id);
    cart = cart.filter((x) => x.id !== id);
    save();
    render();
    if (!silent && p) toast(`${p.name} removed`);
  }

  function setQty(id, qty) {
    const line = cart.find((x) => x.id === id);
    if (!line) return;
    if (qty <= 0) { remove(id, true); return; }
    line.qty = Math.min(qty, 99);
    save();
    render();
  }

  function count() { return cart.reduce((s, l) => s + l.qty, 0); }
  function total() {
    return cart.reduce((s, l) => {
      const p = findProduct(l.id);
      return s + (p ? p.price * l.qty : 0);
    }, 0);
  }

  /* ----------------------------------------------------------- open / close */
  function open() {
    if (!drawer) init();
    drawer.classList.add("open");
    overlay.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }
  function close() {
    if (!drawer) return;
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  /* ----------------------------------------------------------- micro feedback */
  function bump() {
    const btn = document.getElementById("cartBtn");
    const badge = document.getElementById("cartBadge");
    if (btn) {
      btn.classList.remove("bump");
      void btn.offsetWidth;
      btn.classList.add("bump");
    }
    if (badge) {
      badge.classList.remove("pulse");
      void badge.offsetWidth;
      badge.classList.add("pulse");
    }
  }

  let toastTimer;
  function toast(msg) {
    let t = document.getElementById("cartToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "cartToast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.innerHTML = `<span class="tick">✓</span> ${esc(msg)}`;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ----------------------------------------------------------- whatsapp order */
  function orderViaWhatsApp() {
    if (!cart.length) return;
    let msg = "Hello Coopérative Ouizelne, I would like to order:\n";
    cart.forEach((l) => {
      const p = findProduct(l.id);
      if (p) msg += `- ${p.name} (x${l.qty})\n`;
    });
    msg += `\nTotal: ${money(total())}`;
    msg += "\n\nThank you! 🌿";
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
    window.open(url, "_blank");
  }

  /* ----------------------------------------------------------- global hookup */
  document.addEventListener("DOMContentLoaded", () => {
    init();

    /* open cart */
    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) cartBtn.addEventListener("click", (e) => { e.preventDefault(); open(); });

    /* any [data-add-to-cart="productId"] button adds instantly */
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-add-to-cart]");
      if (!el) return;
      e.preventDefault();
      add(el.getAttribute("data-add-to-cart"), 1);
    });
  });

  /* public API */
  window.OuizelneCart = { add, remove, setQty, open, close, count, total, render };
})();
