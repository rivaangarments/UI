import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const fallbackImages = {
  tshirts: "/images/categories/tshirts.svg",
  shirts: "/images/categories/shirts.svg",
  jeans: "/images/categories/jeans.svg",
  ethnic: "/images/categories/ethnic.svg",
  hoodies: "/images/categories/hoodies.svg",
  accessories: "/images/categories/accessories.svg"
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function resolveImage(data, slug) {
  if (data.image || data.imageUrl || data.photoURL || data.thumbnail) {
    return data.image || data.imageUrl || data.photoURL || data.thumbnail;
  }

  if (data.imagePath) {
    return getDownloadURL(ref(storage, data.imagePath));
  }

  return fallbackImages[slug] || "/images/categories/tshirts.svg";
}

export async function fetchCategories() {
  const snapshot = await getDocs(collection(db, "categories"));

  const categories = await Promise.all(
    snapshot.docs.map(async (document) => {
      const data = document.data();
      const name = data.name || data.title || data.label || document.id;
      const slug = data.slug || slugify(name) || document.id;

      return {
        id: document.id,
        slug,
        name,
        image: await resolveImage(data, slug),
        order: data.order ?? data.sortOrder ?? data.position ?? 999
      };
    })
  );

  return categories.sort((a, b) => Number(a.order) - Number(b.order));
}
