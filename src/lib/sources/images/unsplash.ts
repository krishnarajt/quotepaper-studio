// Unsplash — large, high-quality catalog. Their guidelines require the key to
// stay secret and forbid pure "wallpaper apps", so this adapter runs ONLY
// server-side (behind /api/images) and we carry the required attribution +
// download-trigger metadata through to the UI. Disabled without a key.

import { fetchJson } from "@/lib/http";
import type { ImageResult, ImageSearchOpts, ImageSource } from "@/lib/types";

type ApiPhoto = {
  id: string;
  width: number;
  height: number;
  color?: string;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
};

function normalize(p: ApiPhoto): ImageResult {
  const utm = "?utm_source=quotepaper_studio&utm_medium=referral";
  return {
    id: `unsplash:${p.id}`,
    url: p.urls.full,
    thumbUrl: p.urls.small,
    width: p.width,
    height: p.height,
    color: p.color,
    source: "unsplash",
    photographer: p.user.name,
    photographerUrl: `${p.user.links.html}${utm}`,
    sourceUrl: `${p.links.html}${utm}`,
    license: "Unsplash License",
    attributionRequired: true,
    attributionText: `Photo by ${p.user.name} on Unsplash`,
    downloadLocation: p.links.download_location,
  };
}

export const unsplash: ImageSource = {
  key: "unsplash",
  label: "Unsplash",
  enabled: () => Boolean(process.env.UNSPLASH_ACCESS_KEY),

  async search({ query, page = 1, perPage = 30, orientation }: ImageSearchOpts) {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    if (orientation) url.searchParams.set("orientation", orientation);
    const data = await fetchJson<{ results: ApiPhoto[] }>(url.toString(), {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });
    return (data.results ?? []).map(normalize);
  },
};
