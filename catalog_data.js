// Жемчужина · реальные данные каталога

// Подключаем все модели из JSON
import PRODUCTS from "./products.json" assert { type: "json" };

// Размерная линейка: 15.0–23.5 с шагом 0.5
const SIZES = [];
for (let v = 15.0; v <= 23.5; v += 0.5) SIZES.push(v.toFixed(1));
