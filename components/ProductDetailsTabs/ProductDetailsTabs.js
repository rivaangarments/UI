"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Ruler, Shirt, Star } from "lucide-react";

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`tab-btn ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function ProductDetailsTabs({ product }) {
  const [tab, setTab] = useState("description");

  const content = useMemo(() => {
    switch (tab) {
      case "details":
        return (
          <div className="tab-body-grid">
            <ul className="detail-bullets">
              <li><b>Material:</b> Premium blend</li>
              <li><b>Care:</b> Gentle machine wash</li>
              <li><b>Occasion:</b> Festive, casual, work</li>
              <li><b>Country of Origin:</b> India</li>
            </ul>
            <div className="detail-perks">
              <div><BadgeCheck size={18} /><span><b>Premium Quality</b><small>Best quality fabric</small></span></div>
              <div><Shirt size={18} /><span><b>Perfect Fit</b><small>Tailored for comfort</small></span></div>
              <div><Star size={18} /><span><b>Trending Style</b><small>Stay fashionable</small></span></div>
              <div><Ruler size={18} /><span><b>Easy Care</b><small>Machine washable</small></span></div>
            </div>
          </div>
        );
      case "fit":
        return (
          <div className="tab-body-grid">
            <ul className="detail-bullets">
              <li><b>Fit:</b> Regular</li>
              <li><b>Length:</b> Standard</li>
              <li><b>Model:</b> 5'10&quot; wearing size M</li>
              <li><b>Tip:</b> Size up for a relaxed look</li>
            </ul>
            <div className="size-hint">
              <b>Size Guide</b>
              <p>Choose your usual size for a classic fit. For a roomier silhouette, select one size up.</p>
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="tab-body-grid">
            <div className="reviews-summary">
              <b>{Number(product.rating || 4.6).toFixed(1)}</b>
              <span>Average Rating</span>
              <small>{Number(product.reviews || 0)} Reviews</small>
            </div>
            <ul className="detail-bullets">
              <li><b>Most liked:</b> Fit, fabric quality, stitching</li>
              <li><b>Note:</b> Reviews are coming soon (frontend-only demo).</li>
            </ul>
          </div>
        );
      case "description":
      default:
        return (
          <div className="tab-body-grid">
            <ul className="detail-bullets">
              <li>{product.description}</li>
              <li>Crafted for polished everyday wear with premium finishing.</li>
              <li>Designed to pair effortlessly with festive and minimal styling.</li>
            </ul>
            <div className="detail-perks">
              <div><BadgeCheck size={18} /><span><b>Quality Checked</b><small>Refined finishing</small></span></div>
              <div><Shirt size={18} /><span><b>Comfort Fit</b><small>Breathable feel</small></span></div>
              <div><Ruler size={18} /><span><b>True-to-Size</b><small>Easy sizing</small></span></div>
              <div><Star size={18} /><span><b>Customer Favorite</b><small>Highly rated</small></span></div>
            </div>
          </div>
        );
    }
  }, [tab, product]);

  return (
    <section className="detail-tabs luxury-panel">
      <div className="tab-bar">
        <TabButton active={tab === "description"} onClick={() => setTab("description")}>Description</TabButton>
        <TabButton active={tab === "details"} onClick={() => setTab("details")}>Product Details</TabButton>
        <TabButton active={tab === "fit"} onClick={() => setTab("fit")}>Size &amp; Fit</TabButton>
        <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")}>Reviews</TabButton>
      </div>
      <div className="tab-body">{content}</div>
    </section>
  );
}

