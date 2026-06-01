"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import Button from "@/components/Button/Button";
import { getWishlistItems, onWishlistChange, setWishlistItems } from "@/lib/wishlist/wishlistStorage";

export default function WishlistPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getWishlistItems());
    return onWishlistChange((next) => setItems(Array.isArray(next) ? next : []));
  }, []);

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container page-title">
          <h1>Your Wishlist</h1>
          <p>Saved styles ready for your next Rivaan order.</p>
        </div>

        <div className="container">
          {items.length ? (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setWishlistItems([]);
                    setItems([]);
                  }}
                >
                  Clear Wishlist
                </Button>
              </div>
              <ProductGrid products={items} />
            </>
          ) : (
            <section className="cart-empty luxury-panel">
              <h2>No products added</h2>
              <p>Your wishlist is empty right now.</p>
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

