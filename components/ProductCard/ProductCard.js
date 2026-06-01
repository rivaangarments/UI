"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart/cartStorage";
import { getWishlistItems, onWishlistChange, toggleWishlist } from "@/lib/wishlist/wishlistStorage";
import { auth } from "@/lib/firebase";

export default function ProductCard({ product }) {
  const router = useRouter();
  const hasDiscount = Number(product.price || 0) > Number(product.offerPrice || 0);
  const discountPct = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.offerPrice)) / Number(product.price)) * 100)
    : 0;

  const productId = useMemo(() => String(product.id ?? product.slug ?? ""), [product.id, product.slug]);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    // Initialize + keep in sync (navbar/wishlist page/product cards).
    const compute = (items) => {
      const list = Array.isArray(items) ? items : getWishlistItems();
      setWished(list.some((it) => String(it?.id ?? "") === productId));
    };
    compute(getWishlistItems());
    return onWishlistChange((items) => compute(items));
  }, [productId]);

  const slugOrId = product.slug || product.id;
  const params = new URLSearchParams();
  if (product.category) params.set("category", String(product.category));
  if (product.name) params.set("name", String(product.name));
  const href = `/product/${slugOrId}${params.toString() ? `?${params.toString()}` : ""}`;

  return (
    <article className="product-card fade-in">
      <Link className="product-media" href={href}>
        <Image src={product.image} alt={product.name} width={420} height={500} />
        {product.tag ? <span className="product-tag">{String(product.tag).toUpperCase()}</span> : null}
      </Link>
      <button
        type="button"
        className="icon-float"
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        onClick={() => {
          const res = toggleWishlist(product);
          setWished(res.added);
        }}
      >
        <Heart size={18} fill={wished ? "currentColor" : "none"} />
      </button>
      <div className="product-info">
        <Link href={href}>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-meta">
          <span className="price">
            <b>₹{product.offerPrice.toLocaleString("en-IN")}</b>
            {hasDiscount ? <del>₹{product.price.toLocaleString("en-IN")}</del> : null}
            {hasDiscount ? <span className="discount">{discountPct}% OFF</span> : null}
          </span>
          <span className="rating">
            {product.rating} <Star size={14} fill="currentColor" />
          </span>
        </div>
        <button
          type="button"
          className="cart-line"
          onClick={() => {
            const payload = {
              id: product.id,
              slug: product.slug || product.id,
              name: product.name,
              category: product.category,
              image: product.image,
              price: product.price,
              offerPrice: product.offerPrice,
              selectedColor: Array.isArray(product.colors) ? String(product.colors[0] || "") : "",
              selectedSize: Array.isArray(product.sizes) ? String(product.sizes[0] || "") : "",
              qty: 1
            };

            if (!auth.currentUser) {
              try {
                window.sessionStorage.setItem("rivaan_pending_cart_add_v1", JSON.stringify(payload));
              } catch {
                // ignore
              }
              const next = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/product";
              router.push(`/login?next=${encodeURIComponent(next)}`);
              return;
            }

            addToCart(payload);
          }}
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}
