/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // We use a local SVG fallback for the hero banner (and may store SVGs in Firebase).
    // Next/Image blocks SVG optimization by default; allow it explicitly.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "rivaangarments-7f8ea.firebasestorage.app"
      }
    ]
  }
};

export default nextConfig;
