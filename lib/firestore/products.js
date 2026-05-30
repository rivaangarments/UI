import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toNumber(value, fallback = 0) {
  const num = typeof value === "number" ? value : Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(num) ? num : fallback;
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function storagePathFromGsUrl(gsUrl) {
  const value = String(gsUrl || "").trim();
  if (!value.startsWith("gs://")) return null;
  // gs://bucket/path/to/file
  const withoutScheme = value.slice("gs://".length);
  const firstSlash = withoutScheme.indexOf("/");
  if (firstSlash === -1) return null;
  return withoutScheme.slice(firstSlash + 1);
}

async function safeDownloadURL(path) {
  try {
    return await getDownloadURL(ref(storage, String(path).replace(/^\/+/, "")));
  } catch {
    return null;
  }
}

async function resolveImage(data, slug) {
  const directRaw =
    data.image ||
    data.imageUrl ||
    data.thumbnail ||
    (Array.isArray(data.images) ? data.images[0] : null) ||
    (Array.isArray(data.gallery) ? data.gallery[0] : null);

  if (typeof directRaw === "string" && directRaw.trim()) {
    const direct = directRaw.trim();
    if (direct.startsWith("http://") || direct.startsWith("https://") || direct.startsWith("/")) return direct;
    // Many setups store a Storage path or a gs:// URL inside "image".
    const gsPath = storagePathFromGsUrl(direct);
    const storagePath = String(gsPath || direct).replace(/^\/+/, "");
    // On the server, avoid Firebase Storage SDK calls (can fail in Node runtime).
    // Client components (gallery/cards) will resolve Storage paths to download URLs.
    if (typeof window === "undefined") return "/images/products/polo.svg";
    return (await safeDownloadURL(storagePath)) || "/images/products/polo.svg";
  }

  if (data.imagePath) {
    const path = String(data.imagePath || "").trim();
    if (!path) return "/images/products/polo.svg";
    const gsPath = storagePathFromGsUrl(path);
    const storagePath = String(gsPath || path).replace(/^\/+/, "");
    if (typeof window === "undefined") return "/images/products/polo.svg";
    return (await safeDownloadURL(storagePath)) || "/images/products/polo.svg";
  }

  return "/images/products/polo.svg";
}

async function resolveGallery(data, primaryImage) {
  const raw = (Array.isArray(data.gallery) && data.gallery.length && data.gallery) ||
    (Array.isArray(data.images) && data.images.length && data.images) ||
    [];

  if (!raw.length) return [primaryImage].filter(Boolean);

  const urls = await Promise.all(
    raw.map(async (value) => {
      if (typeof value !== "string" || !value.trim()) return null;
      const item = value.trim();
      if (item.startsWith("http://") || item.startsWith("https://") || item.startsWith("/")) return item;
      const gsPath = storagePathFromGsUrl(item);
      const storagePath = String(gsPath || item).replace(/^\/+/, "");
      if (typeof window === "undefined") return storagePath;
      return safeDownloadURL(storagePath);
    })
  );

  return urls.filter(Boolean);
}

function normalizeTimestamp(value) {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  // Firestore Timestamp
  if (value && typeof value.toMillis === "function") return value.toMillis();
  return null;
}

function toBool(value) {
  if (value === true || value === false) return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes") return true;
    if (v === "false" || v === "0" || v === "no") return false;
  }
  return false;
}

async function normalizeProduct(document) {
  const data = document.data();
  const name = data.name || data.title || data.productName || document.id;
  // Allow "slug" to be stored as a human-readable string; normalize into a URL-safe slug.
  // Keep the original around if needed.
  const rawSlug = data.slug || data.handle || data.urlKey || null;
  const slug = slugify(rawSlug || name) || document.id;
  const rawCategory =
    data.categoryName ??
    data.category ??
    data.categorySlug ??
    data.categoryId ??
    data.category_name ??
    data.category_slug ??
    data.category_id ??
    "Premium";

  const category =
    typeof rawCategory === "string"
      ? rawCategory
      : Array.isArray(rawCategory)
        ? String(rawCategory[0] || "Premium")
        : String(rawCategory || "Premium");

  const categoryId = data.categoryId ?? data.category_id ?? null;
  const categorySlug = data.categorySlug ?? data.category_slug ?? normalizeKey(category);
  const categories = Array.isArray(data.categories)
    ? data.categories.map((v) => String(v))
    : Array.isArray(data.categoryIds)
      ? data.categoryIds.map((v) => String(v))
      : null;

  const image = await resolveImage(data, slug);
  const gallery = await resolveGallery(data, image);

  const price = toNumber(
    data.price ?? data.mrp ?? data.mrpPrice ?? data.mrp_price ?? data.originalPrice ?? data.original_price,
    0
  );
  const offerPrice = toNumber(
    data.offerPrice ??
      data.salePrice ??
      data.sellingPrice ??
      data.selling_price ??
      data.discountPrice ??
      data.discount_price ??
      data.price,
    0
  );

  return {
    id: document.id,
    slug,
    rawSlug: rawSlug ? String(rawSlug) : null,
    name,
    category,
    categoryId,
    categorySlug,
    categories,
    gender: data.gender || data.for || "Unisex",
    price: price || offerPrice || 0,
    offerPrice: offerPrice || price || 0,
    rating: toNumber(data.rating, 4.6),
    reviews: toNumber(data.reviews ?? data.reviewCount, 0),
    stock: toNumber(data.stock ?? data.qty ?? data.quantity, null),
    image,
    gallery,
    colors: Array.isArray(data.colors) ? data.colors : data.color ? [data.color] : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : data.size ? [data.size] : [],
    featured: toBool(data.featured ?? data.isFeatured ?? data.is_featured),
    trending: toBool(data.trending ?? data.isTrending ?? data.is_trending),
    tag:
      data.tag ||
      (toBool(data.trending ?? data.isTrending ?? data.is_trending) ? "Trending" :
        toBool(data.featured ?? data.isFeatured ?? data.is_featured) ? "New" :
          data.isNewArrival ? "New" :
            "Premium"),
    description:
      data.description ||
      data.desc ||
      "Premium Rivaan garments crafted with refined detailing and an elevated everyday fit.",
    createdAt: normalizeTimestamp(data.createdAt ?? data.created_at ?? data.created)
  };
}

let productsPromise = null;

export async function fetchProducts({ useCache = true } = {}) {
  const collectionRef = collection(db, "products");
  const snapshot = await getDocs(collectionRef);
  const products = await Promise.all(snapshot.docs.map(normalizeProduct));

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[products] fetched", products.length, "items");
  }

  return products.sort((a, b) => {
    const aT = a.createdAt ?? 0;
    const bT = b.createdAt ?? 0;
    if (aT !== bT) return bT - aT;
    return String(a.name).localeCompare(String(b.name));
  });
}

export function fetchProductsCached() {
  // In dev, avoid holding onto stale normalized data across HMR edits,
  // but don't reset on *every* call (can cause flakey UX on slower networks).
  if (process.env.NODE_ENV !== "production" && productsPromise) return productsPromise;
  if (!productsPromise) productsPromise = fetchProducts();
  return productsPromise;
}

export async function fetchProductsByCategory(categoryKey) {
  const key = normalizeKey(categoryKey);
  if (!key) return [];

  // Try common schemas in order. If none match, fallback to client-side filter after fetching all.
  const attempts = [
    query(collection(db, "products"), where("categorySlug", "==", key)),
    query(collection(db, "products"), where("categoryId", "==", key)),
    query(collection(db, "products"), where("category", "==", key))
  ];

  for (const q of attempts) {
    try {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const products = await Promise.all(snapshot.docs.map(normalizeProduct));
        return products;
      }
    } catch {
      // ignore and continue attempts
    }
  }

  const all = await fetchProductsCached();
  return all.filter((product) => normalizeKey(product.categorySlug || product.categoryId || product.category) === key);
}

export async function fetchProductBySlug(slug) {
  const slugValue = String(slug || "").trim();
  if (!slugValue) return null;

  // Best effort: query by "slug". If the schema doesn't include slug, caller can fallback to local slugify match.
  const q = query(collection(db, "products"), where("slug", "==", slugValue), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return normalizeProduct(snapshot.docs[0]);
  return null;
}

export async function fetchProductByRouteSlug(routeSlug) {
  const slugValue = String(routeSlug || "").trim();
  if (!slugValue) return null;
  const routeKey = slugify(slugValue);

  // 1) Try explicit "slug" field.
  const bySlug = await fetchProductBySlug(slugValue);
  if (bySlug) return bySlug;

  // 2) If route slug is the document id, fetch it directly.
  try {
    const snap = await getDoc(doc(db, "products", slugValue));
    if (snap.exists()) return normalizeProduct(snap);
  } catch {
    // ignore and continue
  }

  // 3) Fallback: fetch all and match against computed slugify(name) or id.
  try {
    const all = await fetchProductsCached();
    const found =
      all.find((p) => String(p.slug) === slugValue || String(p.slug) === routeKey) ||
      all.find((p) => String(p.id) === slugValue) ||
      all.find((p) => slugify(p.name) === routeKey) ||
      all.find((p) => (p.rawSlug ? slugify(p.rawSlug) : "") === routeKey);
    return found || null;
  } catch {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[products] fetchProductByRouteSlug: failed to fetch products list for", slugValue);
    }
    return null;
  }
}
