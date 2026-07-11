// Fonts for the composed wallpaper. next/font self-hosts these; we expose each
// resolved family string so the canvas renderer can use it in ctx.font, and a
// combined className to drop on <body> so the browser actually fetches them.

import {
  Playfair_Display,
  Cormorant_Garamond,
  Lora,
  Montserrat,
  Bebas_Neue,
  Poppins,
  Inter,
} from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700", "900"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600"] });
const lora = Lora({ subsets: ["latin"], weight: ["400", "600"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "600", "800"] });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });

// UI font (also used for controls).
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export type FontDef = {
  key: string;
  label: string;
  family: string;
  weight: number;
  category: "serif" | "sans" | "display" | "handwriting";
};

export const FONTS: FontDef[] = [
  { key: "playfair", label: "Playfair", family: playfair.style.fontFamily, weight: 700, category: "serif" },
  { key: "cormorant", label: "Cormorant", family: cormorant.style.fontFamily, weight: 600, category: "serif" },
  { key: "lora", label: "Lora", family: lora.style.fontFamily, weight: 600, category: "serif" },
  { key: "montserrat", label: "Montserrat", family: montserrat.style.fontFamily, weight: 800, category: "sans" },
  { key: "bebas", label: "Bebas Neue", family: bebas.style.fontFamily, weight: 400, category: "display" },
  { key: "poppins", label: "Poppins", family: poppins.style.fontFamily, weight: 600, category: "sans" },
];

export function fontByKey(key: string): FontDef {
  return FONTS.find((f) => f.key === key) ?? FONTS[0];
}

// All font classNames combined — applied to <body> so every face is loaded and
// available to document.fonts before the canvas draws.
export const allFontClassNames = [
  playfair.className,
  cormorant.className,
  lora.className,
  montserrat.className,
  bebas.className,
  poppins.className,
].join(" ");
