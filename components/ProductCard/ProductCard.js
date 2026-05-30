import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";

export default function ProductCard({ product }) {
  const hasDiscount = Number(product.price || 0) > Number(product.offerPrice || 0);
  const discountPct = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.offerPrice)) / Number(product.price)) * 100)
    : 0;
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
      <button className="icon-float" aria-label={`Add ${product.name} to wishlist`}>
        <Heart size={18} />
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
        <button className="cart-line">
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}
