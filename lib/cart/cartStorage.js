const KEY = "rivaan_cart_v1";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getCartItems() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  const items = safeJsonParse(raw, []);
  return Array.isArray(items) ? items : [];
}

export function setCartItems(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(Array.isArray(items) ? items : []));
}

export function addToCart(item) {
  const current = getCartItems();
  const id = String(item?.id ?? item?.slug ?? "");
  const color = String(item?.selectedColor ?? "");
  const size = String(item?.selectedSize ?? "");

  const next = [...current];
  const idx = next.findIndex((it) => String(it.id) === id && String(it.selectedColor || "") === color && String(it.selectedSize || "") === size);

  if (idx >= 0) {
    next[idx] = { ...next[idx], qty: Math.min(99, Number(next[idx].qty || 1) + Number(item.qty || 1)) };
  } else {
    next.push({
      id,
      slug: item.slug || id,
      name: item.name || "Product",
      category: item.category || "",
      image: item.image || "/images/products/polo.svg",
      price: Number(item.price || 0),
      offerPrice: Number(item.offerPrice || 0),
      selectedColor: color,
      selectedSize: size,
      qty: Math.max(1, Math.min(99, Number(item.qty || 1)))
    });
  }

  setCartItems(next);
  return next;
}

export function updateCartItemQty(index, qty) {
  const current = getCartItems();
  const next = [...current];
  if (!next[index]) return current;
  next[index] = { ...next[index], qty: Math.max(1, Math.min(99, Number(qty || 1))) };
  setCartItems(next);
  return next;
}

export function removeCartItem(index) {
  const current = getCartItems();
  const next = current.filter((_, i) => i !== index);
  setCartItems(next);
  return next;
}

