const KEY = "rivaan_wishlist_v1";
const EVENT = "rivaan_wishlist_updated";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getWishlistItems() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  const items = safeJsonParse(raw, []);
  return Array.isArray(items) ? items : [];
}

export function setWishlistItems(items) {
  if (typeof window === "undefined") return;
  const safe = Array.isArray(items) ? items : [];
  window.localStorage.setItem(KEY, JSON.stringify(safe));
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { items: safe } }));
  } catch {
    try {
      window.dispatchEvent(new Event(EVENT));
    } catch {
      // ignore
    }
  }
}

export function onWishlistChange(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = (e) => {
    const items = e?.detail?.items;
    callback(Array.isArray(items) ? items : getWishlistItems());
  };
  window.addEventListener(EVENT, handler);
  const storageHandler = (e) => {
    if (e?.key !== KEY) return;
    callback(getWishlistItems());
  };
  window.addEventListener("storage", storageHandler);

  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export function getWishlistCount(items = null) {
  const list = Array.isArray(items) ? items : getWishlistItems();
  return list.length;
}

function normalizeId(value) {
  const v = String(value ?? "").trim();
  return v;
}

export function isInWishlist(id) {
  const key = normalizeId(id);
  if (!key) return false;
  return getWishlistItems().some((it) => normalizeId(it?.id) === key);
}

export function addToWishlist(item) {
  const current = getWishlistItems();
  const id = normalizeId(item?.id ?? item?.slug ?? "");
  if (!id) return current;

  if (current.some((it) => normalizeId(it?.id) === id)) return current;

  const next = [
    ...current,
    {
      id,
      slug: item?.slug || id,
      name: item?.name || "Product",
      category: item?.category || "",
      image: item?.image || "/images/products/polo.svg",
      price: Number(item?.price || 0),
      offerPrice: Number(item?.offerPrice || 0),
      rating: Number(item?.rating || 4.6),
      reviews: Number(item?.reviews || 0),
      colors: Array.isArray(item?.colors) ? item.colors : [],
      sizes: Array.isArray(item?.sizes) ? item.sizes : [],
      tag: item?.tag || ""
    }
  ];

  setWishlistItems(next);
  return next;
}

export function removeFromWishlist(id) {
  const key = normalizeId(id);
  const current = getWishlistItems();
  const next = current.filter((it) => normalizeId(it?.id) !== key);
  setWishlistItems(next);
  return next;
}

export function toggleWishlist(item) {
  const id = normalizeId(item?.id ?? item?.slug ?? "");
  if (!id) return { items: getWishlistItems(), added: false };
  if (isInWishlist(id)) return { items: removeFromWishlist(id), added: false };
  return { items: addToWishlist(item), added: true };
}

