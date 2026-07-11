// Export resolutions per aspect ratio, and one-click style presets.

export type AspectKey = "16:9" | "9:16" | "1:1" | "4:5" | "3:2";

export const ASPECTS: Record<AspectKey, { w: number; h: number; label: string }> = {
  "16:9": { w: 1920, h: 1080, label: "Desktop 16:9" },
  "9:16": { w: 1080, h: 1920, label: "Phone 9:16" },
  "1:1": { w: 1080, h: 1080, label: "Square 1:1" },
  "4:5": { w: 1080, h: 1350, label: "Portrait 4:5" },
  "3:2": { w: 1620, h: 1080, label: "Classic 3:2" },
};

export const ASPECT_ORDER: AspectKey[] = ["16:9", "9:16", "1:1", "4:5", "3:2"];

export type TextAlign = "left" | "center" | "right";
export type VerticalPos = "top" | "center" | "bottom";

export type StyleState = {
  fontKey: string;
  fontScale: number; // multiplier on the auto-fit base size
  textColor: string;
  align: TextAlign;
  vertical: VerticalPos;
  uppercase: boolean;
  showAuthor: boolean;
  showQuoteMarks: boolean;
  scrim: number; // 0..1 darkening for legibility
  blur: number; // px of background blur
  vignette: boolean;
  lineHeight: number;
};

export type Preset = { key: string; label: string; style: Partial<StyleState> };

export const PRESETS: Preset[] = [
  {
    key: "minimal",
    label: "Minimal",
    style: { fontKey: "playfair", textColor: "#ffffff", align: "center", vertical: "center", uppercase: false, scrim: 0.35, blur: 0, vignette: false, showQuoteMarks: false },
  },
  {
    key: "cinematic",
    label: "Cinematic",
    style: { fontKey: "montserrat", textColor: "#ffffff", align: "left", vertical: "bottom", uppercase: false, scrim: 0.55, blur: 0, vignette: true, showQuoteMarks: false },
  },
  {
    key: "serene",
    label: "Serene",
    style: { fontKey: "cormorant", textColor: "#fdfdfd", align: "center", vertical: "center", uppercase: false, scrim: 0.3, blur: 3, vignette: false, showQuoteMarks: true },
  },
  {
    key: "bold",
    label: "Bold",
    style: { fontKey: "bebas", textColor: "#ffffff", align: "center", vertical: "center", uppercase: true, scrim: 0.5, blur: 0, vignette: true, showQuoteMarks: false },
  },
  {
    key: "modern",
    label: "Modern",
    style: { fontKey: "poppins", textColor: "#ffffff", align: "center", vertical: "center", uppercase: false, scrim: 0.42, blur: 0, vignette: false, showQuoteMarks: false },
  },
];

export const DEFAULT_STYLE: StyleState = {
  fontKey: "playfair",
  fontScale: 1,
  textColor: "#ffffff",
  align: "center",
  vertical: "center",
  uppercase: false,
  showAuthor: true,
  showQuoteMarks: true,
  scrim: 0.4,
  blur: 0,
  vignette: false,
  lineHeight: 1.28,
};
