"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CreditCard, Download, MapPin, PackageCheck, Phone, ShieldCheck, Truck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ORDER_STATUS_STEPS, getOrderStatusProgress, subscribeToUserOrder } from "@/lib/firestore/orders";

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  const millis = Number(value || 0);
  if (!millis) return "Recently placed";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(millis));
}

function displayStatus(value) {
  return String(value || "placed")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function invoiceHtml(order, items, address) {
  const rows = items.map((item) => `
    <tr>
      <td>${escapeHtml(item.name || "Product")}<small>${escapeHtml([item.selectedSize, item.selectedColor].filter(Boolean).join(" / "))}</small></td>
      <td>${Number(item.qty || 1)}</td>
      <td>${formatCurrency(item.offerPrice)}</td>
      <td>${formatCurrency(item.lineTotal || Number(item.offerPrice || 0) * Number(item.qty || 1))}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(order.orderNumber || order.id)}</title>
  <style>
    body { margin: 0; padding: 34px; color: #1c1814; font-family: Arial, sans-serif; }
    .invoice { max-width: 820px; margin: 0 auto; border: 1px solid #ead8b7; padding: 28px; }
    h1 { margin: 0; font-size: 28px; }
    h2 { margin: 28px 0 10px; font-size: 16px; }
    .top { display: flex; justify-content: space-between; gap: 20px; border-bottom: 1px solid #eee1cd; padding-bottom: 20px; }
    .muted, small { color: #746b60; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    th, td { border-bottom: 1px solid #eee1cd; padding: 12px 8px; text-align: left; vertical-align: top; }
    th:nth-child(n+2), td:nth-child(n+2) { text-align: right; }
    td small { display: block; margin-top: 4px; }
    .totals { width: 320px; margin-left: auto; margin-top: 18px; }
    .totals p { display: flex; justify-content: space-between; margin: 9px 0; }
    .total { border-top: 1px solid #eee1cd; padding-top: 10px; font-size: 18px; font-weight: 700; }
  </style>
</head>
<body>
  <main class="invoice">
    <section class="top">
      <div>
        <h1>Rivaan Garments</h1>
        <p class="muted">Order Invoice</p>
      </div>
      <div>
        <b>${escapeHtml(order.orderNumber || order.id)}</b>
        <p class="muted">${escapeHtml(formatDate(order.createdAtMillis))}</p>
        <p class="muted">Status: ${escapeHtml(displayStatus(order.status))}</p>
      </div>
    </section>
    <h2>Bill To</h2>
    <p>
      <b>${escapeHtml(address.fullName || order.customer?.fullName || "Customer")}</b><br />
      ${escapeHtml(address.line1)}<br />
      ${address.line2 ? `${escapeHtml(address.line2)}<br />` : ""}
      ${escapeHtml([address.city, address.state, address.pincode].filter(Boolean).join(", "))}<br />
      ${escapeHtml(address.mobile || order.customer?.mobile || "")}
    </p>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <section class="totals">
      <p><span>Subtotal</span><b>${formatCurrency(order.subtotal)}</b></p>
      <p><span>Discount</span><b>-${formatCurrency(order.discount)}</b></p>
      <p><span>Shipping</span><b>${Number(order.shipping || 0) ? formatCurrency(order.shipping) : "FREE"}</b></p>
      <p class="total"><span>Total</span><b>${formatCurrency(order.total)}</b></p>
    </section>
  </main>
</body>
</html>`;
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <p>
      <span>{label}</span>
      <b>{value}</b>
    </p>
  );
}

function StatusTracker({ status }) {
  const statusMeta = getOrderStatusProgress(status);

  if (statusMeta.cancelled) {
    return (
      <div className="status-cancelled" role="status">
        <b>Order Cancelled</b>
        <span>This order is no longer active.</span>
      </div>
    );
  }

  return (
    <div className="status-tracker" aria-label={`Order status ${displayStatus(statusMeta.normalized)}`}>
      <div className="status-line" aria-hidden="true">
        <span style={{ width: `${statusMeta.progress}%` }} />
      </div>
      <div className="status-steps">
        {ORDER_STATUS_STEPS.map((step, index) => {
          const done = index <= statusMeta.activeIndex;
          return (
            <div className={`status-step ${done ? "is-done" : ""}`} key={step.key}>
              <span>{done ? <PackageCheck size={15} /> : index + 1}</span>
              <b>{step.label}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = String(params?.id || "");
  const [loading, setLoading] = useState(true);
  const [userReady, setUserReady] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeOrder = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeOrder();
      setOrder(null);
      setError("");
      setUserReady(true);

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubscribeOrder = subscribeToUserOrder(
        user.uid,
        orderId,
        (nextOrder) => {
          setOrder(nextOrder);
          setError(nextOrder ? "" : "Order not found or you do not have access to it.");
          setLoading(false);
        },
        (err) => {
          const code = String(err?.code || "");
          setError(code === "permission-denied" ? "Firestore permission denied for this order." : "Unable to load this order.");
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeOrder();
      unsubscribeAuth();
    };
  }, [orderId]);

  const address = order?.shippingAddress || {};
  const items = useMemo(() => (Array.isArray(order?.items) ? order.items : []), [order]);

  function handleDownloadInvoice() {
    if (!order) return;
    const blob = new Blob([invoiceHtml(order, items, address)], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${String(order.orderNumber || order.id).replace(/[^a-z0-9-]/gi, "-")}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <div className="container cart-header">
          <div>
            <h1>Order Details</h1>
            <p>{order ? `${order.orderNumber || order.id} - ${displayStatus(order.status)}` : "Track your order"}</p>
          </div>
          <Link className="continue-shopping" href="/profile#recent-orders">
            Back to Profile <ChevronRight size={16} />
          </Link>
        </div>

        <div className="container order-detail-layout">
          {loading || !userReady ? (
            <section className="order-detail-main luxury-panel">
              <h2>Loading order...</h2>
              <p className="order-muted">Please wait while we fetch the latest order status.</p>
            </section>
          ) : error ? (
            <section className="cart-empty luxury-panel">
              <h2>Order Unavailable</h2>
              <p>{error}</p>
              <Button href="/profile" variant="gold">Go to Profile</Button>
            </section>
          ) : order ? (
            <>
              <section className="order-detail-main luxury-panel">
                <div className="order-title-row">
                  <div>
                    <span>Order Number</span>
                    <h2>{order.orderNumber || order.id}</h2>
                  </div>
                  <b className="order-status-pill">{displayStatus(order.status)}</b>
                </div>

                <StatusTracker status={order.status} />

                <div className="order-section" id="ordered-items">
                  <div className="checkout-section-title">
                    <Truck size={21} />
                    <h2>Ordered Items</h2>
                  </div>
                  <div className="order-items-list">
                    {items.map((item, index) => (
                      <article className="order-product-row" key={`${String(item.id)}-${index}`}>
                        <Image src={item.image || "/images/products/polo.svg"} alt={item.name || "Product"} width={78} height={86} />
                        <div>
                          <h3>{item.name || "Product"}</h3>
                          <p>
                            Qty {Number(item.qty || 1)}
                            {item.selectedSize ? ` - ${item.selectedSize}` : ""}
                            {item.selectedColor ? ` - ${item.selectedColor}` : ""}
                          </p>
                        </div>
                        <b>{formatCurrency(item.lineTotal || Number(item.offerPrice || 0) * Number(item.qty || 1))}</b>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="order-info-grid">
                  <section className="order-info-card" id="delivery-address">
                    <div className="checkout-section-title">
                      <MapPin size={21} />
                      <h2>Delivery Address</h2>
                    </div>
                    <p className="address-block">
                      <b>{address.fullName || order.customer?.fullName || "Customer"}</b>
                      <span>{address.line1}</span>
                      {address.line2 ? <span>{address.line2}</span> : null}
                      <span>{[address.city, address.state, address.pincode].filter(Boolean).join(", ")}</span>
                      {address.mobile ? <span className="address-phone"><Phone size={15} /> {address.mobile}</span> : null}
                    </p>
                  </section>

                  <section className="order-info-card" id="payment-details">
                    <div className="checkout-section-title">
                      <CreditCard size={21} />
                      <h2>Payment</h2>
                    </div>
                    <DetailRow label="Method" value={order.paymentMethod || "Cash on Delivery"} />
                    <DetailRow label="Payment Status" value={displayStatus(order.paymentStatus || "pending")} />
                    <DetailRow label="Order Placed" value={formatDate(order.createdAtMillis)} />
                  </section>
                </div>
              </section>

              <aside className="summary-card order-detail-summary luxury-panel">
                <h2>Bill Summary</h2>
                <p><span>Subtotal</span><b>{formatCurrency(order.subtotal)}</b></p>
                <p><span>Discount</span><b>-{formatCurrency(order.discount)}</b></p>
                <p><span>Shipping</span><b>{Number(order.shipping || 0) ? formatCurrency(order.shipping) : "FREE"}</b></p>
                <hr />
                <p className="total"><span>Total</span><b>{formatCurrency(order.total)}</b></p>
                <Button type="button" variant="gold" className="invoice-download-btn" icon={false} onClick={handleDownloadInvoice}>
                  <Download size={18} />
                  Download Invoice
                </Button>
                <div className="secure-row">
                  <ShieldCheck size={16} />
                  <span>Status updates live from Firebase</span>
                </div>
                <div className="order-customer-card">
                  <UserRound size={18} />
                  <span>
                    <b>{order.customer?.fullName || address.fullName || "Customer"}</b>
                    <small>{order.customer?.email || ""}</small>
                  </span>
                </div>
              </aside>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
