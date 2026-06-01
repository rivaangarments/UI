"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import MobileMenu from "@/components/MobileMenu/MobileMenu";
import { getCartCount, onCartChange } from "@/lib/cart/cartStorage";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Men", href: "/product?filter=men" },
  { label: "Women", href: "/product?filter=women" },
  { label: "Kids", href: "/product?filter=kids" },
  { label: "New Arrivals", href: "/product?filter=new-arrivals" },
  { label: "Sale", href: "/product?filter=sale" },
  { label: "About Us", href: "/about" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    return onCartChange((items) => setCartCount(getCartCount(items)));
  }, []);

  return (
    <>
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <span>Free shipping on orders above ₹999</span>
          <span>Easy returns</span>
          <span>Cash on Delivery</span>
          <Link href="/profile">Track Order</Link>
        </div>
      </div>
      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Rivaan Garments home">
            <span className="logo-crop logo-light">
              <Image src="/images/icons/rivaan-logo.jpg" alt="Rivaan Garments" width={320} height={320} priority />
            </span>
          </Link>
          <nav className="desktop-nav">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="nav-icon" href="/search" aria-label="Search">
              <Search size={20} />
            </Link>
            <Link className="nav-icon" href="/profile" aria-label="Profile">
              <UserRound size={20} />
            </Link>
            <Link className="nav-icon" href="/wishlist" aria-label="Wishlist">
              <Heart size={20} />
            </Link>
            <Link className="nav-icon cart-badge" href="/cart" aria-label="Cart">
              <ShoppingBag size={20} />
              {cartCount ? <span>{cartCount}</span> : null}
            </Link>
            <button className="nav-icon hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
