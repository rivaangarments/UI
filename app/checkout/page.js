"use client";

import Link from "next/link";
import { ChevronRight, CreditCard, MapPin, PackageCheck, Phone, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getCartCount, getCartItems, setCartItems } from "@/lib/cart/cartStorage";
import { calculateOrderTotals, createOrder } from "@/lib/firestore/orders";

const initialAddress = {
  fullName: "",
  mobile: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: ""
};

function cleanPhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        const data = snap.exists() ? snap.data() : null;
        setProfile(data);
        setAddress((current) => ({
          ...current,
          fullName: current.fullName || data?.fullName || currentUser.displayName || "",
          mobile: current.mobile || data?.mobile || ""
        }));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const itemCount = useMemo(() => getCartCount(items), [items]);
  const totals = useMemo(() => calculateOrderTotals(items), [items]);

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const required = [
      ["fullName", "Please enter the receiver name."],
      ["mobile", "Please enter a mobile number."],
      ["line1", "Please enter your delivery address."],
      ["city", "Please enter your city."],
      ["state", "Please enter your state."],
      ["pincode", "Please enter your pincode."]
    ];

    for (const [field, msg] of required) {
      if (!String(address[field] || "").trim()) return msg;
    }

    const phone = cleanPhone(address.mobile);
    if (phone.length < 10) return "Please enter a valid mobile number.";
    if (String(address.pincode || "").replace(/\D/g, "").length < 6) return "Please enter a valid pincode.";
    return "";
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (placing) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPlacing(true);
      const order = await createOrder({
        user,
        profile,
        items,
        address: { ...address, mobile: cleanPhone(address.mobile) },
        paymentMethod,
        note
      });

      setCartItems([]);
      setItems([]);
      setMessage(`Order ${order.orderNumber} placed successfully.`);
      router.push(`/profile?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (err) {
      const code = String(err?.code || "");
      if (code === "permission-denied") {
        setError("Firestore permission denied. Please allow authenticated users to create documents in the order collection.");
      } else {
        setError(String(err?.message || "Unable to place this order. Please try again."));
      }
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container cart-header">
          <div>
            <h1>Checkout</h1>
            <p>{loading ? "Preparing your order" : `${itemCount} items ready to order`}</p>
          </div>
          <Link className="continue-shopping" href="/cart">
            Back to Cart <ChevronRight size={16} />
          </Link>
        </div>

        <form className={`container checkout-layout ${items.length ? "" : "is-empty"}`} onSubmit={handlePlaceOrder}>
          {items.length ? (
            <>
              <section className="checkout-panel luxury-panel">
                <div className="checkout-section-title">
                  <MapPin size={21} />
                  <h2>Delivery Address</h2>
                </div>
                <div className="checkout-form-grid">
                  <label className="checkout-field">
                    <span>Receiver Name</span>
                    <div>
                      <UserRound size={18} />
                      <input value={address.fullName} onChange={(e) => updateAddress("fullName", e.target.value)} autoComplete="name" />
                    </div>
                  </label>
                  <label className="checkout-field">
                    <span>Mobile Number</span>
                    <div>
                      <Phone size={18} />
                      <input type="tel" inputMode="numeric" value={address.mobile} onChange={(e) => updateAddress("mobile", e.target.value)} autoComplete="tel" />
                    </div>
                  </label>
                  <label className="checkout-field checkout-field-wide">
                    <span>Address Line 1</span>
                    <div>
                      <MapPin size={18} />
                      <input value={address.line1} onChange={(e) => updateAddress("line1", e.target.value)} autoComplete="address-line1" />
                    </div>
                  </label>
                  <label className="checkout-field checkout-field-wide">
                    <span>Address Line 2</span>
                    <div>
                      <MapPin size={18} />
                      <input value={address.line2} onChange={(e) => updateAddress("line2", e.target.value)} autoComplete="address-line2" />
                    </div>
                  </label>
                  <label className="checkout-field">
                    <span>City</span>
                    <div>
                      <input value={address.city} onChange={(e) => updateAddress("city", e.target.value)} autoComplete="address-level2" />
                    </div>
                  </label>
                  <label className="checkout-field">
                    <span>State</span>
                    <div>
                      <input value={address.state} onChange={(e) => updateAddress("state", e.target.value)} autoComplete="address-level1" />
                    </div>
                  </label>
                  <label className="checkout-field">
                    <span>Pincode</span>
                    <div>
                      <input inputMode="numeric" value={address.pincode} onChange={(e) => updateAddress("pincode", e.target.value)} autoComplete="postal-code" />
                    </div>
                  </label>
                </div>

                <div className="checkout-section-title payment-title">
                  <CreditCard size={21} />
                  <h2>Payment</h2>
                </div>
                <div className="payment-options">
                  {["Cash on Delivery", "UPI on Delivery"].map((method) => (
                    <label className={paymentMethod === method ? "is-selected" : ""} key={method}>
                      <input type="radio" name="paymentMethod" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                      {method === "Cash on Delivery" ? <Wallet size={19} /> : <CreditCard size={19} />}
                      <span>{method}</span>
                    </label>
                  ))}
                </div>

                <label className="checkout-note">
                  <span>Order Note</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Optional delivery instructions" />
                </label>

                {error ? <p className="auth-msg auth-msg-error" role="alert">{error}</p> : null}
                {message ? <p className="auth-msg auth-msg-success" role="status">{message}</p> : null}
              </section>

              <aside className="summary-card checkout-summary luxury-panel">
                <h2>Order Summary</h2>
                <div className="checkout-items">
                  {items.map((item) => (
                    <div className="checkout-item" key={`${String(item.id)}::${String(item.selectedColor || "")}::${String(item.selectedSize || "")}`}>
                      <span>{item.name}</span>
                      <small>
                        Qty {Number(item.qty || 1)}
                        {item.selectedSize ? ` - ${item.selectedSize}` : ""}
                      </small>
                      <b>Rs. {(Number(item.offerPrice || 0) * Number(item.qty || 1)).toLocaleString("en-IN")}</b>
                    </div>
                  ))}
                </div>
                <p><span>Subtotal</span><b>Rs. {totals.subtotal.toLocaleString("en-IN")}</b></p>
                <p><span>Discount</span><b>-Rs. {totals.discount.toLocaleString("en-IN")}</b></p>
                <p><span>Shipping</span><b>{totals.shipping ? `Rs. ${totals.shipping.toLocaleString("en-IN")}` : "FREE"}</b></p>
                <hr />
                <p className="total"><span>Total</span><b>Rs. {totals.total.toLocaleString("en-IN")}</b></p>
                <Button type="submit" variant="gold" disabled={placing || loading} icon={!placing}>
                  {placing ? "Placing Order..." : "Place Order"}
                </Button>
                <div className="secure-row">
                  <ShieldCheck size={16} />
                  <span>Saved securely to Firebase</span>
                </div>
              </aside>
            </>
          ) : (
            <section className="cart-empty luxury-panel">
              <PackageCheck size={42} />
              <h2>No checkout items</h2>
              <p>Your cart is empty. Add products before placing an order.</p>
              <Button href="/product" variant="gold">
                Shop Collection
              </Button>
            </section>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}
