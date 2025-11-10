// Минимальный JS: каталог товаров, PDP и заказ (localStorage)
const PRODUCTS = [
  {
    id: "R-001",
    title: "Кольцо классическое",
    code: "R-001",
    weight: 3.8,
    gold: "585",
    sizes: ["15", "16", "17", "18"],
    price: 99990,
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516632664305-eda5b463c8d3?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "E-012",
    title: "Серьги дорожки",
    code: "E-012",
    weight: 4.6,
    gold: "585",
    sizes: ["—"],
    price: 129990,
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531168556467-80aace0d0144?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: "B-104",
    title: "Браслет якорный",
    code: "B-104",
    weight: 12.3,
    gold: "585",
    sizes: ["18см", "19см", "20см"],
    price: 289990,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531168556467-80aace0d0144?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516632664305-eda5b463c8d3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=800&auto=format&fit=crop"
    ]
  }
];

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function priceFmt(n){ return new Intl.NumberFormat('ru-RU').format(n) + ' ₸'; }

// ----- Каталог -----
function renderCatalog(){
  const grid = $('.grid');
  if(!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <a class="photo" href="product.html?id=${encodeURIComponent(p.id)}">
        <img src="${p.images[0]}" alt="${p.title}" loading="lazy">
      </a>
      <div class="info">
        <div class="code">АРТ: ${p.code}</div>
        <div class="title">${p.title}</div>
        <div class="meta">Вес: ${p.weight} г · Проба: ${p.gold}</div>
        <select class="size" data-id="${p.id}">
          ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <div class="actions">
          <button class="btn-add" data-id="${p.id}">В заказ</button>
          <a class="btn-go" href="product.html?id=${encodeURIComponent(p.id)}">Подробнее</a>
        </div>
      </div>
    </article>
  `).join('');

  // Обработчики
  $$('.btn-add', grid).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const sel = $(`select.size[data-id="${id}"]`, grid);
      addToOrder(id, sel?.value || '');
    });
  });
}

// ----- PDP -----
function renderPDP(){
  const wrap = $('#pdp-root');
  if(!wrap) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];

  wrap.innerHTML = `
    <div class="pdp">
      <div class="media">
        <img id="main-photo" src="${p.images[0]}" alt="${p.title}">
        <div class="thumbs">
          ${p.images.map((src,i)=>`<img src="${src}" data-i="${i}" alt="thumb">`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="code">АРТ: ${p.code}</div>
        <h2 style="margin:6px 0 10px">${p.title}</h2>
        <div class="kv">
          <div class="k">Вес</div><div>${p.weight} г</div>
          <div class="k">Проба</div><div>${p.gold}</div>
          <div class="k">Цена (примерно)</div><div>${priceFmt(p.price)}</div>
        </div>
        <label style="display:block;margin:12px 0 6px">Размер</label>
        <select id="size-select" class="size">
          ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <div class="actions" style="margin-top:14px">
          <button class="btn-add" onclick="addToOrder('${p.id}', document.getElementById('size-select').value)">Добавить в заказ</button>
          <a class="btn-go" href="order.html">Перейти к заказу</a>
        </div>
      </div>
    </div>
  `;
  $$('.thumbs img', wrap).forEach(img=>{
    img.addEventListener('click', ()=> { $('#main-photo').src = img.src; });
  });
}

// ----- Заказ (localStorage) -----
const LS_KEY = 'zhem_order';

function getOrder(){
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}
function saveOrder(arr){
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
  updateOrderBadge();
}
function addToOrder(id, size){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  const order = getOrder();
  order.push({ id: p.id, code: p.code, title: p.title, size, weight: p.weight, price: p.price });
  saveOrder(order);
  alert('Добавлено в заказ: ' + p.title + (size ? ` (размер ${size})` : ''));
}
function removeFromOrder(idx){
  const order = getOrder();
  order.splice(idx,1);
  saveOrder(order);
  renderOrderTable();
}
function clearOrder(){
  if(confirm('Очистить заказ?')){
    saveOrder([]);
    renderOrderTable();
  }
}
function renderOrderTable(){
  const table = $('#order-table-body');
  const totalEl = $('#order-total');
  if(!table) return;
  const order = getOrder();
  table.innerHTML = order.map((row, i) => `
    <tr>
      <td>${row.code}</td>
      <td>${row.title}</td>
      <td>${row.size || '—'}</td>
      <td>${row.weight} г</td>
      <td>${priceFmt(row.price)}</td>
      <td class="row-actions">
        <button class="btn-outline" onclick="removeFromOrder(${i})">Удалить</button>
      </td>
    </tr>
  `).join('');
  const total = order.reduce((s,x)=>s+(x.price||0),0);
  totalEl.textContent = priceFmt(total);
}
function updateOrderBadge(){
  const n = getOrder().length;
  const link = document.querySelector('a[href="order.html"]');
  if(!link) return;
  link.innerHTML = n ? `Заказ <span class="badge">${n}</span>` : 'Заказ';
}

// Инициализация на каждой странице
document.addEventListener('DOMContentLoaded', () => {
  if ($('.grid')) renderCatalog();
  if ($('#pdp-root')) renderPDP();
  if ($('#order-table-body')) renderOrderTable();
  updateOrderBadge();
});
