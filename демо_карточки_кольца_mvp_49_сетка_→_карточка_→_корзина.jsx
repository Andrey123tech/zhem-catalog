import React, { useMemo, useState } from "react";

// 👉 Мини‑MVP. Без бэкенда, без цен. Фокус на UX оптового заказа:
// 1) Большое фото + мини‑галерея
// 2) Артикул, название, краткое описание, средний вес (ручной ввод)
// 3) Выбор размера (15.0–23.5), количество (±)
// 4) Добавить в заказ → Корзина с редактированием, примерным весом заявки
// 5) Кнопка "Сохранить заявку" (копирование JSON) — на практике здесь будет отправка менеджеру/в БД/в 1С

const genSizes = () => {
  const sizes: string[] = [];
  for (let v = 15.0; v <= 23.5; v += 0.5) sizes.push(v.toFixed(1));
  return sizes;
};

const SIZES = genSizes();

// Демо‑данные товара
const PRODUCT = {
  sku: "R1254789",
  title: "Кольцо с фианитом",
  subtitle: "Лаконичная посадка. Национальные мотивы.",
  avgWeight: 3.85, // средний вес одного изделия — вручную; позже из 1С
  images: [
    "https://picsum.photos/seed/ring125/900/900",
    "https://picsum.photos/seed/ring126/900/900",
    "https://picsum.photos/seed/ring127/900/900",
  ],
};

// Утилиты
function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

// Компонент счётчика
function Qty({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border px-2 py-1">
      <button
        className="rounded-xl border px-2 py-1 text-sm hover:bg-gray-50 active:scale-95"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        −
      </button>
      <span className="w-8 text-center tabular-nums">{value}</span>
      <button
        className="rounded-xl border px-2 py-1 text-sm hover:bg-gray-50 active:scale-95"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

export default function RingCardDemo() {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string>("18.0");
  const [qty, setQty] = useState<number>(1);
  const [avgWeight, setAvgWeight] = useState<number>(PRODUCT.avgWeight);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<{
    sku: string;
    title: string;
    size: string;
    qty: number;
    avgWeight: number;
  }[]>([]);

  const estOrderWeight = useMemo(
    () => cart.reduce((sum, it) => sum + it.qty * it.avgWeight, 0),
    [cart]
  );

  const addToCart = () => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.sku === PRODUCT.sku && i.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty, avgWeight };
        return next;
      }
      return [...prev, { sku: PRODUCT.sku, title: PRODUCT.title, size, qty, avgWeight }];
    });
    setCartOpen(true);
  };

  const updateCartItem = (i: number, patch: Partial<{ qty: number; avgWeight: number }>) => {
    setCart((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };

  const removeCartItem = (i: number) => setCart((prev) => prev.filter((_, idx) => idx !== i));

  const jsonOrder = useMemo(
    () =>
      JSON.stringify(
        {
          created_at: new Date().toISOString(),
          items: cart,
          est_total_weight_g: Number(estOrderWeight.toFixed(2)),
          note: "Цена не отображается. Сухой сбор заявки. Позже — 1С",
        },
        null,
        2
      ),
    [cart, estOrderWeight]
  );

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonOrder);
      alert("Заявка (JSON) скопирована в буфер обмена. Можно вставить в чат менеджеру.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="font-semibold">ЖЕМЧУЖИНА · B2B · ДЕМО</div>
          <button
            onClick={() => setCartOpen(true)}
            className="rounded-2xl border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Корзина · {cart.length} поз.
          </button>
        </div>
      </div>

      {/* Page */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-6 md:grid-cols-2">
        {/* LEFT: Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border">
            <img
              src={PRODUCT.images[activeImage]}
              alt="Кольцо"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-3 flex gap-3">
            {PRODUCT.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={classNames(
                  "aspect-square w-20 overflow-hidden rounded-xl border",
                  activeImage === i && "ring-2 ring-black"
                )}
              >
                <img src={src} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Info + CTA */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-sm text-gray-500">Артикул: {PRODUCT.sku}</div>
            <h1 className="mt-1 text-2xl font-semibold">{PRODUCT.title}</h1>
            <p className="mt-1 text-gray-600">{PRODUCT.subtitle}</p>
          </div>

          {/* Средний вес */}
          <div className="rounded-2xl border p-3">
            <label className="block text-sm text-gray-500">Средний вес (г) — можно править вручную</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={0.1}
                step={0.01}
                value={avgWeight}
                onChange={(e) => setAvgWeight(Number(e.target.value))}
                className="w-32 rounded-xl border px-3 py-2"
              />
              <span className="text-sm text-gray-500">Позже вес подтянем из 1С</span>
            </div>
          </div>

          {/* Размеры */}
          <div>
            <div className="mb-2 text-sm text-gray-500">Размер</div>
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div className="max-h-64 w-24 overflow-auto rounded-2xl border p-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={classNames(
                      "mb-2 w-full rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50",
                      size === s && "border-black bg-black text-white"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-500 self-start">
                Прокрутка вверх/вниз — выберите нужный размер. Диапазон 15.0–23.5 можно расширить.
              </div>
            </div>
          </div>

          {/* Количество */}
          <div>
            <div className="mb-2 text-sm text-gray-500">Количество</div>
            <Qty value={qty} onChange={setQty} />
          </div>

          {/* CTA */}
          <div className="mt-2 flex gap-3">
            <button
              onClick={addToCart}
              className="flex-1 rounded-2xl bg-black px-4 py-3 font-medium text-white shadow-sm active:scale-[.99]"
            >
              Добавить в заказ
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="rounded-2xl border px-4 py-3 font-medium hover:bg-gray-50"
            >
              Открыть корзину
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Цена не отображается (сухой сбор заявки). Позже подключим цены/остатки из 1С. Разные размеры могут иметь разный вес.
          </div>
        </div>
      </div>

      {/* CART PANEL */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="h-full w-full bg-black/20" onClick={() => setCartOpen(false)} />
          <div className="ml-auto h-full w-full max-w-md border-l bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-semibold">Корзина</div>
              <button className="rounded-xl border px-3 py-1.5 hover:bg-gray-50" onClick={() => setCartOpen(false)}>
                Закрыть
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-sm text-gray-500">Корзина пуста</div>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((it, i) => (
                  <div key={i} className="rounded-2xl border p-3">
                    <div className="text-sm text-gray-500">Арт. {it.sku}</div>
                    <div className="mt-0.5 font-medium">{it.title}</div>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Размер</div>
                        <div className="rounded-xl border px-3 py-2 text-sm">{it.size}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Кол-во</div>
                        <Qty
                          value={it.qty}
                          onChange={(v) => updateCartItem(i, { qty: Math.max(1, v) })}
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Средний вес (г)</div>
                        <input
                          type="number"
                          min={0.1}
                          step={0.01}
                          value={it.avgWeight}
                          onChange={(e) => updateCartItem(i, { avgWeight: Number(e.target.value) })}
                          className="w-28 rounded-xl border px-3 py-2"
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          className="rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => removeCartItem(i)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-1 rounded-2xl border p-3">
                  <div className="text-sm text-gray-500">Примерный общий вес заявки</div>
                  <div className="text-2xl font-semibold">
                    {estOrderWeight.toFixed(2)} г
                  </div>
                </div>

                <div className="rounded-2xl border p-3">
                  <div className="mb-2 text-sm text-gray-500">Заявка (JSON для передачи менеджеру / в бота / в 1С)</div>
                  <textarea
                    readOnly
                    value={jsonOrder}
                    className="h-40 w-full resize-none rounded-xl border p-2 font-mono text-xs"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={copyJSON}
                      className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Скопировать
                    </button>
                    <button
                      onClick={() => alert("Демо: здесь будет отправка менеджеру / в бота / на API")}
                      className="rounded-2xl bg-black px-3 py-2 text-sm text-white"
                    >
                      Отправить менеджеру
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-gray-500">
        MVP‑демо. Цены не показаны. Цель: быстрый сбор заявок. Интеграции: Telegram/1С/CRM — на следующих шагах.
      </div>
    </div>
  );
}
