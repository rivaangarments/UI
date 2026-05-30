import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";

export default function NotFound() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="not-found-page container">
        <span>404</span>
        <h1>Page Not Found</h1>
        <p>The page you are looking for may have been moved, renamed, or is no longer available.</p>
        <div>
          <Button href="/">Back Home</Button>
          <Link className="view-link" href="/product">Shop Collection</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
