"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button/Button";
import { fetchHeroBanners } from "@/lib/firestore/banners";

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetchHeroBanners()
      .then((items) => {
        if (!mounted) return;
        const list = Array.isArray(items) ? items : [];
        setBanners(list);
        setActive(0);
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

  useEffect(() => {
    if (!banners.length) return;
    if (banners.length <= 1) return;
    const t = window.setInterval(() => {
      setActive((idx) => (idx + 1) % banners.length);
    }, 3000);
    return () => window.clearInterval(t);
  }, [banners.length]);

  const banner = banners[active] || null;
  const fallback = useMemo(
    () => ({
      kicker: "New Collection",
      title: "Elevate Your",
      highlight: "Style Everyday",
      subtitle: "Premium quality garments crafted for comfort, ceremony, and modern confidence.",
      primaryCtaLabel: "Shop Now",
      primaryCtaHref: "/product",
      secondaryCtaLabel: "Explore Collection",
      secondaryCtaHref: "/product?filter=new-arrivals",
      image: "/images/banners/hero.svg"
    }),
    []
  );

  const kicker = banner?.kicker || fallback.kicker;
  const title = banner?.title || fallback.title;
  const highlight = banner?.highlight || fallback.highlight;
  const subtitle = banner?.subtitle || fallback.subtitle;
  const primaryCtaLabel = banner?.primaryCtaLabel || fallback.primaryCtaLabel;
  const primaryCtaHref = banner?.primaryCtaHref || fallback.primaryCtaHref;
  const secondaryCtaLabel = banner?.secondaryCtaLabel || fallback.secondaryCtaLabel;
  const secondaryCtaHref = banner?.secondaryCtaHref || fallback.secondaryCtaHref;

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
        {(banners.length ? banners : [fallback]).map((b, idx) => {
          const src = b?.image || fallback.image;
          const isSvg = typeof src === "string" && src.toLowerCase().endsWith(".svg");
          const visible = idx === (banners.length ? active : 0);
          return (
            <div
              key={b?.id || idx}
              className={`hero-slide ${visible ? "is-active" : ""}`}
              aria-hidden={!visible}
            >
              <Image
                src={src}
                alt="Rivaan Garments hero banner"
                fill
                priority={idx === 0}
                sizes="(max-width: 800px) 100vw, 60vw"
                unoptimized={isSvg}
              />
            </div>
          );
        })}
      </div>
      <div className="hero-dots" aria-label="Hero banners">
        {(banners.length ? banners : [fallback]).map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`hero-dot ${idx === active ? "is-active" : ""}`}
            aria-label={`Show banner ${idx + 1}`}
            onClick={() => setActive(idx)}
          />
        ))}
      </div>
    </section>
  );
}
