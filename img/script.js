// ES-module: импортируем PRODUCTS и рисуем сетку для catalog.html
import { PRODUCTS } from './catalog_data.js';

const grid = document.querySelector('#grid');
if (grid) {
  const html = PRODUCTS.map(p => `
    <a class="tile" href="product.html?sku=${encodeURIComponent(p.sku)}">
      <div class="square"><img src="${(p.images && p.images[0]) || ''}" alt="${p.sku}"></div>
      <div class="tile-body">
        <div class="tile-title">${p.title || ('Кольцо ' + p.sku)}</div>
        <div class="tile-sub">SKU: ${p.sku}</div>
      </div>
    </a>
  `).join('');
  grid.innerHTML = html;
}
