import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

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
  const withoutScheme = value.slice("gs://".length);
  const firstSlash = withoutScheme.indexOf("/");
  if (firstSlash === -1) return null;
  return withoutScheme.slice(firstSlash + 1);
}

function maybeString(v) {
  if (typeof v === "string") {
    const s = v.trim();
    return s ? s : null;
  }
  return null;
}

function pickImageLikeValue(data) {
  if (!data || typeof data !== "object") return null;

  // Common explicit fields first.
  const direct =
    maybeString(data.image) ||
    maybeString(data.imageUrl) ||
    maybeString(data.imageURL) ||
    maybeString(data.bannerUrl) ||
    maybeString(data.bannerURL) ||
    maybeString(data.url) ||
    maybeString(data.photoURL) ||
    maybeString(data.thumbnail) ||
    maybeString(data.thumbnailUrl) ||
    maybeString(data.thumbnailURL) ||
    maybeString(data.heroImage) ||
    maybeString(data.heroImageUrl) ||
    maybeString(data.heroImageURL) ||
    null;

  if (direct) return direct;

  // Some schemas store an object like { url: "..." }.
  for (const key of ["image", "banner", "hero", "media"]) {
    const obj = data[key];
    if (obj && typeof obj === "object") {
      const nested =
        maybeString(obj.url) ||
        maybeString(obj.src) ||
        maybeString(obj.downloadURL) ||
        maybeString(obj.downloadUrl) ||
        maybeString(obj.imageUrl) ||
        maybeString(obj.fullUrl) ||
        null;
      if (nested) return nested;
    }
  }

  // Fallback: scan all fields for anything "image-like".
  for (const [k, v] of Object.entries(data)) {
    const s = maybeString(v);
    if (!s) continue;
    if (/(image|banner|photo|thumbnail|hero|desktop|mobile)/i.test(k)) return s;
  }

  // Or a first item in an array.
  for (const [k, v] of Object.entries(data)) {
    if (!/(image|banner|photo|thumbnail|hero)/i.test(k)) continue;
    if (Array.isArray(v) && v.length) {
      const s = maybeString(v[0]);
      if (s) return s;
    }
  }

  return null;
}

async function resolveImage(data) {
  const raw = pickImageLikeValue(data);

  if (typeof raw === "string" && raw.trim()) {
    const value = raw.trim();
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
    const gsPath = storagePathFromGsUrl(value);
    const cleaned = String(gsPath || value).replace(/^\/+/, "");
    try {
      return await getDownloadURL(ref(storage, cleaned));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn("[banners] getDownloadURL failed for", cleaned, err);
      }
      return null;
    }
  }

  const pathValue =
    maybeString(data.imagePath) ||
    maybeString(data.storagePath) ||
    maybeString(data.filePath) ||
    maybeString(data.fullPath) ||
    maybeString(data.gsPath) ||
    maybeString(data.gsUrl) ||
    null;

  if (pathValue) {
    const gsPath = storagePathFromGsUrl(pathValue);
    const cleaned = String(gsPath || pathValue).replace(/^\/+/, "");
    try {
      return await getDownloadURL(ref(storage, cleaned));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn("[banners] getDownloadURL failed for", cleaned, err);
      }
      return null;
    }
  }

  return null;
}

function normalizeBanner(document) {
  const data = document.data();
  return {
    id: document.id,
    key: data.key || data.type || data.placement || document.id,
    order: data.order ?? data.sortOrder ?? data.position ?? 999,
    kicker: data.kicker || data.badge || "New Collection",
    title: data.title || "Elevate Your",
    highlight: data.highlight || "Style Everyday",
    subtitle:
      data.subtitle ||
      data.description ||
      "Premium quality garments crafted for comfort, ceremony, and modern confidence.",
    primaryCtaLabel: data.primaryCtaLabel || data.primaryLabel || "Shop Now",
    primaryCtaHref: data.primaryCtaHref || data.primaryHref || "/product",
    secondaryCtaLabel: data.secondaryCtaLabel || data.secondaryLabel || "Explore Collection",
    secondaryCtaHref: data.secondaryCtaHref || data.secondaryHref || "/product?filter=new-arrivals",
    _data: data
  };
}

export async function fetchBanners() {
  // Some projects use "banners", others use "banner" (singular). Support both.
  let docs = [];
  try {
    const snap = await getDocs(collection(db, "banners"));
    docs = snap.docs;
  } catch {
    docs = [];
  }

  if (!docs.length) {
    try {
      const snap = await getDocs(collection(db, "banner"));
      docs = snap.docs;
    } catch {
      docs = [];
    }
  }

  const items = docs.map(normalizeBanner);

  const withImages = await Promise.all(
    items.map(async (banner) => ({
      ...banner,
      image: await resolveImage(banner._data)
    }))
  );

  if (process.env.NODE_ENV !== "production") {
    const hero = withImages.find((b) => ["hero", "home-hero", "homepage-hero"].includes(normalizeKey(b.key))) || withImages[0];
    if (hero && !hero.image) {
      // eslint-disable-next-line no-console
      console.warn(
        "[banners] Hero banner loaded but image could not be resolved. Check /banners doc image field name + Storage rules.",
        { id: hero.id, key: hero.key, fields: Object.keys(items.find((i) => i.id === hero.id)?._data || {}) }
      );
    }
  }

  return withImages
    .map(({ _data, ...rest }) => rest)
    .sort((a, b) => Number(a.order) - Number(b.order));
}

export async function fetchHeroBanner() {
  const items = await fetchBanners();
  if (!items.length) return null;

  const hero = items.find((b) => ["hero", "home-hero", "homepage-hero"].includes(normalizeKey(b.key)));
  return hero || items[0];
}

export async function fetchHeroBanners() {
  const items = await fetchBanners();
  if (!items.length) return [];

  const heroItems = items.filter((b) => {
    const k = normalizeKey(b.key);
    return k === "hero" || k.startsWith("hero-") || k.startsWith("home-hero") || k.includes("homepage-hero");
  });

  return heroItems.length ? heroItems : items;
}
