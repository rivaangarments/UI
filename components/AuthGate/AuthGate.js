"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { addToCart } from "@/lib/cart/cartStorage";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
const PROTECTED_PATHS = ["/profile"];
const PENDING_CART_KEY = "rivaan_pending_cart_add_v1";

function isPublicPath(pathname) {
  const path = String(pathname || "");
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

function isProtectedPath(pathname) {
  const path = String(pathname || "");
  return PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

function safeNext(pathname) {
  const path = String(pathname || "");
  return path.startsWith("/") ? path : "/";
}

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const publicPath = useMemo(() => isPublicPath(pathname), [pathname]);
  const protectedPath = useMemo(() => isProtectedPath(pathname), [pathname]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setSignedIn(!!user);
      setReady(true);

      // If an unauth user tried "Add to cart / Buy now", we store the payload and
      // replay it as soon as they sign in.
      if (user && typeof window !== "undefined") {
        const raw = window.sessionStorage.getItem(PENDING_CART_KEY);
        if (raw) {
          try {
            const item = JSON.parse(raw);
            window.sessionStorage.removeItem(PENDING_CART_KEY);
            if (item && typeof item === "object") addToCart(item);
          } catch {
            window.sessionStorage.removeItem(PENDING_CART_KEY);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Only protect specific pages (the rest of the website stays public).
    if (!signedIn && protectedPath && !publicPath) {
      const next = safeNext(pathname);
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [ready, signedIn, protectedPath, publicPath, pathname, router]);

  // For protected pages, keep the UI calm until we know the auth state.
  if (protectedPath && !ready) {
    return (
      <div className="gate-screen" aria-busy="true" aria-label="Loading">
        <div className="gate-card">
          <div className="gate-mark" aria-hidden="true" />
          <b>Loading…</b>
          <span>Please wait</span>
        </div>
      </div>
    );
  }

  return children;
}
