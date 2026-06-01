"use client";

import { CreditCard, MapPin, PackageCheck, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { setCartItems } from "@/lib/cart/cartStorage";
import { setWishlistItems } from "@/lib/wishlist/wishlistStorage";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } catch {
        setProfile(null);
      } finally {
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
            {loading ? (
              <>
                <h2>Loading…</h2>
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
          <section className="profile-panel luxury-panel">
            <div className="profile-stat"><PackageCheck /><span><b>0</b> Active Orders</span></div>
            <div className="profile-stat"><MapPin /><span><b>0</b> Saved Addresses</span></div>
            <div className="profile-stat"><CreditCard /><span><b>0</b> Payment Methods</span></div>
          </section>
          <section className="orders-panel luxury-panel">
            <h2>Recent Orders</h2>
            <article>
              <span>RG-00000</span>
              <b>Coming Soon</b>
              <small>Orders will appear here once checkout is enabled.</small>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
