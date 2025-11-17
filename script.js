/* Жемчужина · B2B каталог
 * Каталог, карточка, корзина.
 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const CART_KEY = "zhem_cart_v1";

/* === ХРАНЕНИЕ КОРЗИНЫ === */

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
}

function clearCart() {
  saveCart([]);
}

/* === УТИЛИТЫ === */

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function formatWeight(w) {
  if (w == null) return "";
  const n = Number(w);
  if (!isFinite(n)) return "";
  return n.toFixed(2).replace(/\.00$/, "");
}

function updateCartBadge() {
  const badge = $("#cartCount");
  if (!badge) return;
  const cart = loadCart();
  const totalQty = cart.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  badge.textContent = totalQty || 0;
}

/* Лёгкий тост */

function toast(msg) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1500);
}

/* Анимация “полет в корзину” */

function flyToCart(sourceEl) {
  const cartBtn = $("#cartBadge");
  if (!sourceEl || !cartBtn) return;

  const rectFrom = sourceEl.getBoundingClientRect();
  const rectTo = cartBtn.getBoundingClientRect();

  const ghost = document.createElement("div");
  ghost.className = "fly-circle";
  ghost.style.left = rectFrom.left + rectFrom.width / 2 + "px";
  ghost.style.top = rectFrom.top + rectFrom.height / 2 + "px";
  document.body.appendChild(ghost);

  requestAnimationFrame(() => {
    ghost.style.transform = `translate(${rectTo.left - rectFrom.left}px, ${rectTo.top - rectFrom.top}px) scale(0.2)`;
    ghost.style.opacity = "0";
  });

  setTimeout(() => ghost.remove(), 600);
}

/* Добавление в корзину (было и остаётся) */

function addToCart(product, size, qty) {
  if (!product || !product.sku) return;
  qty = Number(qty) || 1;
  if (qty <= 0) return;

  const cart = loadCart();
  const idx = cart.findIndex(
    it => it.sku === product.sku && String(it.size) === String(size)
  );

  const base = {
    sku: product.sku,
    title: product.title,
    size,
    avgWeight: product.avgWeight,
    image: product.images && product.images[0]
  };

  if (idx >= 0) {
    cart[idx].qty = Math.min(999, (cart[idx].qty || 0) + qty);
  } else {
    cart.push({ ...base, qty });
  }
  saveCart(cart);
}

/* === КАТАЛОГ (3×4 сетка) === */

function renderGrid() {
  const grid = $("#grid");
  if (!grid || !Array.isArray(PRODUCTS)) return;

  grid.innerHTML = PRODUCTS.map(p => {
    const img = (p.images && p.images[0]) || "https://picsum.photos/seed/placeholder/900";
    const w = p.avgWeight != null ? formatWeight(p.avgWeight) + " г" : "";

    const fullTitle = p.title || ("Кольцо " + p.sku);
    let shortTitle = fullTitle.replace(p.sku, "").trim();
    if (!shortTitle) shortTitle = "Кольцо";

    return `
      <a class="tile" href="product.html?sku=${encodeURIComponent(p.sku)}">
        <div class="square"><img src="${img}" alt="${fullTitle}"></div>
        <div class="tile-body">
          <div class="tile-title">${shortTitle}</div>
          <div class="tile-sub">
            <span>Арт. ${p.sku}</span>
            ${w ? `<span class="tile-weight">${w}</span>` : ""}
          </div>
        </div>
      </a>
    `;
  }).join("");
}

/* === КАРТОЧКА ТОВАРА с панелью размеров === */

function renderProduct() {
  const box = $("#product");
  if (!box || !Array.isArray(PRODUCTS)) return;

  const sku = getParam("sku");
  const product = PRODUCTS.find(p => p.sku === sku) || PRODUCTS[0];
  if (!product) {
    box.innerHTML = "<div class='card'>Товар не найден.</div>";
    return;
  }

  const imgSrc =
    (product.images && product.images[0]) ||
    "https://picsum.photos/seed/placeholder/900";

  const avgWeightText = product.avgWeight != null ? formatWeight(product.avgWeight) + " г" : "";
  const avgWeightNum = product.avgWeight != null ? Number(product.avgWeight) || 0 : 0;

  const fullTitle = product.title || ("Кольцо " + product.sku);
  let shortTitle = fullTitle.replace(product.sku, "").trim();
  if (!shortTitle) shortTitle = "Кольцо";

  const sizeList = (Array.isArray(SIZES) && SIZES.length ? SIZES : ["15.5", "16.0", "16.5", "17.0", "17.5", "18.0"])
    .slice()
    .sort((a, b) => parseFloat(a) - parseFloat(b));

  box.innerHTML = `
    <div class="product-card">
      <div class="product-main">
        <div class="product-breadcrumbs">
          <a href="catalog.html">Каталог</a> &nbsp;›&nbsp; <span>Кольца</span>
        </div>

        <div class="product-photo-wrap">
          <img src="${imgSrc}" alt="${fullTitle}">
        </div>

        <div class="product-meta">
          <h1 class="product-title">${shortTitle}</h1>
          <div class="product-meta-row">
            <span class="product-art">Арт. ${product.sku}</span>
            ${avgWeightText ? `<span class="product-weight">~ ${avgWeightText}</span>` : ""}
          </div>
        </div>
      </div>

      <div class="product-controls">
        <div class="field">
          <div class="field-label">РАЗМЕРЫ</div>
          <button type="button" id="openSizePanel" class="size-picker-btn">
            Выбрать размеры
          </button>
          <div class="size-picker-summary" id="sizeSummary">
            Ничего не выбрано
          </div>
        </div>

        <button id="addToCart" class="btn-primary btn-full" type="button">
          В корзину
        </button>
      </div>

      <!-- панель размеров -->
      <div id="sizePanel" class="size-panel hidden">
        <div class="size-panel-inner">
          <div class="size-panel-header">
            <div class="size-panel-title">Размеры кольца</div>
            <div class="size-panel-sub">
              Выберите нужные размеры и количество
            </div>
          </div>

          <div class="size-panel-list">
            ${sizeList.map(size => `
              <div class="size-row" data-size="${size}">
                <div class="size-row-size">р-р ${size}</div>
                <div class="size-row-qty">
                  <button type="button" data-act="dec">−</button>
                  <span>0</span>
                  <button type="button" data-act="inc">+</button>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="size-panel-footer">
            <div class="size-panel-total" id="sizePanelTotal">
              Всего: 0 шт
            </div>
            <button type="button" id="sizePanelDone" class="btn-primary btn-full">
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const sizePanel = $("#sizePanel");
  const openBtn = $("#openSizePanel");
  const doneBtn = $("#sizePanelDone");
  const totalEl = $("#sizePanelTotal");
  const summaryEl = $("#sizeSummary");
  const addBtn = $("#addToCart");

  const state = {};
  sizeList.forEach(s => { state[String(s)] = 0; });

  function recalcTotals() {
    let totalQty = 0;
    let totalWeight = 0;

    sizeList.forEach(s => {
      const q = state[String(s)] || 0;
      totalQty += q;
      if (avgWeightNum) totalWeight += q * avgWeightNum;
    });

    if (!totalQty) {
      totalEl.textContent = "Всего: 0 шт";
      summaryEl.textContent = "Ничего не выбрано";
    } else {
      const wText = avgWeightNum ? ` · ~ ${formatWeight(totalWeight)} г` : "";
      totalEl.textContent = `Всего: ${totalQty} шт${wText}`;
      summaryEl.textContent = `Выбрано: ${totalQty} шт${wText}`;
    }
  }

  if (openBtn && sizePanel) {
    openBtn.addEventListener("click", () => {
      sizePanel.classList.remove("hidden");
      recalcTotals();
    });
  }

  if (sizePanel) {
    sizePanel.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !btn.dataset.act) return;

      const row = btn.closest(".size-row");
      if (!row) return;

      const size = String(row.dataset.size);
      let q = state[size] || 0;

      if (btn.dataset.act === "inc") q = Math.min(999, q + 1);
      if (btn.dataset.act === "dec") q = Math.max(0, q - 1);

      state[size] = q;

      const span = row.querySelector(".size-row-qty span");
      if (span) span.textContent = String(q);

      recalcTotals();
    });
  }

  if (doneBtn && sizePanel) {
    doneBtn.addEventListener("click", () => {
      sizePanel.classList.add("hidden");
      recalcTotals();
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const cart = loadCart();
      let added = 0;

      sizeList.forEach(size => {
        const qty = state[String(size)] || 0;
        if (!qty) return;

        cart.push({
          sku: product.sku,
          title: product.title,
          size,
          qty,
          avgWeight: product.avgWeight,
          image: imgSrc
        });
        added += qty;
      });

      if (!added) {
        return;
      }

      saveCart(cart);
      updateCartBadge();
      flyToCart(addBtn);
      toast("Добавлено в заказ");
    });
  }
}

/* === КОРЗИНА (как в архиве) === */

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

    const lineWeight = w && it.qty ? formatWeight((Number(w.replace(",", ".")) || 0) * (it.qty || 0)) : null;

    return `
      <div class="cart-row" data-idx="${idx}">
        <div class="cart-main">
          <div class="cart-thumb">
            <img src="${img}" alt="${prod.title || it.sku}">
          </div>
          <div class="cart-body">
            <div class="cart-art">Арт. ${it.sku}</div>
            <div class="cart-title">${prod.title || it.title || ("Кольцо " + it.sku)}</div>
            <div class="cart-sub">
              р-р ${it.size} · ${it.qty} шт${lineWeight ? ` · ~ ${lineWeight} г` : ""}
            </div>
            <div class="cart-actions">
              <button class="btn-outline small" data-act="open" data-idx="${idx}">Изменить размеры</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const totalQty = cart.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const avg = cart.map(it => {
    const prod = PRODUCTS.find(p => p.sku === it.sku) || {};
    return it.avgWeight != null ? it.avgWeight : prod.avgWeight;
  });
  const totalWeight = cart.reduce((sum, it, i) => {
    const w = avg[i];
    if (w == null) return sum;
    return sum + (Number(w) || 0) * (Number(it.qty) || 0);
  }, 0);

  box.innerHTML = `
    <div class="card">
      <h1 class="cart-title-main">Итог</h1>
      <p class="cart-sub-main">
        Позиции: ${cart.length}, штук: ${totalQty}, вес ~ ${formatWeight(totalWeight)} г
      </p>

      <div class="list">
        ${rows}
      </div>

      <button id="copyOrder" class="btn-primary">
        Скопировать заявку
      </button>

      <div class="btn-row">
        <button id="clearCart" class="btn small">Очистить</button>
        <button id="backToCatalog" class="btn small">Каталог</button>
        <button id="toManager" class="btn small">Менеджеру</button>
      </div>
    </div>
  `;

  updateCartBadge();

  const cartBox = box;

  cartBox.onclick = e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const act = btn.dataset.act;
    const idx = Number(btn.dataset.idx);

    if (act === "open") {
      const url = `order_item.html?idx=${idx}`;
      window.location.href = url;
      return;
    }
  };

  $("#clearCart").onclick = () => {
    if (!confirm("Очистить корзину?")) return;
    clearCart();
    renderOrder();
  };

  $("#backToCatalog").onclick = () => {
    window.location.href = "catalog.html";
  };

  $("#toManager").onclick = () => {
    const cartNow = loadCart();
    if (!cartNow.length) return;

    const lines = cartNow.map(it =>
      `Арт. ${it.sku}, р-р ${it.size}, кол-во ${it.qty}`
    );
    const msg = encodeURIComponent("Здравствуйте! Вот моя заявка:\n" + lines.join("\n") + "\n\nИмя: __________");
    window.location.href = "https://wa.me/77000000000?text=" + msg;
  };

  $("#copyOrder").onclick = () => {
    const cartNow = loadCart();
    if (!cartNow.length) return;
    const lines = cartNow.map(it =>
      `Арт. ${it.sku}, размер ${it.size}, кол-во ${it.qty}`
    );
    const txt = "Заявка Жемчужина\n" + lines.join("\n");
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
}

/* === КОРРЕКТИРОВКА ОТДЕЛЬНОЙ МОДЕЛИ В КОРЗИНЕ (order_item.html) === */

function renderOrderItem() {
  const box = $("#orderItem");
  if (!box) return;

  const idx = Number(getParam("idx"));
  const cart = loadCart();
  const item = cart[idx];
  if (!item) {
    box.innerHTML = "<div class='card'>Позиция не найдена.</div>";
    return;
  }

  const prod = PRODUCTS.find(p => p.sku === item.sku) || {};
  const img = item.image || (prod.images && prod.images[0]) || "https://picsum.photos/seed/placeholder/900";
  const w = item.avgWeight != null
    ? formatWeight(item.avgWeight)
    : (prod.avgWeight != null ? formatWeight(prod.avgWeight) : null);

  const sizeList = (Array.isArray(SIZES) && SIZES.length ? SIZES : ["15.5","16.0","16.5","17.0","17.5","18.0"])
    .slice()
    .sort((a, b) => parseFloat(a) - parseFloat(b));

  const state = {};
  sizeList.forEach(s => { state[String(s)] = 0; });
  state[String(item.size)] = item.qty || 1;

  box.innerHTML = `
    <div class="card">
      <div class="order-item-header">
        <div class="order-item-thumb">
          <img src="${img}" alt="${prod.title || item.sku}">
        </div>
        <div class="order-item-meta">
          <div class="product-art">Арт. ${item.sku}</div>
          <div class="product-title">${prod.title || item.title || ("Кольцо " + item.sku)}</div>
          ${w ? `<div class="product-weight">Средний вес ~ ${w} г</div>` : ""}
        </div>
      </div>

      <div class="order-item-sizes" id="orderItemSizes">
        ${sizeList.map(size => `
          <div class="size-row" data-size="${size}">
            <div class="size-row-size">р-р ${size}</div>
            <div class="size-row-qty">
              <button type="button" data-act="dec">−</button>
              <span>${state[String(size)] || 0}</span>
              <button type="button" data-act="inc">+</button>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="order-item-footer">
        <div class="size-panel-total" id="orderItemTotal">
          Всего: 0 шт
        </div>
        <button id="orderItemDone" class="btn-primary btn-full" type="button">
          Готово
        </button>
      </div>
    </div>
  `;

  const totalEl = $("#orderItemTotal");
  const listEl = $("#orderItemSizes");
  const doneBtn = $("#orderItemDone");

  function recalcTotals() {
    let totalQty = 0;
    sizeList.forEach(s => {
      totalQty += state[String(s)] || 0;
    });
    totalEl.textContent = `Всего: ${totalQty} шт`;
  }

  recalcTotals();

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !btn.dataset.act) return;
    const row = btn.closest(".size-row");
    if (!row) return;
    const size = String(row.dataset.size);

    let q = state[size] || 0;
    if (btn.dataset.act === "inc") q = Math.min(999, q + 1);
    if (btn.dataset.act === "dec") q = Math.max(0, q - 1);
    state[size] = q;

    const span = row.querySelector(".size-row-qty span");
    if (span) span.textContent = String(q);
    recalcTotals();
  });

  doneBtn.addEventListener("click", () => {
    let newCart = loadCart();
    const cur = newCart[idx];
    if (!cur) return;

    const newItems = [];
    sizeList.forEach(size => {
      const q = state[String(size)] || 0;
      if (!q) return;
      newItems.push({
        ...cur,
        size,
        qty: q
      });
    });

    if (!newItems.length) {
      newCart.splice(idx, 1);
    } else {
      newCart.splice(idx, 1, ...newItems);
    }

    saveCart(newCart);
    window.location.href = "order.html";
  });
}

/* === СВАЙП УДАЛЕНИЯ В КОРЗИНЕ === */

function initSwipeToDelete() {
  const orderList = $("#order");
  if (!orderList) return;

  let startX = 0;
  let currentRow = null;
  let swiped = false;

  orderList.addEventListener("touchstart", e => {
    const row = e.target.closest(".cart-row");
    if (!row) return;
    startX = e.touches[0].clientX;
    currentRow = row;
    swiped = false;
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (!currentRow) return;
    const dx = e.touches[0].clientX - startX;
    if (dx < -30) {
      swiped = true;
      currentRow.style.transform = "translateX(-60px)";
      currentRow.style.opacity = "0.7";
    } else if (dx > -10) {
      currentRow.style.transform = "";
      currentRow.style.opacity = "";
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
  if ($("#orderItem")) renderOrderItem();
  updateCartBadge();
  initSwipeToDelete();
});
