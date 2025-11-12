/* Заполняй этот список своими моделями. Можно 12, 120, 1200. */
const PRODUCTS = [
  { sku: "R1254781", title: "Кольцо с фианитом", avgWeight: 3.85, images: ["https://picsum.photos/seed/r1a/900","https://picsum.photos/seed/r1b/900","https://picsum.photos/seed/r1c/900"] },
  { sku: "R1254782", title: "Кольцо дорожка", avgWeight: 4.20, images: ["https://picsum.photos/seed/r2/900"] },
  { sku: "R1254783", title: "Кольцо сердце",   avgWeight: 3.55, images: ["https://picsum.photos/seed/r3/900"] },
  { sku: "R1254784", title: "Кольцо волна",    avgWeight: 3.95, images: ["https://picsum.photos/seed/r4/900"] },
  { sku: "R1254785", title: "Кольцо дорожка 2",avgWeight: 4.10, images: ["https://picsum.photos/seed/r5/900"] },
  { sku: "R1254786", title: "Кольцо объёмное", avgWeight: 4.60, images: ["https://picsum.photos/seed/r6/900"] },
  { sku: "R1254787", title: "Кольцо с камнями",avgWeight: 3.75, images: ["https://picsum.photos/seed/r7/900"] },
  { sku: "R1254788", title: "Кольцо классика", avgWeight: 3.40, images: ["https://picsum.photos/seed/r8/900"] },
  { sku: "R1254789", title: "Кольцо плетение", avgWeight: 3.65, images: ["https://picsum.photos/seed/r9/900"] },
  { sku: "R1254790", title: "Кольцо авангард", avgWeight: 3.20, images: ["https://picsum.photos/seed/r10/900"] },
  { sku: "R1254791", title: "Кольцо дуо",      avgWeight: 3.95, images: ["https://picsum.photos/seed/r11/900"] },
  { sku: "R1254792", title: "Кольцо минимал",  avgWeight: 3.60, images: ["https://picsum.photos/seed/r12/900"] }
];

const SIZES = [];
for (let v = 15.0; v <= 23.5; v += 0.5) SIZES.push(v.toFixed(1));
