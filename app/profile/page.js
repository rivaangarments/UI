import { CreditCard, MapPin, PackageCheck, UserRound } from "lucide-react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";

export default function ProfilePage() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container page-title">
          <h1>My Profile</h1>
          <p>Manage account details, addresses, and recent orders.</p>
        </div>
        <div className="container profile-grid">
          <aside className="profile-card luxury-panel">
            <span className="profile-avatar"><UserRound size={34} /></span>
            <h2>Priya Sharma</h2>
            <p>priyasharma@gmail.com</p>
            <Button href="/product">Continue Shopping</Button>
          </aside>
          <section className="profile-panel luxury-panel">
            <div className="profile-stat"><PackageCheck /><span><b>3</b> Active Orders</span></div>
            <div className="profile-stat"><MapPin /><span><b>2</b> Saved Addresses</span></div>
            <div className="profile-stat"><CreditCard /><span><b>4</b> Payment Methods</span></div>
          </section>
          <section className="orders-panel luxury-panel">
            <h2>Recent Orders</h2>
            {["RG-24018", "RG-24011", "RG-23984"].map((order, index) => (
              <article key={order}>
                <span>{order}</span>
                <b>{index === 0 ? "Arriving Tomorrow" : "Delivered"}</b>
                <small>Premium garments order</small>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
