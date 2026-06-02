import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function clean(value) {
  return String(value || "").trim();
}

function cleanPhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

export function normalizeAddress(address, fallback = {}) {
  return {
    fullName: clean(address?.fullName || fallback?.fullName),
    mobile: cleanPhone(address?.mobile || fallback?.mobile),
    line1: clean(address?.line1),
    line2: clean(address?.line2),
    city: clean(address?.city),
    state: clean(address?.state),
    pincode: clean(address?.pincode)
  };
}

export function addressKey(address) {
  const safe = normalizeAddress(address);
  return [
    safe.fullName,
    safe.mobile,
    safe.line1,
    safe.line2,
    safe.city,
    safe.state,
    safe.pincode
  ]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function addressId(address) {
  const key = addressKey(address);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return `addr_${hash.toString(36)}`;
}

export function isUsableAddress(address) {
  const safe = normalizeAddress(address);
  return Boolean(safe.fullName && safe.mobile && safe.line1 && safe.city && safe.state && safe.pincode);
}

export function normalizeSavedAddresses(addresses) {
  const seen = new Set();
  const safeAddresses = [];

  for (const address of Array.isArray(addresses) ? addresses : []) {
    if (!isUsableAddress(address)) continue;
    const safe = normalizeAddress(address);
    const key = addressKey(safe);
    if (seen.has(key)) continue;
    seen.add(key);
    safeAddresses.push({
      id: clean(address?.id) || addressId(safe),
      label: clean(address?.label) || "Saved Address",
      ...safe
    });
  }

  return safeAddresses;
}

export async function saveUserAddress(uid, address, existingAddresses = []) {
  if (!uid || !isUsableAddress(address)) return [];

  const safe = normalizeAddress(address);
  const key = addressKey(safe);
  const nextAddress = {
    id: addressId(safe),
    label: "Saved Address",
    ...safe
  };

  const merged = [
    nextAddress,
    ...normalizeSavedAddresses(existingAddresses).filter((item) => addressKey(item) !== key)
  ].slice(0, 5);

  await setDoc(
    doc(db, "users", uid),
    {
      addresses: merged,
      defaultAddressId: nextAddress.id,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  return merged;
}

export async function fetchUserAddresses(uid) {
  if (!uid) return [];
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  return normalizeSavedAddresses(snap.data()?.addresses);
}
