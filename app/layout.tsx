import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sophia & Alexander — December 18, 2026",
  description: "Join Sophia and Alexander for their wedding at The Glass Garden in Manila.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Sophia & Alexander",
    description: "December 18, 2026 · Manila",
    images: [{ url: "/og.png", width: 1732, height: 907, alt: "Sophia and Alexander wedding invitation" }],
  },
  twitter: { card: "summary_large_image", title: "Sophia & Alexander", description: "December 18, 2026 · Manila", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${sans.variable}`}><body>{children}</body></html>;
}
