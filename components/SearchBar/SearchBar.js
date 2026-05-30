"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ compact = false }) {
  const [query, setQuery] = useState("");

  return (
    <form className={`search-bar ${compact ? "search-compact" : ""}`} action="/search">
      <Search size={18} />
      <input
        type="search"
        name="q"
        placeholder="Search premium garments"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}
