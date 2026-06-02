import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ORDER_COLLECTION = "order";
export const ORDER_STATUS_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" }
];

const STATUS_ALIASES = {
  new: "placed",
  created: "placed",
  pending: "placed",
  processing: "confirmed",
  accepted: "confirmed",
  ready: "packed",
  dispatched: "shipped",
  in_transit: "shipped",
  transit: "shipped",
  outfordelivery: "out_for_delivery",
  out_for_delivery: "out_for_delivery",
  completed: "delivered",
  complete: "delivered",
  cancelled: "cancelled",
  canceled: "cancelled"
};

function money(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? Math.max(0, Math.round(num)) : 0;
}

function cleanString(value) {
  return String(value || "").trim();
}

function timestampToMillis(value) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
}

function normalizeOrderDocument(document) {
  if (!document?.exists?.()) return null;
  const data = document.data();
  return {
    id: document.id,
    ...data,
    normalizedStatus: normalizeOrderStatus(data.status),
    createdAtMillis: timestampToMillis(data.createdAt),
    updatedAtMillis: timestampToMillis(data.updatedAt)
  };
}

export function normalizeOrderStatus(status) {
  const raw = String(status || "placed").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const compact = raw.replace(/_/g, "");
  return STATUS_ALIASES[raw] || STATUS_ALIASES[compact] || raw || "placed";
}

export function getOrderStatusProgress(status) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "cancelled") return { normalized, activeIndex: -1, progress: 0, cancelled: true };

  const statusIndex = ORDER_STATUS_STEPS.findIndex((step) => step.key === normalized);
  const activeIndex = Math.max(0, statusIndex);
  const progress = ORDER_STATUS_STEPS.length <= 1 ? 100 : Math.round((activeIndex / (ORDER_STATUS_STEPS.length - 1)) * 100);
  return { normalized, activeIndex, progress, cancelled: false, known: statusIndex >= 0 };
}

export function makeOrderNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RG-${stamp}-${suffix}`;
}

export function calculateOrderTotals(items) {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = safeItems.reduce((sum, item) => {
    return sum + money(item.offerPrice) * Math.max(1, Number(item.qty || 1));
  }, 0);
  const discount = subtotal > 0 ? Math.min(499, subtotal) : 0;
  const shipping = 0;
  const total = money(subtotal - discount + shipping);

  return { subtotal, discount, shipping, total };
}

export function normalizeOrderItem(item) {
  const qty = Math.max(1, Math.min(99, Number(item?.qty || 1)));
  const offerPrice = money(item?.offerPrice);
  const price = money(item?.price || offerPrice);

  return {
    id: cleanString(item?.id),
    slug: cleanString(item?.slug || item?.id),
    name: cleanString(item?.name || "Product"),
    category: cleanString(item?.category),
    image: cleanString(item?.image),
    selectedColor: cleanString(item?.selectedColor),
    selectedSize: cleanString(item?.selectedSize),
    price,
    offerPrice,
    qty,
    lineTotal: offerPrice * qty
  };
}

export async function createOrder({ user, profile, items, address, paymentMethod, note }) {
  if (!user?.uid) throw new Error("Please login before placing your order.");

  const orderItems = (Array.isArray(items) ? items : []).map(normalizeOrderItem).filter((item) => item.id);
  if (!orderItems.length) throw new Error("Your cart is empty.");

  const totals = calculateOrderTotals(orderItems);
  const orderNumber = makeOrderNumber();
  const safeAddress = {
    fullName: cleanString(address?.fullName || profile?.fullName || user.displayName),
    mobile: cleanString(address?.mobile || profile?.mobile),
    line1: cleanString(address?.line1),
    line2: cleanString(address?.line2),
    city: cleanString(address?.city),
    state: cleanString(address?.state),
    pincode: cleanString(address?.pincode)
  };

  const payload = {
    orderNumber,
    uid: user.uid,
    userId: user.uid,
    customer: {
      fullName: safeAddress.fullName,
      email: cleanString(profile?.email || user.email),
      mobile: safeAddress.mobile
    },
    shippingAddress: safeAddress,
    items: orderItems,
    itemCount: orderItems.reduce((sum, item) => sum + item.qty, 0),
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.total,
    paymentMethod: cleanString(paymentMethod || "Cash on Delivery"),
    paymentStatus: "pending",
    status: "placed",
    note: cleanString(note),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, ORDER_COLLECTION), payload);
  return { id: ref.id, ...payload };
}

export async function fetchUserOrders(uid) {
  if (!uid) return [];

  const snapshot = await getDocs(query(collection(db, ORDER_COLLECTION), where("uid", "==", uid)));
  const orders = snapshot.docs.map((document) => {
    return normalizeOrderDocument(document);
  });

  return orders.sort((a, b) => b.createdAtMillis - a.createdAtMillis);
}

export async function fetchUserOrderById(uid, orderId) {
  if (!uid || !orderId) return null;
  const snap = await getDoc(doc(db, ORDER_COLLECTION, String(orderId)));
  const order = normalizeOrderDocument(snap);
  if (!order || String(order.uid || order.userId || "") !== String(uid)) return null;
  return order;
}

export function subscribeToUserOrder(uid, orderId, callback, onError) {
  if (!uid || !orderId) return () => {};

  return onSnapshot(
    doc(db, ORDER_COLLECTION, String(orderId)),
    (snap) => {
      const order = normalizeOrderDocument(snap);
      if (!order || String(order.uid || order.userId || "") !== String(uid)) {
        callback(null);
        return;
      }
      callback(order);
    },
    (err) => {
      if (typeof onError === "function") onError(err);
    }
  );
}
