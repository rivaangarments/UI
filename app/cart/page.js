"use client";

import Image from "next/image";
import { ChevronRight, Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";
import { products } from "@/data/products";
import { getCartItems, removeCartItem, updateCartItemQty } from "@/lib/cart/cartStorage";

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = getCartItems();
    setItems(stored.length ? stored : products.slice(0, 4).map((p) => ({ ...p, qty: 1, selectedColor: p.colors?.[0], selectedSize: p.sizes?.[0] })));
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.offerPrice || 0) * Number(item.qty || 1), 0),
    [items]
  );
  const discount = 499;
  const shipping = 0;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container cart-header">
          <div>
            <h1>Your Shopping Cart</h1>
            <p>{items.length} items</p>
          </div>
          <a className="continue-shopping" href="/product">
            Continue Shopping <ChevronRight size={16} />
          </a>
        </div>
        <div className="container cart-layout">
          <section className="cart-list luxury-panel">
            {items.map((item, idx) => (
              <article className="cart-item" key={item.id}>
                <Image src={item.image} alt={item.name} width={118} height={132} />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.category}
                    {item.selectedColor ? ` · ${item.selectedColor}` : ""}
                    {item.selectedSize ? ` · ${item.selectedSize}` : ""}
                  </p>
                  <b>₹{item.offerPrice.toLocaleString("en-IN")}</b>
                </div>
                <div className="cart-qty">
                  <button
                    aria-label="Decrease"
                    onClick={() => {
                      const next = updateCartItemQty(idx, Math.max(1, Number(item.qty || 1) - 1));
                      setItems(next);
                    }}
                  >
                    <Minus size={15} />
                  </button>
                  <span>{Number(item.qty || 1)}</span>
                  <button
                    aria-label="Increase"
                    onClick={() => {
                      const next = updateCartItemQty(idx, Math.min(99, Number(item.qty || 1) + 1));
                      setItems(next);
                    }}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  className="wish-btn"
                  aria-label="Remove item"
                  onClick={() => {
                    const next = removeCartItem(idx);
                    setItems(next.length ? next : []);
                  }}
                >
                  <Heart size={18} />
                </button>
              </article>
            ))}

            <div className="coupon-row">
              <b>Apply Coupon</b>
              <div className="coupon-box">
                <input placeholder="Enter coupon code" />
                <button type="button">Apply</button>
              </div>
            </div>
          </section>
          <aside className="summary-card luxury-panel">
            <h2>Order Summary</h2>
            <p><span>Subtotal</span><b>₹{subtotal.toLocaleString("en-IN")}</b></p>
            <p><span>Discount</span><b>-₹{discount.toLocaleString("en-IN")}</b></p>
            <p><span>Shipping</span><b>{shipping ? `₹${shipping.toLocaleString("en-IN")}` : "FREE"}</b></p>
            <hr />
            <p className="total"><span>Total</span><b>₹{total.toLocaleString("en-IN")}</b></p>
            <small className="save-note">You save ₹{discount.toLocaleString("en-IN")} on this order</small>
            <Button href="/profile" variant="gold">Proceed to Checkout</Button>
            <div className="secure-row">
              <ShieldCheck size={16} />
              <span>Secure Checkout</span>
            </div>

            <div className="accept-card">
              <b>Benefits</b>
              <div className="accept-grid">
                <div><Truck size={18} /><span>Free Shipping</span></div>
                <div><RotateCcw size={18} /><span>Easy Returns</span></div>
                <div><ShieldCheck size={18} /><span>Secure Payments</span></div>
                <div><Wallet size={18} /><span>COD Available</span></div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
