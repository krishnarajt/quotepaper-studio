// Pixabay — cleanest license of the photo sources (Pixabay License, no
// attribution required). Default tier caps at largeImageURL (1280px);
// fullHDURL/imageURL require approved "full API access", so we prefer the
// widest field available. Requires PIXABAY_API_KEY.

import { fetchJson } from "@/lib/http";
import type { ImageResult, ImageSearchOpts, ImageSource } from "@/lib/types";

type ApiHit = {
  id: number;
  pageURL: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  fullHDURL?: string;
  imageURL?: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
};

function normalize(h: ApiHit): ImageResult {
  return {
    id: `pixabay:${h.id}`,
    url: h.fullHDURL ?? h.imageURL ?? h.largeImageURL,
    thumbUrl: h.webformatURL,
    width: h.imageWidth,
    height: h.imageHeight,
    source: "pixabay",
    photographer: h.user,
    sourceUrl: h.pageURL,
    license: "Pixabay License",
    attributionRequired: false,
  };
}

export const pixabay: ImageSource = {
  key: "pixabay",
  label: "Pixabay",
  enabled: () => Boolean(process.env.PIXABAY_API_KEY),

  async search({ query, page = 1, perPage = 40, orientation }: ImageSearchOpts) {
    const url = new URL("https://pixabay.com/api/");
    url.searchParams.set("key", process.env.PIXABAY_API_KEY ?? "");
    url.searchParams.set("q", query);
    url.searchParams.set("image_type", "photo");
    url.searchParams.set("safesearch", "true");
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    if (orientation && orientation !== "square")
      url.searchParams.set("orientation", orientation === "portrait" ? "vertical" : "horizontal");
    const data = await fetchJson<{ hits: ApiHit[] }>(url.toString());
    return (data.hits ?? []).map(normalize);
  },
};
