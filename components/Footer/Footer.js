import Link from "next/link";
import Image from "next/image";
import { Camera, PlayCircle, Send, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand footer-logo">
            <span className="logo-crop logo-light">
              <Image src="/images/icons/rivaan-logo-light.png" alt="Rivaan Garments" width={320} height={320} sizes="220px" />
            </span>
          </Link>
          <p>Premium garments crafted for modern Indian wardrobes, festive moments, and elevated everyday style.</p>
          <div className="socials">
            <a href="#" aria-label="Social feed"><Share2 size={17} /></a>
            <a href="#" aria-label="Instagram gallery"><Camera size={17} /></a>
            <a href="#" aria-label="Video channel"><PlayCircle size={17} /></a>
          </div>
        </div>
        <div>
          <h3>Shop</h3>
          <Link href="/product?filter=men">Men</Link>
          <Link href="/product?filter=women">Women</Link>
          <Link href="/product?filter=kids">Kids</Link>
          <Link href="/product?filter=new-arrivals">New Arrivals</Link>
          <Link href="/product?filter=sale">Sale</Link>
        </div>
        <div>
          <h3>Customer Care</h3>
          <Link href="/profile">Track Order</Link>
          <Link href="/about#return-refund">Returns & Refunds</Link>
          <Link href="/about#shipping-delivery">Shipping Policy</Link>
          <Link href="/profile">FAQ's</Link>
        </div>
        <div>
          <h3>About Us</h3>
          <Link href="/about">About Rivaan</Link>
          <Link href="/about#privacy-policy">Privacy Policy</Link>
          <Link href="/about#terms-conditions">Terms & Conditions</Link>
        </div>
        <div className="newsletter-mini">
          <h3>Newsletter</h3>
          <p>Subscribe for early access to drops and exclusive offers.</p>
          <form>
            <input type="email" placeholder="Enter your email" aria-label="Email address" />
            <button aria-label="Subscribe"><Send size={17} /></button>
          </form>
          <div className="payment-pills">
            <span>VISA</span>
            <span>MC</span>
            <span>UPI</span>
            <span>Pay</span>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 Rivaan Garments. All Rights Reserved.</div>
    </footer>
  );
}
