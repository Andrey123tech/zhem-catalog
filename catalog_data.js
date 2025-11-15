// Жемчужина · реальные данные каталога

// Все модели: жесткие кольца с камнем + одно без камня
// Фото: img/<SKU>_900.jpg

const PRODUCTS = [
  // Жесткие кольца с камнем
  { sku: "190131", title: "Кольцо 190131", avgWeight: 1.72, images: ["img/190131_900.jpg"] },
  { sku: "190059", title: "Кольцо 190059", avgWeight: 1.12, images: ["img/190059_900.jpg"] },
  { sku: "190037", title: "Кольцо 190037", avgWeight: 1.12, images: ["img/190037_900.jpg"] },
  { sku: "190020", title: "Кольцо 190020", avgWeight: 1.14, images: ["img/190020_900.jpg"] },
  { sku: "190024", title: "Кольцо 190024", avgWeight: 0.97, images: ["img/190024_900.jpg"] },
  { sku: "190548", title: "Кольцо 190548", avgWeight: 1.15, images: ["img/190548_900.jpg"] },
  { sku: "190056", title: "Кольцо 190056", avgWeight: 1.50, images: ["img/190056_900.jpg"] },
  { sku: "190573", title: "Кольцо 190573", avgWeight: 1.39, images: ["img/190573_900.jpg"] },
  { sku: "190567", title: "Кольцо 190567", avgWeight: 1.84, images: ["img/190567_900.jpg"] },
  { sku: "190026", title: "Кольцо 190026", avgWeight: 0.93, images: ["img/190026_900.jpg"] },

  // Дополнительная модель (фото есть, веса пока нет)
  { sku: "190023", title: "Кольцо 190023", avgWeight: 1.30, images: ["img/190023_900.jpg"] },

  // Женские кольца без камня
  { sku: "185800", title: "Кольцо 185800", avgWeight: 2.57, images: ["img/185800_900.jpg"] }
];

// Размерная линейка: 15.0–23.5 с шагом 0.5
const SIZES = [];
for (let v = 15.0; v <= 23.5; v += 0.5) SIZES.push(v.toFixed(1));
