"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

function isRemoteOrLocalUrl(value) {
  const s = String(value || "").trim();
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/");
}

async function resolveMaybeStoragePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (isRemoteOrLocalUrl(raw)) return raw;
  try {
    return await getDownloadURL(ref(storage, raw.replace(/^\/+/, "")));
  } catch {
    return null;
  }
}

export default function ProductGallery({ product }) {
  const initial = (product.gallery && product.gallery[0]) || product.image;
  const [active, setActive] = useState(initial);
  const [activeSrc, setActiveSrc] = useState(active);

  useEffect(() => {
    let mounted = true;
    setActiveSrc(active);

    if (!active) return () => { mounted = false; };
    if (isRemoteOrLocalUrl(active)) return () => { mounted = false; };

    resolveMaybeStoragePath(active).then((url) => {
      if (!mounted) return;
      setActiveSrc(url || "/images/products/polo.svg");
    });

    return () => {
      mounted = false;
    };
  }, [active]);

  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <Image
          src={activeSrc}
          alt={product.name}
          width={720}
          height={860}
          priority
          sizes="(max-width: 980px) 100vw, 50vw"
        />
      </div>
      <div className="gallery-thumbs">
        {(product.gallery || [product.image]).filter(Boolean).map((image) => (
          <button
            className={active === image ? "active" : ""}
            key={image}
            onClick={() => {
              setActive(image);
            }}
            aria-label={`View ${product.name} image`}
          >
            <Image
              src={isRemoteOrLocalUrl(image) ? image : "/images/products/polo.svg"}
              alt=""
              width={96}
              height={112}
              sizes="96px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
