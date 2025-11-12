/* ========================== ДАННЫЕ ========================== */
const PRODUCTS = [
  { sku: "R1254781", title: "Кольцо с фианитом", avgWeight: 3.85, images: ["https://picsum.photos/seed/r1a/900","https://picsum.photos/seed/r1b/900","https://picsum.photos/seed/r1c/900"] },
  { sku: "R1254782", title: "Кольцо", avgWeight: 3.70, images: ["https://picsum.photos/seed/r2/900"] },
  { sku: "R1254783", title: "Кольцо", avgWeight: 3.95, images: ["https://picsum.photos/seed/r3/900"] },
  { sku: "R1254784", title: "Кольцо", avgWeight: 4.10, images: ["https://picsum.photos/seed/r4/900"] },
  { sku: "R1254785", title: "Кольцо", avgWeight: 3.60, images: ["https://picsum.photos/seed/r5/900"] },
  { sku: "R1254786", title: "Кольцо", avgWeight: 3.55, images: ["https://picsum.photos/seed/r6/900"] },
  { sku: "R1254787", title: "Кольцо", avgWeight: 3.40, images: ["https://picsum.photos/seed/r7/900"] },
  { sku: "R1254788", title: "Кольцо", avgWeight: 3.20, images: ["https://picsum.photos/seed/r8/900"] },
  { sku: "R1254789", title: "Кольцо", avgWeight: 3.85, images: ["https://picsum.photos/seed/r9/900"] },
  { sku: "R1254790", title: "Кольцо", avgWeight: 3.75, images: ["https://picsum.photos/seed/r10/900"] },
  { sku: "R1254791", title: "Кольцо", avgWeight: 3.65, images: ["https://picsum.photos/seed/r11/900"] },
  { sku: "R1254792", title: "Кольцо", avgWeight: 3.95, images: ["https://picsum.photos/seed/r12/900"] }
];

const SIZES = [];
for (let v = 15.0; v <= 23.5; v += 0.5) SIZES.push(v.toFixed(1));

/* ========================== УТИЛИТЫ ========================== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function getCart() { try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; } }
function setCart(items) { localStorage.setItem("cart", JSON.stringify(items)); }
function cartWeight(items) { return items.reduce((s, it) => s + it.qty * (Number(it.avgWeight) || 0), 0); }
function formatWeight(g) { return (Math.round(g*100)/100).toFixed(2); }
function param(name) { const u = new URL(location.href); return u.searchParams.get(name); }

function updateCartBadge() {
  const el = $("#cartCount");
  if (!el) return;
  const count = getCart().reduce((s, it) => s + it.qty, 0);
  el.textContent = count || "0";
}

function showToast(text="Добавлено в заказ") {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = text;
  t.classList.add("show");
  if (navigator.vibrate) navigator.vibrate(30);
  setTimeout(()=> t.classList.remove("show"), 1200);
}

function addToCart(item) {
  const cart = getCart();
  const idx = cart.findIndex(x => x.sku === item.sku && x.size === item.size);
  if (idx >= 0) cart[idx].qty += item.qty;
  else cart.push(item);
  setCart(cart);
  updateCartBadge();
}

/* ========================== РЕНДЕРЫ ========================== */
function renderGrid() {
  const wrap = $("#grid");
  if (!wrap) return;
  wrap.innerHTML = PRODUCTS.map(p => `
    <a class="tile" href="product.html?sku=${p.sku}">
      <div class="square"><img src="${p.images?.[0]}" alt="${p.title}"></div>
      <div class="tile-body">
        <div class="tile-sub">Арт. ${p.sku}</div>
        <div class="tile-title">${p.title}</div>
      </div>
    </a>
  `).join("");
}

function Tabbar(active) {
  return `
    <nav class="tabbar">
      <div class="tabbar-inner">
        <a href="index.html" class="${active==='home'?'active':''}">Главная</a>
        <a href="catalog.html" class="${active==='cat'?'active':''}">Каталог</a>
        <a href="order.html" class="${active==='cart'?'active':''}">Корзина</a>
      </div>
    </nav>
  `;
}

function renderProduct() {
  const sku = param("sku");
  const p = PRODUCTS.find(x => x.sku === sku);
  if (!p) { $("#product").innerHTML = "<div class='card'>Товар не найден</div>"; return; }

  let active = 0, size = "18.0", qty = 1, avgWeight = p.avgWeight;

  const gallery = () => `
    <div class="square"><img id="big" src="${p.images[active]}" alt="${p.title}"></div>
    <div class="gallery">
      ${p.images.map((src,i)=>`
        <button class="thumb ${i===active?"active":""}" data-i="${i}" type="button">
          <img src="${src}" alt="">
        </button>
      `).join("")}
    </div>
  `;

  const sizesCol = () => `
    <div class="size-col" id="sizes">
      ${SIZES.map(s => `<button class="size-btn ${s===size?"active":""}" data-s="${s}" type="button">${s}</button>`).join("")}
    </div>
  `;

  $("#product").innerHTML = `
    <div class="row">
      <div class="col">
        ${gallery()}
      </div>
      <div class="col">
        <div class="badge">Артикул: ${p.sku}</div>
        <h1 style="margin:6px 0 10px 0">${p.title}</h1>

        <div class="card">
          <div class="section-title">Средний вес (г)</div>
          <input id="avgw" type="number" step="0.01" min="0.1" value="${avgWeight}"
                 style="width:140px; padding:10px; border:1px solid var(--line); border-radius:12px; font-size:16px;">
          <div class="badge" style="margin-top:6px">Позже подтянем из 1С</div>
        </div>

        <div style="height:8px"></div>

        <div>
          <div class="section-title">Размер</div>
          <div class="row">
            ${sizesCol()}
            <div class="badge" style="align-self:flex-start">Прокрутите список ↑/↓</div>
          </div>
        </div>

        <div style="height:120px"></div> <!-- место под нижние панели -->
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-inner">
        <div class="qty" aria-label="Количество">
          <button id="minus" type="button">−</button>
          <span id="qty">1</span>
          <button id="plus" type="button">+</button>
        </div>
        <div class="badge">Размер: <span id="sizeView">${size}</span></div>
        <button id="add" class="btn primary bottom-btn" type="button">В корзину</button>
        <a href="catalog.html" class="btn sm" style="margin-left:6px">← К кольцам</a>
      </div>
    </div>

    ${Tabbar('cat')}

    <div id="toast" class="toast" aria-live="polite" aria-atomic="true"></div>
  `;

  $("#avgw").addEventListener("input", e => { avgWeight = Number(e.target.value) || avgWeight; });
  $("#minus").addEventListener("click", ()=> { qty = Math.max(1, qty-1); $("#qty").textContent = qty; });
  $("#plus").addEventListener("click", ()=> { qty += 1; $("#qty").textContent = qty; });

  $("#sizes").addEventListener("click", e => {
    const btn = e.target.closest(".size-btn");
    if (!btn) return;
    size = btn.dataset.s;
    $("#sizeView").textContent = size;
    $$("#sizes .size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });

  $$(".thumb").forEach(b => b.addEventListener("click", () => {
    active = Number(b.dataset.i);
    $("#big").src = p.images[active];
    $$(".thumb").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
  }));

  $("#add").addEventListener("click", () => {
    addToCart({
      sku: p.sku, title: p.title, size, qty, avgWeight,
      image: p.images?.[0] || ""
    });
    showToast("Добавлено в заказ");
    qty = 1; $("#qty").textContent = "1";
  });

  updateCartBadge();
}

function renderOrder() {
  const box = $("#order");
  if (!box) return;
  const cart = getCart();

  if (!cart.length) {
    box.innerHTML = `<div class="card">Корзина пуста. Добавьте изделия из каталога.</div>` + Tabbar('cart');
    updateCartBadge();
    return;
  }

  const rows = cart.map((it, i) => `
    <div class="list-item">
      <div class="cart-row">
        <div class="cart-thumb">
          <img src="${it.image || 'https://picsum.photos/seed/placeholder/200'}" alt="">
        </div>
        <div class="cart-meta">
          <div class="badge">Арт. ${it.sku}</div>
          <div style="font-weight:600; margin:4px 0 8px">${it.title}</div>

          <div class="cart-actions">
            <div class="card" style="flex:0 0 auto">
              <div class="section-title">Размер</div>
              <div>${it.size}</div>
            </div>

            <div class="card" style="flex:0 0 auto">
              <div class="section-title">Кол-во</div>
              <div class="qty">
                <button data-i="${i}" data-act="dec" type="button">−</button>
                <span>${it.qty}</span>
                <button data-i="${i}" data-act="inc" type="button">+</button>
              </div>
            </div>

            <div class="card" style="flex:0 0 auto">
              <div class="section-title">Средний вес (г)</div>
              <input data-i="${i}" data-act="w" type="number" step="0.01" min="0.1"
                value="${it.avgWeight}" style="width:120px; padding:10px; border:1px solid var(--line); border-radius:12px; font-size:16px;">
            </div>

            <button class="btn icon" data-i="${i}" data-act="rm" type="button">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  const total = formatWeight(cartWeight(cart));

  box.innerHTML = `
    <div class="list">${rows}</div>
    <div style="height:10px"></div>
    <div class="card">
      <div class="section-title">Примерный общий вес заявки</div>
      <div style="font-size:22px; font-weight:600">${total} г</div>
    </div>
    <div style="height:10px"></div>
    <div class="card">
      <div class="section-title">Заявка для менеджера / 1С</div>
      <details>
        <summary style="cursor:pointer">Показать / скрыть JSON</summary>
        <textarea id="json" readonly style="width:100%; height:160px; font-family: ui-monospace, Menlo, monospace; font-size:12px; border:1px solid var(--line); border-radius:12px; padding:8px; margin-top:8px;"></textarea>
      </details>
      <div class="row" style="margin-top:10px; flex-wrap:wrap">
        <button id="copy" class="btn" type="button">Скопировать JSON</button>
        <button id="send" class="btn primary" type="button">Отправить менеджеру</button>
        <button id="clear" class="btn" type="button">Очистить корзину</button>
      </div>
    </div>

    ${Tabbar('cart')}

    <div id="toast" class="toast" aria-live="polite" aria-atomic="true"></div>
  `;

  const json = {
    created_at: new Date().toISOString(),
    items: cart,
    est_total_weight_g: Number(total),
    note: "Цена не отображается. Сухой сбор заявки. Позже — 1С/БД."
  };
  const jsonEl = $("#json");
  if (jsonEl) jsonEl.value = JSON.stringify(json, null, 2);

  box.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const i = Number(btn.dataset.i);
    const act = btn.dataset.act;
    const items = getCart();

    if (act === "inc") items[i].qty += 1;
    if (act === "dec") items[i].qty = Math.max(1, items[i].qty - 1);
    if (act === "rm") items.splice(i,1);

    setCart(items);
    renderOrder();
    updateCartBadge();
  });

  box.addEventListener("input", (e) => {
    const inp = e.target;
    if (inp.dataset?.act !== "w") return;
    const i = Number(inp.dataset.i);
    const items = getCart();
    items[i].avgWeight = Number(inp.value) || items[i].avgWeight;
    setCart(items);
    renderOrder();
  });

  $("#copy").onclick = async () => {
    await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    showToast("JSON скопирован");
  };

  $("#send").onclick = () => {
    const body = encodeURIComponent(JSON.stringify(json, null, 2));
    location.href = `mailto:orders@zhem.kz?subject=Заявка%20каталог&body=${body}`;
  };

  $("#clear").onclick = () => { setCart([]); renderOrder(); updateCartBadge(); };
  updateCartBadge();
}

/* ========================== ROUTER ========================== */
document.addEventListener("DOMContentLoaded", () => {
  if ($("#grid")) { renderGrid(); document.body.insertAdjacentHTML('beforeend', Tabbar('cat')); }
  if ($("#product")) renderProduct();
  if ($("#order")) renderOrder();
  updateCartBadge();
});