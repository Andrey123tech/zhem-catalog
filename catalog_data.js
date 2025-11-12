// Жемчужина · данные каталога (v3)
// Категории и позиции. Фото: img/{SKU}_900.jpg
// Размеры по умолчанию: 14–20 (можно расширить)

export const DEFAULT_SIZES = ["14","15","16","17","18","19","20"];

export const CATEGORIES = [
  {
    id: "rings_stone",
    title: "Жесткие кольца с камнем",
    type: "rings",
    items: [
      { sku: "190131", weight: 1.72, images: ["img/190131_900.jpg"] },
      { sku: "190059", weight: 1.12, images: ["img/190059_900.jpg"] },
      { sku: "190037", weight: 1.12, images: ["img/190037_900.jpg"] },
      { sku: "190020", weight: 1.14, images: ["img/190020_900.jpg"] },
      { sku: "190024", weight: 0.97, images: ["img/190024_900.jpg"] },
      { sku: "190548", weight: 1.15, images: ["img/190548_900.jpg"] },
      { sku: "190056", weight: 1.50, images: ["img/190056_900.jpg"] },
      { sku: "190573", weight: 1.39, images: ["img/190573_900.jpg"] },
      { sku: "190567", weight: 1.84, images: ["img/190567_900.jpg"] },
      { sku: "190026", weight: 0.93, images: ["img/190026_900.jpg"] }
    ]
  },
  {
    id: "rings_plain",
    title: "Женские кольца без камня",
    type: "rings",
    items: [
      { sku: "185800", weight: 2.57, images: ["img/185800_900.jpg"] }
    ]
  }
];
