import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import { products } from "@/data/products";

export default function WishlistPage() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container page-title">
          <h1>Your Wishlist</h1>
          <p>Saved styles ready for your next Rivaan order.</p>
        </div>
        <div className="container">
          <ProductGrid products={[products[6], products[1], products[3], products[7]]} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
