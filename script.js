/* Жемчужина · B2B каталог
 * Каталог, карточка, корзина.
 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const CART_KEY = "zhem_cart_v1";

// Номер менеджера для WhatsApp (без +, без пробелов)
const MANAGER_PHONE = "77012271519"; // <-- сюда поставь свой номер

/* === ХРАНЕНИЕ КОРЗИНЫ === */

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch(e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/* === БЕЙДЖ КОРЗИНЫ === */

function updateCartBadge() {
  const cart = loadCart();
  const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);
  const badge = $("#cartCount");
  if (badge) badge.textContent = totalQty;
}

/* === УТИЛИТЫ === */

function formatWeight(w) {
  if (w == null || isNaN(w)) return "";
  const num = Number(w);
  return num.toFixed(num >= 10 ? 1 : 2).replace(".", ",");
}

function getSkuFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("sku");
}

/* === КАТАЛОГ (СЕТКА) === */

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
        <div class="square"><img src="${img}" alt="${p.title || p.sku}"></div>
        <div class="tile-body">
          <div class="tile-title">${shortTitle}</div>
          <div class="tile-sub">
            <span class="tile-art">Арт. ${p.sku}</span>
            ${w ? `<span class="tile-weight">${w}</span>` : ""}
          </div>
        </div>
      </a>
    `;
  }).join("");
}

/* === КАРТОЧКА ТОВАРА === */

function renderProduct() {
  const box = $("#product");
  if (!box) return;

  const sku = getSkuFromUrl();
  const prod = PRODUCTS.find(p => p.sku === sku);
  if (!prod) {
    box.innerHTML = "<p>Товар не найден.</p>";
    return;
  }

  const img = (prod.images && prod.images[0]) || "https://picsum.photos/seed/placeholder/900";
  const w = prod.avgWeight != null ? formatWeight(prod.avgWeight) + " г" : "";

  // Берём общую размерную линейку из catalog_data.js
  const sizes = (typeof SIZES !== "undefined" && Array.isArray(SIZES) && SIZES.length)
    ? SIZES
    : (prod.sizes && prod.sizes.length ? prod.sizes : ["18.0", "18.5", "19.0"]);

  // Состояние: количество по каждому размеру
  const sizeState = new Map();
  sizes.forEach(s => sizeState.set(String(s), 0));

  box.innerHTML = `
    <div class="product-main">
      <div class="product-photo-wrap">
        <img src="${img}" alt="${prod.title || prod.sku}">
      </div>

      <div class="product-meta">
  <h1 class="product-title">
    Кольцо · Арт. ${prod.sku}
  </h1>
  ${w ? `<div class="product-weight">Средний вес ~ ${w}</div>` : ""}
</div>

      <div class="product-controls">
  <div class="product-controls-row">
    <div class="field">
      <div class="field-control">
        <button id="sizeMatrixOpen" type="button" class="size-picker-display">
          <span id="sizeMatrixSummary">Выбрать размеры</span>
          <span class="size-picker-arrow">▾</span>
        </button>
      </div>
    </div>
  </div>

  <button id="addToCart" class="btn-primary" type="button">
    В корзину
   </button>
  </div>
 </div>
 `;

  const btnAdd      = $("#addToCart", box);
  const btnSizeOpen = $("#sizeMatrixOpen", box);
  const summaryEl   = $("#sizeMatrixSummary", box);

  // === МОДАЛЬНОЕ ОКНО С МАТРИЦЕЙ РАЗМЕРОВ ===

  const modal = document.createElement("div");
  modal.id = "sizeMatrixModal";
  modal.className = "size-matrix-backdrop hidden";
  modal.innerHTML = `
    <div class="size-matrix-sheet">
      <div class="size-matrix-header">Размеры · Арт. ${prod.sku}</div>
      <div class="size-matrix-list">
        ${sizes.map(s => `
          <div class="size-row" data-size="${s}">
            <div class="size-row-size">р-р ${s}</div>
            <div class="size-row-qty">
              <button type="button" data-act="dec" data-size="${s}">−</button>
              <span data-size="${s}">0</span>
              <button type="button" data-act="inc" data-size="${s}">+</button>
            </div>
          </div>
        `).join("")}
      </div>
      <button type="button" class="btn-primary size-matrix-done" id="sizeMatrixDone">
        Готово
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  const updateSummary = () => {
    let total = 0;
    sizeState.forEach(q => { total += q || 0; });
    if (!summaryEl) return;
    summaryEl.textContent = total > 0
      ? `Выбрано: ${total} шт.`
      : "Выбрать размеры";
  };

  const syncDomFromState = () => {
    sizes.forEach(s => {
      const span = modal.querySelector(`.size-row-qty span[data-size="${s}"]`);
      if (span) span.textContent = String(sizeState.get(String(s)) || 0);
    });
  };

  const openModal = () => {
    syncDomFromState();
    modal.classList.remove("hidden");
    document.body.classList.add("no-scroll");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("no-scroll");
    updateSummary();
  };

  if (btnSizeOpen) {
    btnSizeOpen.addEventListener("click", openModal);
  }

  // клик по фону — закрыть
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // клики внутри модалки: плюс/минус и "Готово"
  modal.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.id === "sizeMatrixDone") {
      closeModal();
      return;
    }

    const act = btn.dataset.act;
    const size = btn.dataset.size;
    if (!act || !size) return;

    const key = String(size);
    let current = sizeState.get(key) || 0;

    if (act === "inc") current = Math.min(999, current + 1);
    if (act === "dec") current = Math.max(0, current - 1);

    sizeState.set(key, current);

    const span = modal.querySelector(`.size-row-qty span[data-size="${key}"]`);
    if (span) span.textContent = String(current);
  });

  const addStateToCart = () => {
    const cart = loadCart();

    sizeState.forEach((qty, size) => {
      if (!qty) return;

      const existing = cart.find(
        it => it.sku === prod.sku && String(it.size) === String(size)
      );

      if (existing) {
        existing.qty = Math.min(999, (existing.qty || 0) + qty);
      } else {
        cart.push({
          sku: prod.sku,
          size,
          qty,
          avgWeight: prod.avgWeight != null ? prod.avgWeight : null,
          image: img,
          title: prod.title || ("Кольцо " + prod.sku)
        });
      }
    });

    saveCart(cart);
  };

  if (btnAdd) {
    btnAdd.onclick = () => {
      // проверка — есть ли вообще что-то выбрано
      let hasQty = false;
      sizeState.forEach(q => { if (q > 0) hasQty = true; });

      if (!hasQty) {
        toast("Выберите хотя бы один размер");
        return;
      }

      addStateToCart();
      animateAddToCart(btnAdd);
      toast("Добавлено в корзину");

      // сбрасываем выбор после добавления
      sizeState.forEach((_, key) => sizeState.set(key, 0));
      syncDomFromState();
      updateSummary();
    };
  }
}

/* === КОРЗИНА: ОБЩИЙ СПИСОК (группировка по артикулу) === */

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

  // Группируем позиции корзины по артикулу
  const groupsMap = new Map();
  cart.forEach((it) => {
    const prod = PRODUCTS.find(p => p.sku === it.sku) || {};
    const img = it.image || (prod.images && prod.images[0]) || "https://picsum.photos/seed/placeholder/200";
    const avgW = it.avgWeight != null ? it.avgWeight : prod.avgWeight;

    let g = groupsMap.get(it.sku);
    if (!g) {
      g = {
        sku: it.sku,
        title: prod.title || ("Кольцо " + it.sku),
        image: img,
        avgWeight: avgW,
        totalQty: 0,
        totalWeight: 0
      };
      groupsMap.set(it.sku, g);
    }

    const qty = it.qty || 0;
    g.totalQty += qty;
    if (avgW != null) {
      g.totalWeight += (Number(avgW) || 0) * qty;
    }
  });

  const groups = Array.from(groupsMap.values());

  const rows = groups.map(g => {
    const totalW = g.totalWeight && !isNaN(g.totalWeight) ? formatWeight(g.totalWeight) + " г" : "";
    const totalLine = totalW
      ? `Всего: ${g.totalQty} шт · ~ ${totalW}`
      : `Всего: ${g.totalQty} шт`;

    return `
      <div class="list-item cart-row" data-sku="${g.sku}">
        <div class="cart-thumb">
          <img src="${g.image}" alt="">
        </div>
        <div class="cart-meta">
          <div class="badge">Арт. ${g.sku}</div>
          <div class="cart-title">
            ${g.title}
          </div>
          <div class="cart-sub">
            ${totalLine}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Общие итоги по всей корзине
  const totalWeight = cart.reduce((s, it) => {
    const prod = PRODUCTS.find(p => p.sku === it.sku) || {};
    const w = it.avgWeight != null ? it.avgWeight : prod.avgWeight;
    return s + (Number(w) || 0) * (it.qty || 0);
  }, 0);
  const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);

  box.innerHTML = `
    <div class="list">${rows}</div>
    <div style="height:10px"></div>
    <div class="card order-summary-card">
      <div class="section-title">Итого</div>
      <div class="order-summary-text">
        Позиции: ${groups.length}, штук: ${totalQty}, вес ~ ${formatWeight(totalWeight)} г
      </div>
      <div class="order-actions">
        <button id="clearOrder" class="btn small order-action-btn" type="button">Очистить</button>
        <button id="copyOrder" class="btn small order-action-btn" type="button">Скопировать</button>
      </div>
    </div>
    <div class="order-bottom-space"></div>
  `;

  // Клик по строке модели — переходим в детальное редактирование этой модели
  box.onclick = function(e) {
    const row = e.target.closest(".cart-row");
    if (!row) return;
    const sku = row.dataset.sku;
    if (!sku) return;
    window.location.href = "order_item.html?sku=" + encodeURIComponent(sku);
  };

  // копирование заявки (как и раньше)
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

/* === КАРТОЧКА МОДЕЛИ В КОРЗИНЕ (по одному артикулу) === */

function renderOrderItem() {
  const box = $("#orderItem");
  if (!box) { updateCartBadge(); return; }

  const params = new URLSearchParams(window.location.search);
  const sku = params.get("sku");
  if (!sku) {
    box.innerHTML = "<div class='card'>Не указан артикул.</div>";
    return;
  }

  const cart = loadCart();
  let items = cart.filter(it => it.sku === sku);
  // сортируем размеры от меньшего к большему
  items.sort((a, b) => parseFloat(a.size) - parseFloat(b.size));
  if (!items.length) {
    box.innerHTML = "<div class='card'>В корзине нет позиций по артикулу " + sku + ".</div>";
    return;
  }

  const prod = PRODUCTS.find(p => p.sku === sku) || {};
  const img = items[0].image || (prod.images && prod.images[0]) || "https://picsum.photos/seed/placeholder/900";
  const avgW = items[0].avgWeight != null ? items[0].avgWeight : prod.avgWeight;
  const title = prod.title || ("Кольцо " + sku);

  function calcSummary(list) {
    const totalQty = list.reduce((s, it) => s + (it.qty || 0), 0);
    const totalWeight = avgW != null
      ? list.reduce((s, it) => s + (it.qty || 0) * (Number(avgW) || 0), 0)
      : null;
    return { totalQty, totalWeight };
  }

  const rowsHtml = items.map(it => {
    const size = it.size;
    const qty = it.qty || 0;
    const lineWeight = avgW != null
      ? formatWeight((Number(avgW) || 0) * qty) + " г"
      : "";
    return `
      <div class="size-row" data-size="${size}">
        <div class="size-row-size">р-р ${size}</div>
        <div class="size-row-qty">
          <button type="button" data-act="dec" data-size="${size}">−</button>
          <span>${qty}</span>
          <button type="button" data-act="inc" data-size="${size}">+</button>
        </div>
        <div class="size-row-weight">${lineWeight}</div>
      </div>
    `;
  }).join("");

  const summary = calcSummary(items);
  const totalLine = summary.totalWeight != null
    ? `Всего: ${summary.totalQty} шт · ~ ${formatWeight(summary.totalWeight)} г`
    : `Всего: ${summary.totalQty} шт`;

  box.innerHTML = `
    <div class="card model-edit">
      <div class="model-photo-wrap">
        <img src="${img}" alt="${title}">
      </div>

      <div class="model-edit-body">
        <div class="model-head">
          <div class="badge">Арт. ${sku}</div>
          <div class="model-title">${title}</div>
          ${avgW != null ? `<div class="model-avg">Средний вес ~ ${formatWeight(avgW)} г</div>` : ""}
        </div>

        <div class="model-sizes-list">
          ${rowsHtml}
        </div>

        <div class="model-summary">
          ${totalLine}
        </div>

        <button id="modelDone" class="btn-primary" type="button">
          Готово
        </button>
      </div>
    </div>
  `;

  // обработчик +/- без полной перерисовки
  box.onclick = function (e) {
    const btn = e.target.closest("button");
    if (!btn || !btn.dataset.act) return;

    const act = btn.dataset.act;
    const size = btn.dataset.size;
    if (!size) return;

    let cartNow = loadCart();
    const item = cartNow.find(it => it.sku === sku && String(it.size) === String(size));
    if (!item) return;

    let qty = item.qty || 0;
    if (act === "inc") {
      qty = Math.min(999, qty + 1);
    } else if (act === "dec") {
      qty = Math.max(0, qty - 1);
    }

    const row = box.querySelector(`.size-row[data-size="${size}"]`);
    if (!row) return;

    if (qty === 0) {
      // удалить размер
      cartNow = cartNow.filter(it => !(it.sku === sku && String(it.size) === String(size)));
      row.remove();
    } else {
      item.qty = qty;
      const qtySpan = row.querySelector(".size-row-qty span");
      const weightCell = row.querySelector(".size-row-weight");
      if (qtySpan) qtySpan.textContent = String(qty);
      if (weightCell && avgW != null) {
        const lw = (Number(avgW) || 0) * qty;
        weightCell.textContent = formatWeight(lw) + " г";
      }
    }

    saveCart(cartNow);

    const remain = cartNow.filter(it => it.sku === sku);
    if (!remain.length) {
      window.location.href = "order.html";
      return;
    }

    const newSummary = calcSummary(remain);
    const summaryEl = box.querySelector(".model-summary");
    if (summaryEl) {
      summaryEl.textContent = newSummary.totalWeight != null
        ? `Всего: ${newSummary.totalQty} шт · ~ ${formatWeight(newSummary.totalWeight)} г`
        : `Всего: ${newSummary.totalQty} шт`;
    }

    updateCartBadge();
  };

  const btnDone = $("#modelDone", box);
  if (btnDone) {
    btnDone.onclick = () => {
      window.location.href = "order.html";
    };
  }

  updateCartBadge();
}

/* === ТОСТЫ === */

function toast(msg) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1800);
}

/* === АНИМАЦИЯ "УЛЁТА" В КОРЗИНУ === */

function animateAddToCart(sourceEl) {
  const cartCount = $("#cartCount");
  if (!sourceEl || !cartCount) return;

  const s = sourceEl.getBoundingClientRect();
  const c = cartCount.getBoundingClientRect();

  const dot = document.createElement("div");
  dot.className = "fly-dot";
  dot.style.position = "fixed";
  dot.style.width = "26px";
  dot.style.height = "26px";
  dot.style.borderRadius = "999px";
  dot.style.background = "#6A1F2A";
  dot.style.boxShadow = "0 0 0 2px rgba(248,250,252,0.9)";
  dot.style.left = (s.left + s.width / 2) + "px";
  dot.style.top = (s.top + s.height / 2) + "px";
  dot.style.transform = "translate(0,0) scale(1)";
  dot.style.opacity = "0.97";
  dot.style.zIndex = "999";
  dot.style.transition = "transform 0.7s ease, opacity 0.7s ease";
  document.body.appendChild(dot);

  requestAnimationFrame(() => {
    const dx = c.left + c.width / 2 - (s.left + s.width / 2);
    const dy = c.top + c.height / 2 - (s.top + s.height / 2);
    dot.style.transform = `translate(${dx}px, ${dy}px) scale(0.25)`;
    dot.style.opacity = "0";
  });

  setTimeout(() => {
    dot.remove();
  }, 750);
}

/* === СВАЙП-УДАЛЕНИЕ В КОРЗИНЕ (новая версия, для групп по артикулу) === */
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

    // небольшая анимация возврата, если строку отпустили
    currentRow.style.transition = "transform 0.2s ease, opacity 0.2s ease";
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (!currentRow) return;

    const dx = e.touches[0].clientX - startX;

    // свайп влево больше 30px — показываем "удалить"
    if (dx < -30) {
      swiped = true;
      currentRow.style.transform = "translateX(-60px)";
      currentRow.style.opacity = "0.7";
    } else if (dx > -5) {
      // чуть вернули вправо — считаем, что не свайп
      swiped = false;
      currentRow.style.transform = "";
      currentRow.style.opacity = "";
    }
  }, { passive: true });

  document.addEventListener("touchend", () => {
    if (!currentRow) return;

    if (swiped) {
      const sku = currentRow.dataset.sku;
      if (sku) {
        const confirmText = `Удалить все позиции по артикулу ${sku} из корзины?`;
        if (confirm(confirmText)) {
          // удаляем все элементы корзины с этим артикулом
          let cartNow = loadCart();
          cartNow = cartNow.filter(it => it.sku !== sku);
          saveCart(cartNow);
          renderOrder();
        } else {
          // отменили — возвращаем строку на место
          currentRow.style.transform = "";
          currentRow.style.opacity = "";
        }
      }
    } else {
      // свайпа не было — просто вернуть строку
      if (currentRow) {
        currentRow.style.transform = "";
        currentRow.style.opacity = "";
      }
    }

    currentRow = null;
    swiped = false;
  });
}

// === Жест "смахивание вправо" для возврата назад ===

(function() {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const EDGE_ZONE = 30;   // зона слева, где жест активируется
  const TRIGGER_DIST = 60; // насколько нужно провести вправо

  document.addEventListener("touchstart", e => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;

    // активировать жест только если палец в левой зоне экрана
    tracking = startX < EDGE_ZONE;
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (!tracking) return;

    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // если слишком большой вертикальный жест — отменяем
    if (Math.abs(dy) > 40) {
      tracking = false;
      return;
    }

    // если проведено вправо больше TRIGGER_DIST — назад
    if (dx > TRIGGER_DIST) {
      tracking = false;
      history.back();
    }
  }, { passive: true });

  document.addEventListener("touchend", () => {
    tracking = false;
  });
})();

/* === ROUTER === */

document.addEventListener("DOMContentLoaded", () => {
  if ($("#grid")) renderGrid();
  if ($("#product")) renderProduct();
  if ($("#order")) renderOrder();
  if ($("#orderItem")) renderOrderItem();
  updateCartBadge();
  initSwipeToDelete();
});
