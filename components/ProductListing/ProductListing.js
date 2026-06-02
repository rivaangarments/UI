"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/FilterSidebar/FilterSidebar";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import { fetchProductsByCategory, fetchProductsCached } from "@/lib/firestore/products";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function variants(value) {
  const key = normalize(value);
  if (!key) return [];
  const set = new Set([key]);
  if (key.endsWith("s")) set.add(key.slice(0, -1));
  else set.add(`${key}s`);
  return Array.from(set);
}

function filterByCategory(items, categoryParam) {
  const key = normalize(categoryParam);
  if (!key) return items;

  return items.filter((p) => {
    const candidates = [];
    if (p.categorySlug) candidates.push(p.categorySlug);
    if (p.categoryId) candidates.push(p.categoryId);
    if (p.category) candidates.push(p.category);
    if (Array.isArray(p.categories)) candidates.push(...p.categories);

    for (const raw of candidates) {
      for (const v of variants(raw)) {
        if (v === key || v === `${key}s` || (key.endsWith("s") && v === key.slice(0, -1))) return true;
      }
    }
    return false;
  });
}

function titleFromCategory(category) {
  const raw = String(category || "").trim();
  if (!raw) return "All Collections";
  const key = normalize(raw);
  // Title-case a simple category.
  const nice = raw
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
  return `${nice} Collection`;
}

function sortProducts(items, mode) {
  const list = [...items];
  switch (mode) {
    case "low":
      return list.sort((a, b) => Number(a.offerPrice || 0) - Number(b.offerPrice || 0));
    case "high":
      return list.sort((a, b) => Number(b.offerPrice || 0) - Number(a.offerPrice || 0));
    case "new":
      return list.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    case "latest":
      return list.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    default:
      // Featured: prefer trending/featured, then newest.
      return list.sort((a, b) => {
        const aScore = (a.trending ? 2 : 0) + (a.featured ? 1 : 0);
        const bScore = (b.trending ? 2 : 0) + (b.featured ? 1 : 0);
        if (aScore !== bScore) return bScore - aScore;
        return Number(b.createdAt || 0) - Number(a.createdAt || 0);
      });
  }
}

export default function ProductListing() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const [sortMode, setSortMode] = useState("latest");
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPage(1);

    const fetcher = category ? fetchProductsByCategory(category) : fetchProductsCached();

    Promise.resolve(fetcher)
      .then((items) => {
        if (!mounted) return;
        if (Array.isArray(items)) setProducts(items);
        else setProducts([]);
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [category]);

  const filtered = useMemo(() => filterByCategory(products, category), [products, category]);
  const sorted = useMemo(() => sortProducts(filtered, sortMode), [filtered, sortMode]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = total ? (safePage - 1) * pageSize : 0;
  const end = Math.min(start + pageSize, total);
  const pageItems = sorted.slice(start, end);

  return (
    <>
      <div className="container listing-header">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <ChevronRight size={14} />
          <span>{category ? String(category) : "All Collections"}</span>
        </nav>
        <div className="listing-head-row">
          <div>
            <h1>{titleFromCategory(category)}</h1>
            <p>Discover premium styles crafted for everyday confidence and festive moments.</p>
          </div>
          <a className="continue-link" href="/product">
            <span>View All</span>
            <ChevronRight size={16} />
          </a>
        </div>
      </div>

      <div className="container listing-layout">
        <FilterSidebar />
        <section className="listing-content">
          <div className="listing-toolbar luxury-panel">
            <div className="listing-count">
              <b>Showing</b> {total ? `${start + 1}-${end}` : "0"} <span>of</span> {total} products
            </div>
            <div className="listing-actions">
              <select
                aria-label="Sort products"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
              >
                <option value="latest">Sort by: Latest</option>
                <option value="featured">Sort by: Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <ProductGrid products={pageItems} loading={loading} />
          {!loading && !pageItems.length ? (
            <div className="luxury-panel" style={{ padding: 18, marginTop: 16 }}>
              No products found.
            </div>
          ) : null}

          <div className="listing-pagination">
            <button
              type="button"
              className="page-btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <div className="page-dots" aria-label="Pagination">
              {Array.from({ length: pageCount }).slice(0, 7).map((_, idx) => {
                const n = idx + 1;
                return (
                  <button
                    type="button"
                    key={n}
                    className={`page-pill ${n === safePage ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="page-btn"
              disabled={safePage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
