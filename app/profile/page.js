"use client";

import Link from "next/link";
import { CreditCard, MapPin, PackageCheck, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { setCartItems } from "@/lib/cart/cartStorage";
import { setWishlistItems } from "@/lib/wishlist/wishlistStorage";
import { fetchUserOrders } from "@/lib/firestore/orders";
import { normalizeSavedAddresses } from "@/lib/firestore/addresses";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile(snap.exists() ? snap.data() : null);
        setOrders(await fetchUserOrders(u.uid));
      } catch {
        setProfile(null);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function handleLogout() {
    // Clear client-side shopping state on logout so counts/items don't linger.
    setCartItems([]);
    setWishlistItems([]);
    try {
      window.sessionStorage.removeItem("rivaan_pending_cart_add_v1");
    } catch {
      // ignore
    }
    await signOut(auth);
    router.replace("/");
  }

  const displayName = String(profile?.fullName || user?.displayName || "My Account");
  const displayEmail = String(profile?.email || user?.email || "");
  const displayMobile = String(profile?.mobile || "");
  const latestOrderNumber = String(searchParams.get("order") || "");
  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(String(order.normalizedStatus || order.status || "").toLowerCase()));
  const activeOrderCount = activeOrders.length;
  const visibleOrders = activeOrders;
  const latestOrder = orders[0] || null;
  const latestOrderHref = latestOrder ? `/orders/${encodeURIComponent(latestOrder.id)}` : "/product";
  const savedAddressCount = normalizeSavedAddresses(profile?.addresses).length;

  function formatDate(value) {
    const millis = Number(value || 0);
    if (!millis) return "Recently placed";
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(millis));
  }

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container page-title">
          <h1>My Profile</h1>
          <p>Manage account details, addresses, and recent orders.</p>
          {latestOrderNumber ? <p className="order-success-note">Order {latestOrderNumber} placed successfully.</p> : null}
        </div>
        <div className="container profile-grid">
          <aside className="profile-card luxury-panel">
            <span className="profile-avatar"><UserRound size={34} /></span>
            {loading ? (
              <>
                <h2>Loading...</h2>
                <p>Please wait</p>
              </>
            ) : user ? (
              <>
                <h2>{displayName}</h2>
                <p>{displayEmail}</p>
                {displayMobile ? (
                  <p className="profile-mobile">
                    <Phone size={16} /> {displayMobile}
                  </p>
                ) : null}
                <div className="profile-actions">
                  <Button href="/product">Continue Shopping</Button>
                  <Button type="button" variant="ghost" icon={false} onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2>Not Signed In</h2>
                <p>Please login to view your profile.</p>
                <Button href="/login">Go to Login</Button>
              </>
            )}
          </aside>
          <section className="profile-panel luxury-panel" aria-label="Profile shortcuts">
            <Link className="profile-stat profile-stat-link" href="/orders?view=active">
              <PackageCheck />
              <span><b>{activeOrderCount}</b> Active Orders</span>
            </Link>
            <Link className="profile-stat profile-stat-link" href={`${latestOrderHref}#delivery-address`}>
              <MapPin />
              <span><b>{savedAddressCount || (orders.length ? 1 : 0)}</b> Recent Address</span>
            </Link>
            <Link className="profile-stat profile-stat-link" href={`${latestOrderHref}#payment-details`}>
              <CreditCard />
              <span><b>{latestOrder?.paymentMethod ? String(latestOrder.paymentMethod).replace("Cash on Delivery", "COD") : "COD"}</b> Payment Mode</span>
            </Link>
          </section>
          <section className="orders-panel luxury-panel" id="recent-orders">
            <div className="orders-heading-row">
              <h2>Recent Orders</h2>
              <Link href="/orders">View All</Link>
            </div>
            {ordersLoading ? (
              <article>
                <span>Loading orders</span>
                <b>Please wait</b>
                <small>Fetching your latest Firebase order details.</small>
              </article>
            ) : visibleOrders.length ? (
              visibleOrders.slice(0, 8).map((order) => (
                <Link
                  className={`order-row-link ${order.orderNumber === latestOrderNumber ? "is-highlighted" : ""}`}
                  href={`/orders/${encodeURIComponent(order.id)}`}
                  key={order.id}
                >
                  <span>{order.orderNumber || order.id}</span>
                  <b>Rs. {Number(order.total || 0).toLocaleString("en-IN")}</b>
                  <small>
                    {formatDate(order.createdAtMillis)} - {String(order.status || "placed").replace(/_/g, " ")}
                    {Number(order.itemCount || 0) ? ` - ${Number(order.itemCount)} items` : ""}
                  </small>
                </Link>
              ))
            ) : (
              <article>
                <span>No active orders</span>
                <b>All Clear</b>
                <small>Delivered orders are available from My Orders.</small>
              </article>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
