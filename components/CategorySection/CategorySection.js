"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import CategoryCard from "@/components/CategoryCard/CategoryCard";
import { categories as fallbackCategories } from "@/data/categories";
import { fetchProductsCached } from "@/lib/firestore/products";
import { categoriesFromProducts } from "@/lib/products/categoriesFromProducts";

export default function CategorySection() {
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    let mounted = true;

    fetchProductsCached()
      .then((products) => {
        if (!mounted) return;
        const derived = categoriesFromProducts(products);
        if (derived.length) setCategories(derived);
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <h2>Shop by Category</h2>
          <a className="view-link" href="/product">View All <ArrowRight size={16} /></a>
        </div>
        <div className="category-row">
          {categories.map((category) => <CategoryCard category={category} key={category.id} />)}
        </div>
      </div>
    </section>
  );
}
