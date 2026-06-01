"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

function isPublicPath(pathname) {
  const path = String(pathname || "");
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const publicPath = useMemo(() => isPublicPath(pathname), [pathname]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setSignedIn(!!user);
      setReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ready) return;

    // Not signed in: block everything except auth pages.
    if (!signedIn && !publicPath) {
      router.replace("/login");
      return;
    }

    // Signed in: keep auth pages accessible but redirect away from login/register.
    if (signedIn && publicPath) {
      router.replace("/");
    }
  }, [ready, signedIn, publicPath, router]);

  if (!ready) {
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

  // If we're about to redirect, keep the UI calm and prevent flashes.
  if ((!signedIn && !publicPath) || (signedIn && publicPath)) {
    return (
      <div className="gate-screen" aria-busy="true" aria-label="Redirecting">
        <div className="gate-card">
          <div className="gate-mark" aria-hidden="true" />
          <b>Redirecting…</b>
          <span>Please wait</span>
        </div>
      </div>
    );
  }

  return children;
}

