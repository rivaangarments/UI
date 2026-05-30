function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const fallbackImages = {
  tshirts: "/images/categories/tshirts.svg",
  shirts: "/images/categories/shirts.svg",
  jeans: "/images/categories/jeans.svg",
  ethnic: "/images/categories/ethnic.svg",
  hoodies: "/images/categories/hoodies.svg",
  accessories: "/images/categories/accessories.svg",
  kurti: "/images/categories/ethnic.svg",
  kurtis: "/images/categories/ethnic.svg",
  tops: "/images/categories/shirts.svg",
  top: "/images/categories/shirts.svg",
  shorts: "/images/categories/jeans.svg"
};

export function categoriesFromProducts(products) {
  const items = Array.isArray(products) ? products : [];
  const bySlug = new Map();

  for (const product of items) {
    const name = product?.category || product?.categoryName || product?.categoryId || "";
    const slug = normalizeKey(product?.categorySlug || name);
    if (!slug) continue;

    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        id: slug,
        slug,
        name: String(name || slug).trim() || slug,
        image: fallbackImages[slug] || "/images/categories/tshirts.svg"
      });
    }
  }

  return Array.from(bySlug.values()).sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

