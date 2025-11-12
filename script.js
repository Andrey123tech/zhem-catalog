\
/* Жемчужина · скрипты (v3)
 * UX:
 * - Размеры: компактный столбец с прокруткой (~3 видимых)
 * - После "Добавить в заказ": остаёмся на карточке + тост
 * - Корзина: аккуратные строки, мини-превью, удаление
 * - +/− кликабельные, без iOS‑зума (см. CSS >=16px)
 * - Скрытие JSON: "Показать/Скрыть"
 */

import { CATEGORIES, DEFAULT_SIZES } from "./catalog_data.js";

// ==================== helpers ====================
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const fmt = (n) => String(n).replace('.', ',');

const CART_KEY = "zhem_cart_v3";

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const count = loadCart().reduce((s, it) => s + it.qty, 0);
  $$("#cartCount").forEach(el => el.textContent = count);
}

// Add or update cart line
function addToCart({ sku, size, qty=1, categoryId }) {
  const cart = loadCart();
  const idx = cart.findIndex(x => x.sku === sku && x.size === size);
  if (idx >= 0) {
    cart[idx].qty += qty;
  } else {
    cart.push({ sku, size, qty, categoryId });
  }
  saveCart(cart);
  toast("Добавлено в корзину");
}

function toast(text) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add("show");
  setTimeout(()=> el.classList.remove("show"), 1400);
}

// find product by sku
function findItem(sku) {
  for (const cat of CATEGORIES) {
    const item = cat.items.find(i => i.sku === sku);
    if (item) return { cat, item };
  }
  return null;
}

// Simple query param parser
const params = new URLSearchParams(location.search);

// ==================== CATALOG (grid) ====================
function renderCatalog() {
  const grid = $("#grid");
  if (!grid) return;

  const items = [];
  for (const cat of CATEGORIES) {
    for (const it of cat.items) {
      items.push({ ...it, categoryId: cat.id, categoryTitle: cat.title });
    }
  }

  grid.innerHTML = items.map(({sku, images, categoryId}) => `
    <a class="tile" href="product.html?sku=${encodeURIComponent(sku)}&cat=${encodeURIComponent(categoryId)}">
      <div class="square"><img src="${images?.[0] || 'https://picsum.photos/seed/'+sku+'/900'}" alt="${sku}"></div>
      <div class="tile-body">
        <div class="tile-title">Кольцо ${sku}</div>
        <div class="tile-sub">SKU: ${sku}</div>
      </div>
    </a>
  `).join("");

  updateCartBadge();
}

// ==================== PRODUCT ====================
function renderProduct() {
  const wrap = $("#product");
  if (!wrap) return;

  const sku = params.get("sku");
  const found = findItem(sku);
  if (!found) {
    wrap.innerHTML = `<div class="card">Товар не найден.</div>`;
    return;
  }
  const { cat, item } = found;
  const sizes = DEFAULT_SIZES;

  let currentSize = sizes[0];
  let qty = 1;

  function sizeButtons() {
    return `
      <div class="size-col" id="sizesCol">
        ${sizes.map(s => `<button class="size-btn${s===currentSize?' active':''}" data-size="${s}">${s}</button>`).join("")}
      </div>
    `;
  }

  wrap.innerHTML = `
    <div class="card">
      <div class="row">
        <div class="col">
          <div class="square" style="border:1px solid var(--line); border-radius:14px; overflow:hidden">
            <img src="${item.images?.[0] || 'https://picsum.photos/seed/'+item.sku+'/900'}" alt="${item.sku}">
          </div>
          <div class="gallery">
            ${(item.images||[]).map((src,i)=>`
              <div class="thumb ${i===0?'active':''}" data-src="${src}"><img src="${src}"></div>
            `).join("")}
          </div>
        </div>
        <div class="col">
          <div class="section-title">${cat.title}</div>
          <h2 style="margin:6px 0 8px">Кольцо ${item.sku}</h2>
          <div style="color:var(--muted); margin-bottom:8px">Вес: ~${fmt(item.weight)} г</div>

          <div class="row" style="gap:10px; align-items:flex-start; margin:10px 0 14px">
            ${sizeButtons()}
            <div>
              <div class="section-title">Количество</div>
              <div class="qty" id="qty">
                <button type="button" id="minus">−</button>
                <span id="qtyVal">1</span>
                <button type="button" id="plus">+</button>
              </div>
            </div>
          </div>

          <div class="bottom-bar">
            <div class="bottom-inner">
              <button class="secondary" id="toggleJson">Показать JSON</button>
              <button class="btn primary bottom-btn" id="addBtn">Добавить в заказ</button>
            </div>
          </div>

          <pre id="jsonBlock" style="display:none; white-space:pre-wrap; background:#f8fafc; padding:10px; border-radius:12px; border:1px solid var(--line); margin-top:10px"></pre>
        </div>
      </div>
    </div>
  `;

  // Handlers
  $("#sizesCol").addEventListener("click", (e)=>{
    const btn = e.target.closest(".size-btn");
    if (!btn) return;
    currentSize = btn.dataset.size;
    $$(".size-btn", $("#sizesCol")).forEach(b=> b.classList.toggle("active", b===btn));
  });

  $("#plus").addEventListener("click", ()=> {
    qty = Math.min(999, qty+1);
    $("#qtyVal").textContent = qty;
  });
  $("#minus").addEventListener("click", ()=> {
    qty = Math.max(1, qty-1);
    $("#qtyVal").textContent = qty;
  });

  $$(".thumb", wrap).forEach(th => th.addEventListener("click", ()=>{
    const src = th.dataset.src;
    $(".gallery .thumb.active", wrap)?.classList.remove("active");
    th.classList.add("active");
    $(".square img", wrap).src = src;
  }));

  $("#addBtn").addEventListener("click", ()=>{
    addToCart({ sku: item.sku, size: String(currentSize), qty, categoryId: cat.id });
  });

  $("#toggleJson").addEventListener("click", ()=>{
    const pre = $("#jsonBlock");
    const open = pre.style.display === "none";
    pre.style.display = open ? "block" : "none";
    $("#toggleJson").textContent = open ? "Скрыть JSON" : "Показать JSON";
    if (open) {
      pre.textContent = JSON.stringify({ sku: item.sku, weight: item.weight, sizes: DEFAULT_SIZES }, null, 2);
    }
  });

  updateCartBadge();
}

// ==================== ORDER ====================
function renderOrder() {
  const wrap = $("#order");
  if (!wrap) return;

  function lineRow(it) {
    const found = findItem(it.sku);
    const img = found?.item?.images?.[0] || 'https://picsum.photos/seed/'+it.sku+'/200';
    const weight = found?.item?.weight ?? 0;
    return `
      <div class="list-item cart-row" data-sku="${it.sku}" data-size="${it.size}">
        <div class="cart-thumb"><img src="${img}" alt=""></div>
        <div class="cart-meta">
          <div style="font-weight:600">Кольцо ${it.sku} · размер ${it.size}</div>
          <div style="color:var(--muted)">Вес ~${fmt(weight)} г</div>
          <div class="cart-actions" style="margin-top:8px">
            <div class="qty">
              <button class="minus">−</button>
              <span class="val">${it.qty}</span>
              <button class="plus">+</button>
            </div>
            <button class="btn icon remove">Удалить</button>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    const cart = loadCart();
    if (!cart.length) {
      wrap.innerHTML = `<div class="card">Корзина пуста.</div>`;
      updateCartBadge();
      return;
    }

    const totalQty = cart.reduce((s,x)=>s+x.qty,0);
    const totalWeight = cart.reduce((s,x)=>{
      const w = findItem(x.sku)?.item?.weight ?? 0;
      return s + w * x.qty;
    }, 0);

    wrap.innerHTML = `
      <div class="list">
        ${cart.map(lineRow).join("")}
      </div>
      <div class="card" style="margin-top:12px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:space-between">
        <div>
          <div style="font-weight:600">Итого: позиций ${cart.length}, шт: ${totalQty}</div>
          <div style="color:var(--muted)">Вес суммарно ~${fmt(totalWeight.toFixed(2))} г</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap">
          <button class="secondary" id="clearBtn">Очистить</button>
          <button class="btn primary" id="copyBtn">Скопировать заявку</button>
        </div>
      </div>
    `;

    // bind qty +/- and remove
    $$(".list-item").forEach(row => {
      const sku = row.dataset.sku;
      const size = row.dataset.size;
      const minus = $(".minus", row);
      const plus = $(".plus", row);
      const val = $(".val", row);
      const remove = $(".remove", row);

      minus.addEventListener("click", ()=> {
        const cart = loadCart();
        const idx = cart.findIndex(x=> x.sku===sku && x.size===size);
        if (idx>=0) {
          cart[idx].qty = Math.max(1, cart[idx].qty - 1);
          saveCart(cart);
          val.textContent = cart[idx].qty;
          render(); // re-render totals
        }
      });

      plus.addEventListener("click", ()=> {
        const cart = loadCart();
        const idx = cart.findIndex(x=> x.sku===sku && x.size===size);
        if (idx>=0) {
          cart[idx].qty = Math.min(999, cart[idx].qty + 1);
          saveCart(cart);
          val.textContent = cart[idx].qty;
          render();
        }
      });

      remove.addEventListener("click", ()=> {
        let cart = loadCart();
        cart = cart.filter(x=> !(x.sku===sku && x.size===size));
        saveCart(cart);
        render();
      });
    });

    $("#clearBtn").addEventListener("click", ()=> {
      if (confirm("Очистить корзину?")) {
        saveCart([]);
        render();
      }
    });

    $("#copyBtn").addEventListener("click", ()=> {
      const cart = loadCart();
      const lines = cart.map(x => {
        const w = findItem(x.sku)?.item?.weight ?? 0;
        return `SKU ${x.sku}, размер ${x.size}, шт ${x.qty}, вес ~${w} г`;
      });
      const text = `Заявка Жемчужина\\n` + lines.join("\\n");
      navigator.clipboard.writeText(text).then(()=> toast("Заявка скопирована"));
    });
  }

  render();
  updateCartBadge();
}

// ==================== entry ====================
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCatalog();
  renderProduct();
  renderOrder();
});
