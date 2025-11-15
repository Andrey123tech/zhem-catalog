/* Жемчужина · B2B каталог
 * Каталог, карточка, корзина.
 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const CART_KEY = "zhem_cart_v1";

// Номер менеджера для WhatsApp (без +, без пробелов)
const MANAGER_PHONE = "77012271519";

/* === ХРАНЕНИЕ КОРЗИНЫ === */

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product, size, qty) {
  if (!product || !product.sku || !size || !qty) return;

  const base = {
    sku: product.sku,
    size,
    qty,
    avgWeight: product.avgWeight ?? null,
    image: product.images && product.images[0] ? product.images[0] : null
  };

  const cart = loadCart();
  const existing = cart.find(
    it => it.sku === base.sku && String(it.size) === String(base.size)
  );

  if (existing) {
    existing.qty = Math.min(999, (existing.qty || 0) + qty);
  } else {
    cart.push({ ...base, qty });
  }
  saveCart(cart);
}

function updateCartBadge() {
  const badge = $(".cart-count");
  if (!badge) return;
  const cart = loadCart();
  const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);
  badge.textContent = totalQty ? String(totalQty) : "";
}

/* === УТИЛИТЫ === */

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function formatWeight(w) {
  if (w == null || isNaN(w)) return "";
  return Number(w).toFixed(2).replace(".", ",");
}

/* === КАТАЛОГ (GRID) === */

function renderGrid() {
  const box = $("#grid");
  if (!box || !Array.isArray(PRODUCTS)) return;

  const cards = PRODUCTS.map(prod => {
    const img = prod.images && prod.images[0] ? prod.images[0] : "https://picsum.photos/seed/placeholder/400";
    const w = prod.avgWeight != null ? formatWeight(prod.avgWeight) : null;
    return `
      <a class="product-card" href="product.html?sku=${encodeURIComponent(prod.sku)}">
        <div class="product-card-inner">
          <div class="product-image-wrap">
            <img src="${img}" alt="${prod.title || prod.sku}">
          </div>
          <div class="product-card-meta">
            <div class="badge">Арт. ${prod.sku}</div>
            <div class="product-card-title">${prod.title || ("Кольцо " + prod.sku)}</div>
            ${w ? `<div class="product-card-weight">Вес ~ ${w} г</div>` : ""}
          </div>
        </div>
      </a>
    `;
  }).join("");

  box.innerHTML = cards;
}

/* === КАРТОЧКА ТОВАРА === */

function renderProduct() {
  const box = $("#product");
  if (!box || !Array.isArray(PRODUCTS)) return;

  const sku = getParam("sku");
  const product = PRODUCTS.find(p => p.sku === sku) || PRODUCTS[0];
  if (!product) {
    box.innerHTML = "<div class='card'>Товар не найден.</div>";
    return;
  }

  const imgSrc = product.images && product.images[0]
    ? product.images[0]
    : "https://picsum.photos/seed/placeholder/600";

  const w = product.avgWeight != null ? formatWeight(product.avgWeight) : null;

  let sizeOptions = "";
  if (Array.isArray(SIZES) && SIZES.length) {
    sizeOptions = SIZES.map(s =>
      `<button type="button" class="size-btn" data-size="${s}">${s}</button>`
    ).join("");
  }

  box.innerHTML = `
    <div class="product-card">
      <div class="product-main">
        <div class="product-breadcrumbs">
          <a href="catalog.html">Каталог</a> &nbsp;›&nbsp; <span>Кольца</span>
        </div>

        <div class="product-photo-wrap">
          <img src="${imgSrc}" alt="${product.title || product.sku}">
        </div>

        <div class="product-meta">
          <div class="product-art">Арт. ${product.sku}</div>
          <h1 class="product-title">${product.title || ("Кольцо " + product.sku)}</h1>
          ${w ? `<div class="product-weight">Средний вес ~ ${w} г</div>` : ""}

          <div class="product-section">
            <div class="section-title">Размеры</div>
            <div class="size-row">
              ${sizeOptions}
            </div>
          </div>

          <div class="product-section">
            <div class="section-title">Кол-во</div>
            <div class="qty-row">
              <button type="button" id="qtyMinus">−</button>
              <span id="qtyVal">1</span>
              <button type="button" id="qtyPlus">+</button>
            </div>
          </div>

          <div class="product-actions">
            <button type="button" id="addToCart" class="btn-primary">
              Добавить в заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  let currentSize = SIZES && SIZES.length ? SIZES[0] : null;
  let qty = 1;

  const sizeButtons = $$(".size-btn", box);
  sizeButtons.forEach(btn => {
    const s = btn.dataset.size;
    if (s === String(currentSize)) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentSize = s;
      sizeButtons.forEach(b => b.classList.toggle("active", b === btn));
    });
  });

  const qtyValEl = $("#qtyVal", box);
  const btnPlus = $("#qtyPlus", box);
  const btnMinus = $("#qtyMinus", box);
  const addBtn = $("#addToCart", box);

  if (btnPlus) {
    btnPlus.addEventListener("click", () => {
      qty = Math.min(999, qty + 1);
      qtyValEl.textContent = String(qty);
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      qtyValEl.textContent = String(qty);
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addToCart(product, currentSize, qty);
      flyToCart(addBtn);
      toast("Добавлено в заказ");
      qty = 1;
      qtyValEl.textContent = "1";
    });
  }

  updateCartBadge();
}

/* === КОРЗИНА / ОФОРМЛЕНИЕ ЗАКАЗА === */

function renderOrder() {
  const box = $("#order");
  if (!box) { updateCartBadge(); return; }

  const cart = loadCart();
  if (!cart.length) {
    box.innerHTML = "<div class='card'>Корзина пуста.</div>";
    box.onclick = null;
    updateCartBadge();
    return;
  }

  const rows = cart.map((it, idx) => {
    const prod = PRODUCTS.find(p => p.sku === it.sku) || {};
    const img = it.image || (prod.images && prod.images[0]) || "https://picsum.photos/seed/placeholder/200";
    const w = it.avgWeight != null
      ? formatWeight(it.avgWeight)
      : (prod.avgWeight != null ? formatWeight(prod.avgWeight) : null);

    const digitsLine = w ? `${it.size} · ${w} г / шт` : it.size;

    return `
      <div class="list-item cart-row" data-idx="${idx}">
        <div class="cart-thumb">
          <img src="${img}" alt="">
        </div>
        <div class="cart-meta">
          <div class="badge">Арт. ${it.sku}</div>
          <div class="cart-line">
            <div class="cart-title">
              ${prod.title || ("Кольцо " + it.sku)}
            </div>
            <div class="cart-digits">
              ${digitsLine}
            </div>
          </div>

          <div class="cart-controls">
            <div class="cart-qty">
              <button type="button" data-act="dec" data-idx="${idx}">−</button>
              <span>${it.qty || 1}</span>
              <button type="button" data-act="inc" data-idx="${idx}">+</button>
            </div>
          </div>

          <div class="cart-sub">
            ${digitsLine}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const totalWeight = cart.reduce((s, it) => {
    const prod = PRODUCTS.find(p => p.sku === it.sku) || {};
    const w = it.avgWeight != null ? it.avgWeight : prod.avgWeight;
    return s + (Number(w) || 0) * (it.qty || 0);
  }, 0);
  const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);

  box.innerHTML = `
    <div class="list">${rows}</div>
    <div style="height:10px"></div>
    <div class="card">
      <div class="section-title">Итого</div>
      <div style="margin-bottom:10px;">
        Позиции: ${cart.length}, штук: ${totalQty}, вес ~ ${formatWeight(totalWeight)} г
      </div>

      <button id="copyOrder" class="btn-primary" type="button">
        Скопировать заявку
      </button>

      <div class="btn-row">
        <button id="clearOrder" class="btn small" type="button">Очистить</button>
        <button id="continueOrder" class="btn small" type="button">Продолжить отбор</button>
        <button id="sendToManager" class="btn small" type="button">Менеджеру</button>
      </div>
    </div>
  `;

  // обработка +/-
  box.onclick = function(e) {
    const btn = e.target.closest("button");
    if (!btn || !btn.dataset.act) return;

    const act = btn.dataset.act;
    const idx = Number(btn.dataset.idx);
    if (isNaN(idx)) return;

    const cartNow = loadCart();
    const item = cartNow[idx];
    if (!item) return;

    if (act === "inc") {
      item.qty = Math.min(999, (item.qty || 0) + 1);
    } else if (act === "dec") {
      item.qty = Math.max(1, (item.qty || 0) - 1);
    }

    saveCart(cartNow);
    renderOrder();
  };

  // копирование заявки (под Excel)
  $("#copyOrder").onclick = () => {
    const cartNow = loadCart();
    if (!cartNow.length) return;

    const header = "Артикул;Размер;Кол-во";
    const lines = cartNow.map(it =>
      `${it.sku};${it.size};${it.qty}`
    );

    const txt = header + "\n" + lines.join("\n");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => toast("Заявка скопирована"));
    } else {
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast("Заявка скопирована");
    }
  };

  $("#clearOrder").onclick = () => {
    if (!confirm("Очистить корзину?")) return;
    saveCart([]);
    renderOrder();
  };

  $("#continueOrder").onclick = () => {
    window.location.href = "catalog.html";
  };

  $("#sendToManager").onclick = () => {
    const cartNow = loadCart();
    if (!cartNow.length) {
      toast("Корзина пуста");
      return;
    }

    const lines = cartNow.map(it =>
      `${it.sku};${it.size};${it.qty}`
    );

    const txt =
      "Здравствуйте! Отправляю заявку по каталогу Жемчужина.\n\n" +
      "Артикул;Размер;Кол-во\n" +
      lines.join("\n") +
      "\n\nС уважением,\n";

    const phone = MANAGER_PHONE;
    const url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(txt);

    window.open(url, "_blank");
  };

  updateCartBadge();
}

/* === ТОСТ === */

function toast(msg) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1400);
}

/* === ПОЛЁТ В КОРЗИНУ (МИКРО-АНИМАЦИЯ) === */

function flyToCart(btn) {
  const cartLink = $(".cart-link");
  if (!cartLink || !btn) return;

  const rectBtn = btn.getBoundingClientRect();
  const rectCart = cartLink.getBoundingClientRect();

  const dot = document.createElement("div");
  dot.className = "fly-dot";
  dot.style.left = rectBtn.left + rectBtn.width / 2 + "px";
  dot.style.top = rectBtn.top + rectBtn.height / 2 + "px";
  document.body.appendChild(dot);

  requestAnimationFrame(() => {
    dot.style.transform = `translate(${rectCart.left - rectBtn.left}px, ${rectCart.top - rectBtn.top}px) scale(0.5)`;
    dot.style.opacity = "0";
  });

  setTimeout(() => {
    dot.remove();
  }, 600);
}

/* === СВАЙП ДЛЯ УДАЛЕНИЯ В МОБИЛЬНОЙ КОРЗИНЕ === */

function initSwipeToDelete() {
  let startX = 0;
  let currentRow = null;
  let swiped = false;

  document.addEventListener("touchstart", e => {
    const row = e.target.closest(".cart-row");
    if (!row) return;
    startX = e.touches[0].clientX;
    currentRow = row;
    swiped = false;
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (!currentRow) return;
    const dx = e.touches[0].clientX - startX;
    if (dx < -30) {               // смахнули влево
      swiped = true;
      currentRow.style.transform = "translateX(-60px)";
      currentRow.style.opacity = "0.7";
    }
  }, { passive: true });

  document.addEventListener("touchend", () => {
    if (!currentRow) return;
    if (swiped) {
      const idx = Number(currentRow.dataset.idx);
      const cartNow = loadCart();
      if (!isNaN(idx) && cartNow[idx]) {
        cartNow.splice(idx, 1);
        saveCart(cartNow);
        renderOrder();
      }
    } else {
      currentRow.style.transform = "";
      currentRow.style.opacity = "";
    }
    currentRow = null;
  });
}

/* === ROUTER === */

document.addEventListener("DOMContentLoaded", () => {
  if ($("#grid")) renderGrid();
  if ($("#product")) renderProduct();
  if ($("#order")) renderOrder();
  updateCartBadge();
  initSwipeToDelete();
});
