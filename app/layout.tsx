import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "Mayumi Vergera & Mardy Morales — December 18, 2026",
  description: "Join Mayumi Vergera and Mardy Morales for their wedding at The Glass Garden in Manila.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Mayumi Vergera & Mardy Morales",
    description: "December 18, 2026 · Manila",
    images: [{ url: "/og-mayumi-mardy.png", width: 1732, height: 907, alt: "Mayumi Vergera and Mardy Morales wedding invitation" }],
  },
  twitter: { card: "summary_large_image", title: "Mayumi Vergera & Mardy Morales", description: "December 18, 2026 · Manila", images: ["/og-mayumi-mardy.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${sans.variable}`}><body>{children}</body></html>;
}
