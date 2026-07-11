// Pexels — good quality, wallpaper-grade sizes. Requires the "Photos provided
// by Pexels" credit + photographer name, which we carry through as
// attribution metadata. Server-side only (key in header). Disabled without key.

import { fetchJson } from "@/lib/http";
import type { ImageResult, ImageSearchOpts, ImageSource } from "@/lib/types";

type ApiPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  avg_color?: string;
  photographer: string;
  photographer_url: string;
  src: { original: string; large2x: string; large: string; medium: string };
};

function normalize(p: ApiPhoto): ImageResult {
  return {
    id: `pexels:${p.id}`,
    url: p.src.large2x,
    thumbUrl: p.src.medium,
    width: p.width,
    height: p.height,
    color: p.avg_color,
    source: "pexels",
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    sourceUrl: p.url,
    license: "Pexels License",
    attributionRequired: true,
    attributionText: `Photo by ${p.photographer} on Pexels`,
  };
}

export const pexels: ImageSource = {
  key: "pexels",
  label: "Pexels",
  enabled: () => Boolean(process.env.PEXELS_API_KEY),

  async search({ query, page = 1, perPage = 30, orientation }: ImageSearchOpts) {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    if (orientation) url.searchParams.set("orientation", orientation);
    const data = await fetchJson<{ photos: ApiPhoto[] }>(url.toString(), {
      headers: { Authorization: process.env.PEXELS_API_KEY ?? "" },
    });
    return (data.photos ?? []).map(normalize);
  },
};
