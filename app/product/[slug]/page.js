import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductDetailsClient from "@/components/ProductDetailsClient/ProductDetailsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <ProductDetailsClient slug={slug} />
      </main>
      <Footer />
    </div>
  );
}

