"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import SearchBar from "@/components/SearchBar/SearchBar";
import Button from "@/components/Button/Button";
import { fetchProductsCached } from "@/lib/firestore/products";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const qRaw = searchParams.get("q") || "";
  const q = qRaw.trim();
  const qLower = q.toLowerCase();

  const [loading, setLoading] = useState(Boolean(q));
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (!q) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.resolve(fetchProductsCached())
      .then((items) => {
        if (!mounted) return;
        setProducts(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [q]);

  const results = useMemo(() => {
    if (!qLower) return [];
    return products.filter((product) => {
      const hay = `${product.name || ""} ${product.category || ""}`.toLowerCase();
      return hay.includes(qLower);
    });
  }, [products, qLower]);

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container page-title">
          <h1>Search</h1>
          <p>{q ? `Showing results for "${q}".` : "Search the Rivaan collection by product or category."}</p>
        </div>

        <div className="container search-page-card luxury-panel">
          <SearchBar defaultValue={q} />
        </div>

        <div className="container search-results">
          {!q ? (
            <section className="cart-empty luxury-panel">
              <h2>Start searching</h2>
              <p>Type a product name or category to see results.</p>
              <Button href="/product" variant="gold">
                Browse Collection
              </Button>
            </section>
          ) : results.length || loading ? (
            <ProductGrid products={results} loading={loading} />
          ) : (
            <section className="cart-empty luxury-panel">
              <h2>No products found</h2>
              <p>Try searching for kurti, shirts, hoodies, jeans, or ethnic wear.</p>
              <Button href="/product" variant="gold">
                Shop Collection
              </Button>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

