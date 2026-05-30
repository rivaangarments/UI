"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/Button/Button";
import { fetchHeroBanner } from "@/lib/firestore/banners";

export default function HeroBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchHeroBanner()
      .then((data) => {
        if (!mounted) return;
        if (data) setBanner(data);
      })
      .catch((err) => {
        // Keep UI stable with the local fallback hero image,
        // but surface the error in dev so we can verify Firestore + fields quickly.
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[HeroBanner] Firestore /banners fetch failed; using fallback hero image.", err);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const kicker = banner?.kicker || "New Collection";
  const title = banner?.title || "Elevate Your";
  const highlight = banner?.highlight || "Style Everyday";
  const subtitle = banner?.subtitle || "Premium quality garments crafted for comfort, ceremony, and modern confidence.";
  const primaryCtaLabel = banner?.primaryCtaLabel || "Shop Now";
  const primaryCtaHref = banner?.primaryCtaHref || "/product";
  const secondaryCtaLabel = banner?.secondaryCtaLabel || "Explore Collection";
  const secondaryCtaHref = banner?.secondaryCtaHref || "/product?filter=new-arrivals";
  const imageSrc = banner?.image || "/images/banners/hero.svg";
  const isSvg = typeof imageSrc === "string" && imageSrc.toLowerCase().endsWith(".svg");

  return (
    <section className="hero-banner fade-in">
      <div className="hero-copy">
        <span>{kicker}</span>
        <h1>
          {title} <strong>{highlight}</strong>
        </h1>
        <p>{subtitle}</p>
        <div className="hero-actions">
          <Button href={primaryCtaHref}>{primaryCtaLabel}</Button>
          <Button href={secondaryCtaHref} variant="ghost">{secondaryCtaLabel}</Button>
        </div>
      </div>
      <div className="hero-image">
        <Image
          src={imageSrc}
          alt="Rivaan Garments hero banner"
          fill
          priority
          sizes="(max-width: 800px) 100vw, 60vw"
          unoptimized={isSvg}
        />
      </div>
      <div className="hero-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
