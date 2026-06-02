"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Menu, PackageCheck, Search, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import MobileMenu from "@/components/MobileMenu/MobileMenu";
import { getCartCount, onCartChange } from "@/lib/cart/cartStorage";
import { getWishlistCount, onWishlistChange } from "@/lib/wishlist/wishlistStorage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
  { label: "Home", href: "/" },
  { label: "New Arrivals", href: "/product?filter=new-arrivals" },
  { label: "Sale", href: "/product?filter=sale" },
  { label: "About Us", href: "/about" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const offAuth = onAuthStateChanged(auth, (u) => {
      const ok = !!u;
      setSignedIn(ok);
      if (!ok) {
        // Hide badges immediately when logged out.
        setCartCount(0);
        setWishlistCount(0);
      } else {
        setCartCount(getCartCount());
        setWishlistCount(getWishlistCount());
      }
    });

    setCartCount(getCartCount());
    const offCart = onCartChange((items) => setCartCount(getCartCount(items)));

    setWishlistCount(getWishlistCount());
    const offWish = onWishlistChange((items) => setWishlistCount(getWishlistCount(items)));

    return () => {
      offAuth();
      offCart();
      offWish();
    };
  }, []);

  return (
    <>
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <span>Free shipping on orders above Rs. 999</span>
          <span>Easy returns</span>
          <span>Cash on Delivery</span>
          <Link href="/orders">Track Order</Link>
        </div>
      </div>
      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Rivaan Garments home">
            <span className="logo-crop logo-light">
              <Image src="/images/icons/rivaan-logo-light.png" alt="Rivaan Garments" width={320} height={320} priority sizes="210px" />
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
            <Link className="nav-icon" href="/orders" aria-label="Orders">
              <PackageCheck size={20} />
            </Link>
            <Link className="nav-icon cart-badge" href="/wishlist" aria-label="Wishlist">
              <Heart size={20} />
              {signedIn && wishlistCount ? <span>{wishlistCount}</span> : null}
            </Link>
            <Link className="nav-icon cart-badge" href="/cart" aria-label="Cart">
              <ShoppingBag size={20} />
              {signedIn && cartCount ? <span>{cartCount}</span> : null}
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
