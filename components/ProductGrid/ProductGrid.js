import ProductCard from "@/components/ProductCard/ProductCard";
import Loader from "@/components/Loader/Loader";

export default function ProductGrid({ products, loading = false }) {
  if (loading) {
    return <Loader count={8} />;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}
