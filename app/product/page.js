import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductListing from "@/components/ProductListing/ProductListing";
import { Suspense } from "react";

export default function ProductListingPage() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <Suspense fallback={<div className="container section">Loading…</div>}>
          <ProductListing />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
