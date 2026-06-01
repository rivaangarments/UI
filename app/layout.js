import "./globals.css";
import FirebaseAnalytics from "@/components/FirebaseAnalytics/FirebaseAnalytics";
import AuthGate from "@/components/AuthGate/AuthGate";

export const metadata = {
  title: "Rivaan Garments | Premium Fashion",
  description: "Luxury fashion e-commerce experience for Rivaan Garments."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthGate>{children}</AuthGate>
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
