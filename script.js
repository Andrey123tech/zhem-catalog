/* Жемчужина · B2B каталог
 * Упрощённая и компактная карточка товара:
 * - Фото + артикул + вес
 * - Размеры (колонка с прокруткой)
 * - Кол-во + кнопка "Добавить в заказ"
 * Карточка помещается в один экран телефона без лишней "бороды".
 */

/* ========================== УТИЛИТЫ ========================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const CART_KEY = "zhem_cart_v1";

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function formatWeight(g) {
  const num = Number(g) || 0;
  return (Math.round(num * 100) / 100).toFixed(2);
}

function getParam(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

function updateCartBadge() {
  const count = loadCart().reduce((s, it) => s + (it.qty || 0), 0);
  $$("#cartCount").forEach(el => el.textContent = count || "0");
}

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

/* ========================== КАТАЛОГ ========================== */
function renderGrid() {
  const grid = $("#grid");
  if (!grid || !Array.isArray(PRODUCTS)) return;

  grid.innerHTML = PRODUCTS.map(p => {
    const img = (p.images && p.images[0]) || "https://picsum.photos/seed/placeholder/900";
    const w = p.avgWeight != null ? formatWeight(p.avgWeight) + " г" : "";
    return `
      <a class="tile" href="product.html?sku=${encodeURIComponent(p.sku)}">
        <div class="square"><img src="${img}" alt="${p.title || p.sku}"></div>
        <div class="tile-body">
          <div class="tile-title">${p.title || ("Кольцо " + p.sku)}</div>
          <div class="tile-sub">
            <span>Арт. ${p.sku}</span>
            ${w ? `<span style="float:right;">${w}</span>` : ""}
          </div>
        </div>
      </a>
    `;
  }).join("");
}

/* ========================== ДОБАВЛЕНИЕ В КОРЗИНУ ========================== */
function addToCart(product, size, qty) {
  const cart = loadCart();
  const key = `${product.sku}_${size}`;
  const idx = cart.findIndex(it => it.key === key);
  const itemBase = {
    key,
    sku: product.sku,
    title: product.title || ("Кольцо " + product.sku),
    size,
    avgWeight: product.avgWeight,
    image: (product.images && product.images[0]) || null
  };

  if (idx >= 0) {
    cart[idx].qty = Math.min(999, (cart[idx].qty || 0) + qty);
  } else {
    cart.push({ ...itemBase, qty: qty });
  }
  saveCart(cart);
  toast("Добавлено в заказ");
}

/* ========================== КАРТОЧКА ТОВАРА ========================== */
function renderProduct() {
  const box = $("#product");
  if (!box || !Array.isArray(PRODUCTS)) return;

  const sku = getParam("sku");
  const product = PRODUCTS.find(p => p.sku === sku) || PRODUCTS[0];
  if (!product) {
    box.innerHTML = "<div class='card'>Товар не найден</div>";
    return;
  }

  let activeIndex = 0;
  let currentSize = (Array.isArray(SIZES) && SIZES.length) ? SIZES[0] : "18.0";
  let qty = 1;

  const mainImage = () => {
    const src =
      (product.images && product.images[activeIndex]) ||
      (product.images && product.images[0]) ||
      "https://picsum.photos/seed/placeholder/900";
    return `
      <div class="square">
        <img id="bigImage" src="${src}" alt="${product.title || product.sku}">
      </div>
    `;
  };

  const thumbs = () => {
    if (!product.images || product.images.length <= 1) return "";
    return `
      <div class="gallery">
        ${product.images.map((src, i) => `
          <button type="button" class="thumb ${i === activeIndex ? "active" : ""}" data-i="${i}">
            <img src="${src}" alt="">
          </button>
        `).join("")}
      </div>
    `;
  };

  const sizesCol = () => `
    <div class="size-col" id="sizesCol">
      ${(Array.isArray(SIZES) ? SIZES : ["16.0","17.0","18.0","19.0"]).map(s => `
        <button type="button" class="size-btn ${s === currentSize ? "active" : ""}" data-size="${s}">
          ${s}
        </button>
      `).join("")}
    </div>
  `;

  const w = product.avgWeight != null ? formatWeight(product.avgWeight) : null;

  box.innerHTML = `
    <div class="card">
      <div class="row">
        <div class="col">
          ${mainImage()}
          ${thumbs()}
        </div>
        <div class="col">
          <div class="badge">Арт. ${product.sku}</div>
          <h1 style="margin:6px 0 8px 0; font-size:20px;">
            ${product.title || ("Кольцо " + product.sku)}
          </h1>
          ${w ? `<div class="tile-sub" style="margin-bottom:10px;">Средний вес ~ ${w} г</div>` : ""}

          <div class="section-title">Размер</div>
          <div class="row" style="align-items:flex-start; margin-bottom:10px;">
            ${sizesCol()}
            <div>
              <div class="section-title">Кол-во</div>
              <div class="qty" style="margin-top:4px;">
                <button id="qtyMinus" type="button">−</button>
                <span id="qtyVal">1</span>
                <button id="qtyPlus" type="button">+</button>
              </div>
            </div>
          </div>

          <div class="bottom-bar">
            <div class="bottom-inner">
              <button id="addToCart" class="btn primary" type="button">
                В корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* обработчики */

  // смена миниатюры
  box.addEventListener("click", e => {
    const thumb = e.target.closest(".thumb");
    if (!thumb) return;
    const i = Number(thumb.dataset.i || "0");
    if (isNaN(i)) return;
    activeIndex = i;
    const src = product.images && product.images[activeIndex];
    if (src) {
      $("#bigImage", box).src = src;
    }
    $$(".thumb", box).forEach((b, idx) =>
      b.classList.toggle("active", idx === activeIndex)
    );
  });

  // выбор размера
  const sizesEl = $("#sizesCol", box);
  if (sizesEl) {
    sizesEl.addEventListener("click", e => {
      const btn = e.target.closest(".size-btn");
      if (!btn) return;
      currentSize = btn.dataset.size;
      $$(".size-btn", sizesEl).forEach(b =>
        b.classList.toggle("active", b === btn)
      );
    });
  }

  // +/- количество
  const qtyValEl = $("#qtyVal", box);
  $("#qtyPlus", box).addEventListener("click", () => {
    qty = Math.min(999, qty + 1);
    qtyValEl.textContent = String(qty);
  });
  $("#qtyMinus", box).addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyValEl.textContent = String(qty);
  });

  // добавить в корзину
  $("#addToCart", box).addEventListener("click", () => {
    addToCart(product, currentSize, qty);
  });
}

/* ========================== КОРЗИНА ========================== */
function renderOrder() {
  const box = $("#order");
  if (!box) { updateCartBadge(); return; }

  const cart = loadCart();
  if (!cart.length) {
    box.innerHTML = "<div class='card'>Корзина пуста.</div>";
    updateCartBadge();
    return;
  }

  const rows = cart.map((it, idx) => {
    const prod = PRODUCTS.find(p => p.sku === it.sku) || {};
    const img = it.image || (prod.images && prod.images[0]) || "https://picsum.photos/seed/placeholder/200";
    const w = it.avgWeight != null
      ? formatWeight(it.avgWeight)
      : (prod.avgWeight != null ? formatWeight(prod.avgWeight) : null);

    return `
      <div class="list-item cart-row" data-idx="${idx}">
        <div class="cart-thumb">
          <img src="${img}" alt="">
        </div>
        <div class="cart-meta">
          <div class="badge">Арт. ${it.sku}</div>
          <div style="font-weight:600; margin:4px 0 6px;">
            ${it.title || ("Кольцо " + it.sku)}
          </div>
          <div style="font-size:12px; color:var(--muted); margin-bottom:8px;">
            Размер: ${it.size}${w ? ` · вес ~ ${w} г / шт` : ""}
          </div>

          <div class="cart-actions">
            <div class="qty">
              <button type="button" data-act="dec" data-idx="${idx}">−</button>
              <span>${it.qty}</span>
              <button type="button" data-act="inc" data-idx="${idx}">+</button>
            </div>
            <button class="btn icon" type="button" data-act="rm" data-idx="${idx}">
              Удалить
            </button>
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
      <div style="margin-bottom:8px;">
        Позиции: ${cart.length}, штук: ${totalQty}, вес ~ ${formatWeight(totalWeight)} г
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:4px;">
        <button id="copyOrder" class="btn primary" type="button">Скопировать заявку</button>
        <button id="clearOrder" class="btn" type="button">Очистить</button>
      </div>
    </div>
  `;

  // обработчик +/- и удалить
  box.addEventListener("click", e => {
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
    } else if (act === "rm") {
      cartNow.splice(idx, 1);
    }
    saveCart(cartNow);
    renderOrder();
  }, { once: false });

  // копирование заявки
  $("#copyOrder").addEventListener("click", () => {
    const cartNow = loadCart();
    if (!cartNow.length) return;
    const lines = cartNow.map(it => {
      return `Арт. ${it.sku}, размер ${it.size}, кол-во ${it.qty}`;
    });
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
  });

  $("#clearOrder").addEventListener("click", () => {
    if (!confirm("Очистить корзину?")) return;
    saveCart([]);
    renderOrder();
  });

  updateCartBadge();
}

/* ========================== ROUTER ========================== */
document.addEventListener("DOMContentLoaded", () => {
  if ($("#grid")) renderGrid();
  if ($("#product")) renderProduct();
  if ($("#order")) renderOrder();
  updateCartBadge();
});
