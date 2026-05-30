"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { categories as fallbackCategories } from "@/data/categories";
import { fetchProductsCached } from "@/lib/firestore/products";
import { categoriesFromProducts } from "@/lib/products/categoriesFromProducts";

const sizes = ["XS", "S", "M", "L", "XL", "32", "34"];
const colors = ["Black", "Ivory", "Gold", "Blue", "Cream"];

function FilterContent({ categoryItems }) {
  return (
    <>
      <div className="filter-group">
        <h3>Category</h3>
        {categoryItems.map((item) => (
          <label key={item.id || item.slug || item.name}>
            <input type="checkbox" /> {item.name}
          </label>
        ))}
      </div>
      <div className="filter-group">
        <h3>Price Range</h3>
        <input type="range" min="500" max="5000" defaultValue="2400" />
        <div className="range-row"><span>₹500</span><span>₹5,000</span></div>
      </div>
      <div className="filter-group">
        <h3>Size</h3>
        <div className="chip-row">
          {sizes.map((size) => <button key={size}>{size}</button>)}
        </div>
      </div>
      <div className="filter-group">
        <h3>Color</h3>
        <div className="swatch-row">
          {colors.map((color) => <button key={color} style={{ "--swatch": color.toLowerCase() }}>{color}</button>)}
        </div>
      </div>
    </>
  );
}

export default function FilterSidebar() {
  const [open, setOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState(fallbackCategories);

  useEffect(() => {
    let mounted = true;
    fetchProductsCached()
      .then((products) => {
        if (!mounted) return;
        const derived = categoriesFromProducts(products);
        if (derived.length) setCategoryItems(derived);
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <button className="filter-trigger" onClick={() => setOpen(true)}>
        <SlidersHorizontal size={18} /> Filters
      </button>
      <aside className="filter-sidebar luxury-panel">
        <FilterContent categoryItems={categoryItems} />
      </aside>
      <div className={`filter-drawer ${open ? "is-open" : ""}`}>
        <button className="filter-scrim" onClick={() => setOpen(false)} aria-label="Close filters" />
        <div className="filter-drawer-panel">
          <div className="drawer-head">
            <b>Filters</b>
            <button onClick={() => setOpen(false)} aria-label="Close filters"><X size={20} /></button>
          </div>
          <FilterContent categoryItems={categoryItems} />
        </div>
      </div>
    </>
  );
}
