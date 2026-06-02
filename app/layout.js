import "./globals.css";
import FirebaseAnalytics from "@/components/FirebaseAnalytics/FirebaseAnalytics";
import AuthGate from "@/components/AuthGate/AuthGate";

export const metadata = {
  title: "Rivaan Garments | Premium Fashion",
  description: "Luxury fashion e-commerce experience for Rivaan Garments."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://storage.googleapis.com" />
        <link rel="preconnect" href="https://rivaangarments-7f8ea.firebasestorage.app" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        <link rel="dns-prefetch" href="https://rivaangarments-7f8ea.firebasestorage.app" />
      </head>
      <body>
        <AuthGate>{children}</AuthGate>
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
