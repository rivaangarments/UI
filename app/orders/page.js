"use client";

import Link from "next/link";
import { ChevronRight, ClipboardList, PackageCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchUserOrders } from "@/lib/firestore/orders";

function formatDate(value) {
  const millis = Number(value || 0);
  if (!millis) return "Recently placed";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(millis));
}

function formatStatus(value) {
  return String(value || "placed").replace(/_/g, " ");
}

function isActiveOrder(order) {
  return !["delivered", "cancelled"].includes(String(order.normalizedStatus || order.status || "").toLowerCase());
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const view = String(searchParams.get("view") || "active");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setOrders([]);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setOrders(await fetchUserOrders(user.uid));
      } catch (err) {
        const code = String(err?.code || "");
        setError(code === "permission-denied" ? "Firestore permission denied for orders." : "Unable to load orders.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const activeOrders = useMemo(() => orders.filter(isActiveOrder), [orders]);
  const pastOrders = useMemo(() => orders.filter((order) => !isActiveOrder(order)), [orders]);
  const visibleOrders = view === "past" ? pastOrders : view === "all" ? orders : activeOrders;

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container cart-header">
          <div>
            <h1>My Orders</h1>
            <p>Track active orders and review past purchases.</p>
          </div>
          <Link className="continue-shopping" href="/product">
            Continue Shopping <ChevronRight size={16} />
          </Link>
        </div>

        <div className="container orders-page-layout">
          <section className="orders-history-panel luxury-panel">
            <div className="orders-tabs" role="tablist" aria-label="Order views">
              <Link className={view === "active" ? "is-active" : ""} href="/orders?view=active">
                <Truck size={17} /> Active <b>{activeOrders.length}</b>
              </Link>
              <Link className={view === "past" ? "is-active" : ""} href="/orders?view=past">
                <PackageCheck size={17} /> Past <b>{pastOrders.length}</b>
              </Link>
              <Link className={view === "all" ? "is-active" : ""} href="/orders?view=all">
                <ClipboardList size={17} /> All <b>{orders.length}</b>
              </Link>
            </div>

            {loading ? (
              <article className="orders-history-empty">
                <h2>Loading orders...</h2>
                <p>Please wait while we fetch your order history.</p>
              </article>
            ) : error ? (
              <article className="orders-history-empty">
                <h2>Orders Unavailable</h2>
                <p>{error}</p>
              </article>
            ) : visibleOrders.length ? (
              <div className="orders-history-list">
                {visibleOrders.map((order) => (
                  <Link className="orders-history-row" href={`/orders/${encodeURIComponent(order.id)}`} key={order.id}>
                    <span>
                      <b>{order.orderNumber || order.id}</b>
                      <small>{formatDate(order.createdAtMillis)} - {formatStatus(order.status)}</small>
                    </span>
                    <span>
                      <b>Rs. {Number(order.total || 0).toLocaleString("en-IN")}</b>
                      <small>{Number(order.itemCount || 0)} items</small>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <article className="orders-history-empty">
                <h2>{view === "past" ? "No past orders" : "No active orders"}</h2>
                <p>{view === "past" ? "Delivered and cancelled orders will appear here." : "Your active orders will appear here after checkout."}</p>
                <Button href="/product" variant="gold">Shop Collection</Button>
              </article>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
