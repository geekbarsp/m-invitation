import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";
import "./wedding-details.css";

const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const script = Great_Vibes({ variable: "--font-script", subsets: ["latin"], weight: "400" });
const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "Mayumi Vergara & Mardy Morales — November 15, 2026",
  description: "Join Mayumi Vergara and Mardy Morales for their garden wedding at Abby's Event Center in Zaragoza, Nueva Ecija.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Mayumi Vergara & Mardy Morales",
    description: "November 15, 2026 · Zaragoza, Nueva Ecija",
    images: [{ url: "/og-mayumi-mardy.png", width: 1732, height: 907, alt: "Mayumi Vergara and Mardy Morales wedding invitation" }],
  },
  twitter: { card: "summary_large_image", title: "Mayumi Vergara & Mardy Morales", description: "November 15, 2026 · Zaragoza, Nueva Ecija", images: ["/og-mayumi-mardy.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${script.variable} ${sans.variable}`}><body>{children}</body></html>;
}
