import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({ category }) {
  const categoryName = category.name || category.title || "Category";
  const categorySlug = category.slug || category.id;
  const categoryImage = category.image || category.imageUrl || "/images/categories/tshirts.svg";

  return (
    <Link className="category-card fade-in" href={`/product?category=${categorySlug}`}>
      <span className="category-image">
        <Image src={categoryImage} alt={categoryName} width={124} height={124} />
      </span>
      <span>{categoryName}</span>
    </Link>
  );
}
