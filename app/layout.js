import "./globals.css";
import FirebaseAnalytics from "@/components/FirebaseAnalytics/FirebaseAnalytics";

export const metadata = {
  title: "Rivaan Garments | Premium Fashion",
  description: "Luxury fashion e-commerce experience for Rivaan Garments."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
