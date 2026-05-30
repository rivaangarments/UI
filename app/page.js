import { ArrowRight, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import CategorySection from "@/components/CategorySection/CategorySection";
import ProductSection from "@/components/ProductSection/ProductSection";
import Button from "@/components/Button/Button";
import { featuredProducts, newArrivals } from "@/data/products";

const benefits = [
  { icon: Truck, title: "Free Shipping", text: "On orders above ₹999" },
  { icon: RotateCcw, title: "Easy Returns", text: "Within 7 days" },
  { icon: ShieldCheck, title: "Secure Payments", text: "100% protected checkout" },
  { icon: Headphones, title: "24/7 Support", text: "Style help anytime" }
];

export default function Home() {
  return (
    <div className="site-shell">
      <Navbar />
      <main>
        <div className="container">
          <HeroBanner />
        </div>
        <CategorySection />
        <ProductSection
          title="Trending Now"
          description="Signature pieces picked for refined everyday dressing."
          mode="trending"
          limit={5}
          viewAllHref="/product"
          fallbackProducts={featuredProducts}
        />
        <section className="section promo-section">
          <div className="container promo-grid">
            <article className="promo-card dark">
              <span>New Arrivals</span>
              <h3>Fresh Styles Just Dropped</h3>
              <a href="/product?filter=new-arrivals">Shop Now <ArrowRight size={15} /></a>
            </article>
            <article className="promo-card gold">
              <span>Up to 50% Off</span>
              <h3>Summer Sale Is Live!</h3>
              <a href="/product?filter=sale">Shop Now <ArrowRight size={15} /></a>
            </article>
            <article className="promo-card dark">
              <span>Premium Quality</span>
              <h3>Crafted For Comfort</h3>
              <a href="/product">Shop Now <ArrowRight size={15} /></a>
            </article>
          </div>
        </section>
        <ProductSection
          title="New Arrivals"
          description="Quiet luxury staples with polished details."
          mode="new"
          limit={4}
          viewAllHref="/product?filter=new-arrivals"
          fallbackProducts={newArrivals}
        />
        <section className="benefits-band">
          <div className="container benefits-grid">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div className="benefit-item" key={title}>
                <Icon size={26} />
                <span>
                  <b>{title}</b>
                  <small>{text}</small>
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="section newsletter-section">
          <div className="container newsletter-card">
            <div>
              <span>Rivaan Insider</span>
              <h2>Receive private drops and festive edits first.</h2>
            </div>
            <form>
              <input type="email" placeholder="Enter your email" aria-label="Email" />
              <Button type="button">Subscribe</Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
