import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, UserRound, X } from "lucide-react";

const navItems = ["Home", "Men", "Women", "Kids", "New Arrivals", "Sale", "About Us"];

export default function MobileMenu({ open, onClose }) {
  return (
    <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="mobile-menu-panel">
        <button className="nav-icon close-menu" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
        <div className="mobile-logo">
          <span className="logo-crop logo-light">
            <Image src="/images/icons/rivaan-logo.jpg" alt="Rivaan Garments" width={320} height={320} />
          </span>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item}
              href={
                item === "Home"
                  ? "/"
                  : item === "About Us"
                    ? "/about"
                    : `/product?filter=${item.toLowerCase().replaceAll(" ", "-")}`
              }
              onClick={onClose}
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="mobile-actions">
          <Link href="/wishlist" onClick={onClose}>
            <Heart size={18} /> Wishlist
          </Link>
          <Link href="/cart" onClick={onClose}>
            <ShoppingBag size={18} /> Cart
          </Link>
          <Link href="/profile" onClick={onClose}>
            <UserRound size={18} /> Profile
          </Link>
        </div>
      </div>
      <button className="mobile-scrim" onClick={onClose} aria-label="Close menu" />
    </div>
  );
}
