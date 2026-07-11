// Canvas rendering engine. Draws the background (cover-fit, optional blur),
// legibility scrim + vignette, and the auto-fitted, word-wrapped quote + author
// at the chosen alignment. Everything runs client-side. Images are loaded
// through /api/img-proxy so the canvas stays untainted and PNG export works.

import { proxied } from "@/lib/api";
import { fontByKey } from "@/lib/fonts";
import { ASPECTS, type AspectKey, type StyleState } from "@/lib/constants";
import type { QuoteResult } from "@/lib/types";

// Small LRU of decoded background images. A full-res bitmap can be tens of MB,
// so we keep the count deliberately low; re-viewing a recent background (shuffle
// back, reselect a thumbnail, open a favorite) is then instant with no refetch
// or re-decode. On a miss the img-proxy's immutable cache headers still make the
// network hit fast.
const IMG_CACHE_LIMIT = 16;
const imgCache = new Map<string, HTMLImageElement>();
const imgInflight = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(rawUrl: string): Promise<HTMLImageElement> {
  const src = proxied(rawUrl);

  const cached = imgCache.get(src);
  if (cached) {
    imgCache.delete(src); // re-insert to mark most-recently-used
    imgCache.set(src, cached);
    return Promise.resolve(cached);
  }
  const inflight = imgInflight.get(src);
  if (inflight) return inflight;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgCache.set(src, img);
      if (imgCache.size > IMG_CACHE_LIMIT) {
        const oldest = imgCache.keys().next().value; // eviction: drop LRU entry
        if (oldest) imgCache.delete(oldest);
      }
      imgInflight.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      imgInflight.delete(src);
      reject(new Error("image load failed"));
    };
    img.src = src;
  });
  imgInflight.set(src, promise);
  return promise;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth || !current) {
        current = test;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

/** Largest font size (from a target down) whose wrapped block fits the area. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  weight: number,
  target: number,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number,
): { size: number; lines: string[] } {
  for (let size = Math.floor(target); size >= 14; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    const lines = wrapText(ctx, text, maxWidth);
    const blockHeight = lines.length * size * lineHeight;
    if (blockHeight <= maxHeight) return { size, lines };
  }
  ctx.font = `${weight} 14px ${family}`;
  return { size: 14, lines: wrapText(ctx, text, maxWidth) };
}

async function ensureFonts(family: string, weight: number) {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load(`${weight} 80px ${family}`),
      document.fonts.load(`italic 400 40px ${family}`),
      document.fonts.ready,
    ]);
  } catch {
    /* fall back to whatever is available */
  }
}

export type RenderInput = {
  img: HTMLImageElement | null;
  quote: QuoteResult | null;
  style: StyleState;
  aspect: AspectKey;
};

export async function renderComposition(
  canvas: HTMLCanvasElement,
  { img, quote, style, aspect }: RenderInput,
) {
  const { w, h } = ASPECTS[aspect];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background: cover-fit (center crop). Overscan a little when blurring so the
  // blurred edges don't reveal the canvas.
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0b0f1a";
  ctx.fillRect(0, 0, w, h);
  if (img && img.width && img.height) {
    const pad = style.blur > 0 ? style.blur * 3 : 0;
    const dw = w + pad * 2;
    const dh = h + pad * 2;
    const scale = Math.max(dw / img.width, dh / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.save();
    if (style.blur > 0) ctx.filter = `blur(${style.blur}px)`;
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
    ctx.restore();
  }

  // Legibility: subtle vertical gradient + uniform scrim, optional vignette.
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(0,0,0,0.15)");
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  if (style.scrim > 0) {
    ctx.fillStyle = `rgba(0,0,0,${style.scrim})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (style.vignette) {
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  if (!quote) return;

  const font = fontByKey(style.fontKey);
  await ensureFonts(font.family, font.weight);

  const padX = w * 0.09;
  const maxWidth = w - padX * 2;
  const maxHeight = h * 0.62;
  const target = h * 0.098 * style.fontScale;
  const content = style.uppercase ? quote.content.toUpperCase() : quote.content;

  const { size, lines } = fitText(
    ctx,
    content,
    font.family,
    font.weight,
    target,
    maxWidth,
    maxHeight,
    style.lineHeight,
  );

  const authorSize = Math.max(16, size * 0.42);
  const authorGap = size * 0.6;
  const quoteBlock = lines.length * size * style.lineHeight;
  const authorBlock = style.showAuthor && quote.author ? authorGap + authorSize : 0;
  const totalHeight = quoteBlock + authorBlock;

  let top: number;
  if (style.vertical === "top") top = h * 0.12;
  else if (style.vertical === "bottom") top = h * 0.88 - totalHeight;
  else top = (h - totalHeight) / 2;

  const anchorX = style.align === "left" ? padX : style.align === "right" ? w - padX : w / 2;

  ctx.textAlign = style.align;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = style.textColor;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = size * 0.14;
  ctx.shadowOffsetY = size * 0.03;

  // Decorative opening quote mark.
  let y = top + size;
  if (style.showQuoteMarks) {
    ctx.save();
    ctx.font = `700 ${size * 1.7}px ${font.family}`;
    ctx.globalAlpha = 0.55;
    const markX = style.align === "center" ? w / 2 : anchorX;
    ctx.fillText("“", markX, top - size * 0.15);
    ctx.restore();
  }

  ctx.font = `${font.weight} ${size}px ${font.family}`;
  for (const line of lines) {
    ctx.fillText(line, anchorX, y);
    y += size * style.lineHeight;
  }

  if (style.showAuthor && quote.author) {
    ctx.shadowBlur = authorSize * 0.14;
    ctx.font = `italic 400 ${authorSize}px ${font.family}`;
    ctx.globalAlpha = 0.9;
    ctx.fillText(`— ${quote.author}`, anchorX, y + authorGap);
    ctx.globalAlpha = 1;
  }

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

export function exportBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("export failed"))),
      "image/png",
    );
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
