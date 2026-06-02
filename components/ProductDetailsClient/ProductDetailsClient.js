"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, Star, Truck, RotateCcw, Wallet } from "lucide-react";
import ProductGallery from "@/components/ProductGallery/ProductGallery";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import Button from "@/components/Button/Button";
import ProductDetailsTabs from "@/components/ProductDetailsTabs/ProductDetailsTabs";
import { fetchProductsCached } from "@/lib/firestore/products";
import { addToCart } from "@/lib/cart/cartStorage";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";

const perks = [
  { icon: Truck, title: "Free Shipping", text: "On orders above ₹999" },
  { icon: RotateCcw, title: "Easy Returns", text: "Within 7 days" },
  { icon: ShieldCheck, title: "Secure Payments", text: "100% secure payments" },
  { icon: Wallet, title: "COD Available", text: "Pay on delivery" }
];

function hasDiscount(product) {
  return Number(product?.price || 0) > Number(product?.offerPrice || 0);
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function findProductFromList(list, { routeSlug, name, category }) {
  const items = Array.isArray(list) ? list : [];
  const routeKey = normalizeKey(routeSlug);
  const nameKey = normalizeKey(name);
  const categoryKey = normalizeKey(category);

  // 1) Most reliable: match by category + name (exactly what you clicked).
  if (nameKey && categoryKey) {
    const byCatName = items.find(
      (p) =>
        normalizeKey(p.name) === nameKey &&
        normalizeKey(p.categorySlug || p.category) === categoryKey
    );
    if (byCatName) return byCatName;
  }

  // 2) Fallback: match by route slug/id.
  if (routeKey) {
    return (
      items.find((p) => normalizeKey(p.id) === routeKey) ||
      items.find((p) => normalizeKey(p.slug) === routeKey) ||
      items.find((p) => normalizeKey(p.rawSlug) === routeKey) ||
      items.find((p) => normalizeKey(p.name) === routeKey) ||
      null
    );
  }

  return null;
}

export default function ProductDetailsClient({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qpCategory = searchParams.get("category") || "";
  const qpName = searchParams.get("name") || "";
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [all, setAll] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [pickError, setPickError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setProduct(null);
    setAll([]);
    setLoadError("");

    fetchProductsCached()
      .then((items) => {
        if (!mounted) return;
        const list = Array.isArray(items) ? items : [];
        setAll(list);

        const p = findProductFromList(list, { routeSlug: slug, name: qpName, category: qpCategory });
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log("[ProductDetails] match =", p ? { id: p.id, slug: p.slug, name: p.name, offerPrice: p.offerPrice, price: p.price, gallery: p.gallery?.length } : null);
        }
        setProduct(p || null);
        if (p) {
          setSelectedColor(String((p.colors && p.colors[0]) || ""));
          setSelectedSize(String((p.sizes && p.sizes[0]) || ""));
          setQty(1);
          setPickError("");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = String(err?.code || err?.message || err || "Failed to load products.");
        setLoadError(msg);
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[ProductDetails] Firestore load error:", err);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug, qpCategory, qpName]);

  const related = useMemo(() => {
    if (!product) return [];
    const list = Array.isArray(all) && all.length ? all : [];
    const key = product.categorySlug || product.category;
    return list.filter((p) => (p.categorySlug || p.category) === key && p.id !== product.id).slice(0, 4);
  }, [all, product]);

  if (loading) {
    return (
      <section className="section">
        <div className="container luxury-panel" style={{ padding: 22 }}>
          Loading product…
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="section">
        <div className="container luxury-panel" style={{ padding: 22 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-serif)" }}>Product Not Found</h1>
          {loadError ? (
            <p style={{ color: "#a63b2b", marginTop: 8, fontWeight: 750 }}>
              Couldn’t fetch products from Firestore: {loadError}
            </p>
          ) : (
            <p style={{ color: "var(--color-muted)", marginTop: 8 }}>
              This product link doesn’t match any item in Firestore.
            </p>
          )}
          {process.env.NODE_ENV !== "production" ? (
            <p style={{ color: "var(--color-muted)", marginTop: 10 }}>
              Debug: route = <b>{String(slug || "")}</b>, loaded products = <b>{all.length}</b>
            </p>
          ) : null}
          <div style={{ marginTop: 14 }}>
            <Button href="/product">Back to Collection</Button>
          </div>
        </div>
      </section>
    );
  }

  const discountPct = hasDiscount(product)
    ? Math.max(
        1,
        Math.round(((Number(product.price) - Number(product.offerPrice)) / Math.max(1, Number(product.price))) * 100)
      )
    : 0;

  function validatePicks() {
    const needsColor = Array.isArray(product.colors) && product.colors.length > 0;
    const needsSize = Array.isArray(product.sizes) && product.sizes.length > 0;
    if (needsColor && !selectedColor) return "Please select a color.";
    if (needsSize && !selectedSize) return "Please select a size.";
    return "";
  }

  function handleAddToCart(goCheckout) {
    const err = validatePicks();
    if (err) {
      setPickError(err);
      return;
    }

    const payload = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      image: product.image,
      price: product.price,
      offerPrice: product.offerPrice,
      selectedColor,
      selectedSize,
      qty
    };

    if (!auth.currentUser) {
      try {
        window.sessionStorage.setItem("rivaan_pending_cart_add_v1", JSON.stringify(payload));
      } catch {
        // ignore
      }
      const next = goCheckout
        ? "/checkout"
        : typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/product";
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    addToCart(payload);
    router.push(goCheckout ? "/checkout" : "/cart");
  }

  return (
    <>
      <section className="section">
        <div className="container product-detail-layout">
          <ProductGallery product={product} />

          <section className="detail-info">
            <span className="detail-kicker">{product.tag}</span>
            <h1>{product.name}</h1>

            <div className="detail-rating">
              <Star size={16} fill="currentColor" /> {product.rating}{" "}
              <span className="detail-reviews">({product.reviews} Reviews)</span>
            </div>

            {typeof product.stock === "number" ? (
              <div className="detail-stock">
                <b>{product.stock}</b> in stock
              </div>
            ) : null}

            <div className="detail-price">
              <b>₹{Number(product.offerPrice || 0).toLocaleString("en-IN")}</b>
              {hasDiscount(product) ? <del>₹{Number(product.price || 0).toLocaleString("en-IN")}</del> : null}
              {hasDiscount(product) ? <span className="detail-discount">{discountPct}% OFF</span> : null}
              <span className="detail-tax">Inclusive of all taxes</span>
            </div>

            <div className="detail-options">
              <div className="option-block">
                <h3>Color</h3>
                <div className="swatch-circles">
                  {(product.colors || []).slice(0, 8).map((color) => {
                    const c = String(color);
                    const isActive = selectedColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`swatch-circle ${isActive ? "is-active" : ""}`}
                        aria-pressed={isActive}
                        aria-label={`Select color ${c}`}
                        onClick={() => {
                          setPickError("");
                          setSelectedColor(c);
                        }}
                        style={{ "--swatch": c.toLowerCase() }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="option-block">
                <div className="size-head">
                  <h3>Size</h3>
                  <a className="size-guide" href="#size-guide">Size Guide</a>
                </div>
                <div className="chip-row">
                  {(product.sizes || []).slice(0, 10).map((size) => {
                    const s = String(size);
                    const isActive = selectedSize === s;
                    return (
                      <button
                        type="button"
                        key={s}
                        className={isActive ? "active" : ""}
                        aria-pressed={isActive}
                        onClick={() => {
                          setPickError("");
                          setSelectedSize(s);
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="quantity-row">
              <span>Quantity</span>
              <div>
                <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
                <b>{qty}</b>
                <button aria-label="Increase" onClick={() => setQty((q) => Math.min(99, q + 1))}><Plus size={16} /></button>
              </div>
            </div>

            <div className="detail-actions">
              <Button onClick={() => handleAddToCart(false)}>Add to Cart</Button>
              <Button onClick={() => handleAddToCart(true)} variant="gold">Buy Now</Button>
              <button className="wish-detail" aria-label="Wishlist"><Heart size={20} /></button>
            </div>

            {pickError ? <p className="pick-error" role="alert">{pickError}</p> : null}
          </section>
        </div>
      </section>

      <section className="detail-perk-row">
        <div className="container perk-grid">
          {perks.map(({ icon: Icon, title, text }) => (
            <div className="perk-item" key={title}>
              <Icon size={20} />
              <span>
                <b>{title}</b>
                <small>{text}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ProductDetailsTabs product={product} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><h2>You May Also Like</h2></div>
          <ProductGrid products={related.length ? related : (all.length ? all.slice(0, 4) : [])} />
        </div>
      </section>
    </>
  );
}
