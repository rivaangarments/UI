import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import SearchBar from "@/components/SearchBar/SearchBar";
import { products } from "@/data/products";

export default function SearchPage({ searchParams }) {
  const q = searchParams?.q?.toLowerCase() || "";
  const results = q
    ? products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(q))
    : products.slice(0, 6);

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container page-title">
          <h1>Search Results</h1>
          <p>{q ? `Showing styles for "${q}".` : "Search the Rivaan collection by product, category, or occasion."}</p>
        </div>
        <div className="container search-page-card luxury-panel">
          <SearchBar />
        </div>
        <div className="container search-results">
          {results.length ? <ProductGrid products={results} /> : (
            <div className="empty-state">
              <h2>No products found</h2>
              <p>Try searching for shirts, hoodies, jeans, or ethnic wear.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
