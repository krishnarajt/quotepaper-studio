import type { Metadata } from "next";
import "./globals.css";
import { inter, allFontClassNames } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Quotepaper Studio",
  description:
    "Make beautiful wallpapers from inspiring quotes — themed backgrounds from many free sources, live text styling, and one-click export.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      {/* allFontClassNames forces every quote face to load so the canvas can use them */}
      <body className={`${allFontClassNames} flex min-h-full flex-col bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
