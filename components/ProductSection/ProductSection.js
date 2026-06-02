"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import { fetchProductsCached } from "@/lib/firestore/products";

function pickProducts(items, mode, limitCount) {
  const list = Array.isArray(items) ? items : [];
  const limit = limitCount || 5;

  if (!list.length) return [];

  if (mode === "trending") {
    const trending = list.filter(
      (p) => p.trending === true || p.isTrending === true || String(p.tag || "").toLowerCase().includes("trend")
    );
    return trending.slice(0, limit);
  }

  if (mode === "new") {
    const newOnes = list.filter(
      (p) => p.featured === true || p.isFeatured === true || String(p.tag || "").toLowerCase().includes("new") || p.isNewArrival
    );
    return newOnes.slice(0, limit);
  }

  return list.slice(0, limit);
}

export default function ProductSection({
  title,
  description,
  mode,
  limit = 5,
  viewAllHref = "/product",
  fallbackProducts = []
}) {
  const [loading, setLoading] = useState(!fallbackProducts.length);
  const [products, setProducts] = useState(fallbackProducts);

  useEffect(() => {
    let mounted = true;
    setLoading(!fallbackProducts.length);

    fetchProductsCached()
      .then((items) => {
        if (!mounted) return;
        const list = Array.isArray(items) ? items : [];
        const picked = pickProducts(list, mode, limit);
        // If Firestore returned products but none match the "mode" filter, show the first items
        // from Firestore rather than falling back to dummy data (keeps details page consistent).
        if (picked.length) setProducts(picked);
        else if (list.length) setProducts(list.slice(0, limit));
        else setProducts(fallbackProducts);
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [mode, limit]);

  const heading = useMemo(
    () => (
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <a className="view-link" href={viewAllHref}>
          View All <ArrowRight size={16} />
        </a>
      </div>
    ),
    [title, description, viewAllHref]
  );

  return (
    <section className="section">
      <div className="container">
        {heading}
        <ProductGrid products={products} loading={loading} />
      </div>
    </section>
  );
}
