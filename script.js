/* ===============================
   Жемчужина · B2B каталог
   Полный рабочий script.js
   =============================== */

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

/* === КАТАЛОГ 3×4 === */

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

/* === КАРТОЧКА ТОВАРА с панелью размеров (идеальная версия) === */

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

  const sizeList = (Array.isArray(SIZES) && SIZES.length ? SIZES : ["15.5","16.0","16.5","17.0","17.5","18.0"])
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
          <button id="openSizePanel" class="size-picker-btn">Выбрать размеры</button>
          <div class="size-picker-summary" id="sizeSummary">Ничего не выбрано</div>
        </div>

        <button id="addToCart" class="btn-primary btn-full">В корзину</button>
      </div>

      <div id="sizePanel" class="size-panel hidden">
        <div class="size-panel-inner">
          <div class="size-panel-header">
            <div class="size-panel-title">Размеры кольца</div>
            <div class="size-panel-sub">Выберите нужные размеры и количество</div>
          </div>

          <div class="size-panel-list">
            ${sizeList.map(size => `
              <div class="size-row" data-size="${size}">
                <div class="size-row-size">р-р ${size}</div>
                <div class="size-row-qty">
                  <button data-act="dec">−</button>
                  <span>0</span>
                  <button data-act="inc">+</button>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="size-panel-footer">
            <div class="size-panel-total" id="sizePanelTotal">Всего: 0 шт</div>
            <button id="sizePanelDone" class="btn-primary btn-full">Готово</button>
          </div>
        </div>
      </div>
    </div>
  `;

  /* ЛОГИКА ПАНЕЛИ */

  const sizePanel = $("#sizePanel");
  const openBtn = $("#openSizePanel");
  const doneBtn = $("#sizePanelDone");
  const totalEl = $("#sizePanelTotal");
  const summaryEl = $("#sizeSummary");
  const addBtn = $("#addToCart");

  const state = {};
  sizeList.forEach(s => { state[s] = 0; });

  function recalcTotals() {
    let totalQty = 0;
    let totalWeight = 0;

    sizeList.forEach(s => {
      const q = state[s] || 0;
      totalQty += q;
      if (avgWeightNum) totalWeight += q * avgWeightNum;
    });

    if (!totalQty) {
      totalEl.textContent = "Всего: 0 шт";
      summaryEl.textContent = "Ничего не выбрано";
    } else {
      const wTxt = avgWeightNum ? ` · ~ ${formatWeight(totalWeight)} г` : "";
      totalEl.textContent = `Всего: ${totalQty} шт${wTxt}`;
      summaryEl.textContent = `Выбрано: ${totalQty} шт${wTxt}`;
    }
  }

  openBtn.addEventListener("click", () => {
    sizePanel.classList.remove("hidden");
    recalcTotals();
  });

  sizePanel.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !btn.dataset.act) return;

    const row = btn.closest(".size-row");
    const size = row.dataset.size;

    let q = state[size] || 0;
    if (btn.dataset.act === "inc") q++;
    if (btn.dataset.act === "dec") q = Math.max(0, q - 1);
    state[size] = q;

    row.querySelector("span").textContent = q;
    recalcTotals();
  });

  doneBtn.addEventListener("click", () => {
    sizePanel.classList.add("hidden");
    recalcTotals();
  });

  addBtn.addEventListener("click", () => {
    const cart = loadCart();
    let added = 0;

    sizeList.forEach(size => {
      const q = state[size];
      if (!q) return;
      cart.push({
        sku: product.sku,
        title: product.title,
        size,
        qty: q,
        avgWeight: product.avgWeight,
        image: imgSrc
      });
      added += q;
    });

    if (!added) return;
    saveCart(cart);
    updateCartBadge();
    flyToCart(addBtn);
    toast("Добавлено в заказ");
  });
}

/* === КОРЗИНА (исправленная группировка) === */

function renderOrder() {
  const box = $("#order");
  if (!box) { updateCartBadge(); return; }

  const cart = loadCart();
  if (!cart.length) {
    box.innerHTML = "<div class='card'>Корзина пуста.</div>";
    return;
  }

  /* === группировка по SKU === */
  const groups = {};
  cart.forEach(it => {
    if (!groups[it.sku]) groups[it.sku] = [];
    groups[it.sku].push(it);
  });

  const rows = Object.keys(groups).map((sku, idx) => {
    const items = groups[sku];
    const prod = PRODUCTS.find(p => p.sku === sku) || {};
    const img = items[0].image || (prod.images && prod.images[0]) || "https://picsum.photos/seed/placeholder/200";

    const sizesHtml = items
      .sort((a,b)=>parseFloat(a.size)-parseFloat(b.size))
      .map(it => `р-р ${it.size}: ${it.qty} шт`)
      .join("<br>");

    return `
      <div class="cart-row" data-idx="${idx}">
        <div class="cart-main">
          <div class="cart-thumb"><img src="${img}"></div>
          <div class="cart-body">
            <div class="cart-art">Арт. ${sku}</div>
            <div class="cart-title">${prod.title || items[0].title || "Кольцо " + sku}</div>
            <div class="cart-sub">${sizesHtml}</div>
            <div class="cart-actions">
              <button class="btn-outline small" data-act="open" data-sku="${sku}">Изменить размеры</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");


  /* === Итоговые подсчёты === */

  const totalQty = cart.reduce((s, it)=>s+Number(it.qty||0),0);
  const totalWeight = cart.reduce((s,it)=>{
    const w = Number(it.avgWeight||0);
    return s + w*(it.qty||0);
  },0);

  box.innerHTML = `
    <div class="card">
      <h1 class="cart-title-main">Итог</h1>
      <p class="cart-sub-main">
        Позиции: ${Object.keys(groups).length}, штук: ${totalQty}, вес ~ ${formatWeight(totalWeight)} г
      </p>

      <div class="list">${rows}</div>

      <button id="copyOrder" class="btn-primary">Скопировать заявку</button>

      <div class="btn-row">
        <button id="clearCart" class="btn small">Очистить</button>
        <button id="backToCatalog" class="btn small">Каталог</button>
        <button id="toManager" class="btn small">Менеджеру</button>
      </div>
    </div>
  `;

  updateCartBadge();


  /* === ЛОГИКА КНОПОК === */

  $("#clearCart").onclick = () => {
    if (confirm("Очистить корзину?")) {
      clearCart();
      renderOrder();
    }
  };

  $("#backToCatalog").onclick = () => {
    window.location.href = "catalog.html";
  };

  $("#toManager").onclick = () => {
    const cartNow = loadCart();
    if (!cartNow.length) return;

    const groups = {};
    cartNow.forEach(it=>{
      if(!groups[it.sku]) groups[it.sku] = [];
      groups[it.sku].push(it);
    });

    const lines = Object.keys(groups).map(sku=>{
      const arr = groups[sku]
        .sort((a,b)=>parseFloat(a.size)-parseFloat(b.size))
        .map(it=>`${it.size} — ${it.qty} шт`)
        .join(", ");
      return `Арт. ${sku}: ${arr}`;
    });

    const msg = encodeURIComponent("Здравствуйте! Вот моя заявка:\n" + lines.join("\n") + "\n\nИмя: _______");
    window.location.href = "https://wa.me/77000000000?text=" + msg;
  };

  $("#copyOrder").onclick = () => {
    const cartNow = loadCart();
    if (!cartNow.length) return;

    const groups = {};
    cartNow.forEach(it=>{
      if(!groups[it.sku]) groups[it.sku] = [];
      groups[it.sku].push(it);
    });

    const lines = Object.keys(groups).map(sku=>{
      const arr = groups[sku]
        .sort((a,b)=>parseFloat(a.size)-parseFloat(b.size))
        .map(it=>`${it.size}: ${it.qty} шт`)
        .join(", ");
      return `Арт. ${sku}: ${arr}`;
    });

    const txt = "Заявка Жемчужина\n" + lines.join("\n");

    navigator.clipboard?.writeText(txt).then(() => toast("Заявка скопирована"));
  };


  /* === ПЕРЕХОД К КОРРЕКТИРОВКЕ === */

  box.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.act === "open") {
      const sku = btn.dataset.sku;
      window.location.href = `order_item.html?sku=${sku}`;
    }
  };
}

/* === КОРРЕКТИРОВКА ОДНОЙ МОДЕЛИ В КОРЗИНЕ === */

function renderOrderItem() {
  const box = $("#orderItem");
  if (!box) return;

  const sku = getParam("sku");
  const cart = loadCart();
  const items = cart.filter(it=>it.sku===sku);

  if (!items.length) {
    box.innerHTML = "<div class='card'>Позиция не найдена.</div>";
    return;
  }

  const prod = PRODUCTS.find(p=>p.sku===sku) || {};
  const img = items[0].image || (prod.images && prod.images[0]) ||
              "https://picsum.photos/seed/placeholder/200";

  const w = items[0].avgWeight != null
    ? formatWeight(items[0].avgWeight)
    : (prod.avgWeight != null ? formatWeight(prod.avgWeight) : null);

  const sizeList = (Array.isArray(SIZES)&&SIZES.length?SIZES:["15.5","16.0","16.5","17.0","17.5","18.0"])
    .slice()
    .sort((a,b)=>parseFloat(a)-parseFloat(b));

  const state = {};
  sizeList.forEach(s=>{
    const found = items.find(it=>String(it.size)===String(s));
    state[s] = found ? found.qty : 0;
  });

  box.innerHTML = `
    <div class="card">
      <div class="order-item-header">
        <div class="order-item-thumb"><img src="${img}"></div>
        <div class="order-item-meta">
          <div class="product-art">Арт. ${sku}</div>
          <div class="product-title">${prod.title || items[0].title || ("Кольцо "+sku)}</div>
          ${w ? `<div class="product-weight">Средний вес ~ ${w} г</div>` : ""}
        </div>
      </div>

      <div class="order-item-sizes" id="orderItemSizes">
        ${sizeList.map(size=>`
          <div class="size-row" data-size="${size}">
            <div class="size-row-size">р-р ${size}</div>
            <div class="size-row-qty">
              <button data-act="dec">−</button>
              <span>${state[size]||0}</span>
              <button data-act="inc">+</button>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="order-item-footer">
        <div class="size-panel-total" id="orderItemTotal">Всего: 0 шт</div>
        <button id="orderItemDone" class="btn-primary btn-full">Готово</button>
      </div>
    </div>
  `;

  const totalEl = $("#orderItemTotal");
  const listEl = $("#orderItemSizes");
  const doneBtn = $("#orderItemDone");

  function recalcTotals() {
    let t = 0;
    sizeList.forEach(s=>t+=state[s]||0);
    totalEl.textContent = `Всего: ${t} шт`;
  }

  recalcTotals();

  listEl.onclick = (e)=>{
    const btn = e.target.closest("button");
    if(!btn) return;

    const row = btn.closest(".size-row");
    const size = row.dataset.size;

    let q = state[size]||0;
    if(btn.dataset.act==="inc") q++;
    if(btn.dataset.act==="dec") q=Math.max(0,q-1);

    state[size]=q;
    row.querySelector("span").textContent=q;
    recalcTotals();
  };

  doneBtn.onclick = ()=>{
    let newCart = loadCart();
    newCart = newCart.filter(it=>it.sku!==sku);

    sizeList.forEach(size=>{
      const q = state[size];
      if(q>0){
        newCart.push({
          sku,
          size,
          qty: q,
          title: items[0].title,
          avgWeight: items[0].avgWeight,
          image: img
        });
      }
    });

    saveCart(newCart);
    window.location.href="order.html";
  };
}

/* === СВАЙП УДАЛЕНИЯ ТОЛЬКО В КОРЗИНЕ === */

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
  });

  orderList.addEventListener("touchmove", e => {
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
  });

  orderList.addEventListener("touchend", () => {
    if (!currentRow) return;
    if (swiped) {
      const idx = Number(currentRow.dataset.idx);
      const cartNow = loadCart();
      const groups = {};

      cartNow.forEach(it=>{
        if(!groups[it.sku]) groups[it.sku]=[];
        groups[it.sku].push(it);
      });

      const skuToRemove = Object.keys(groups)[idx];
      const newCart = cartNow.filter(it=>it.sku!==skuToRemove);

      saveCart(newCart);
      renderOrder();
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
