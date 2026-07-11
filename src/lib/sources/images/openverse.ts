// Openverse — huge Creative Commons catalog, no key needed. We restrict to
// cc0/pdm so exported wallpapers carry no attribution obligation and
// derivatives are unambiguously allowed. Resolution varies, so we filter out
// small images and let the chain fall through if nothing usable comes back.

import { fetchJson } from "@/lib/http";
import type { ImageResult, ImageSearchOpts, ImageSource } from "@/lib/types";

const MIN_WIDTH = 1280;

type ApiImage = {
  id: string;
  title?: string;
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  creator?: string;
  creator_url?: string;
  foreign_landing_url?: string;
  license: string;
  license_version?: string;
};

// The provider-hosted `url` can taint a canvas; the app draws every image
// through /api/img-proxy, so we keep the original URL here and proxy at render.
function normalize(img: ApiImage): ImageResult {
  return {
    id: `openverse:${img.id}`,
    url: img.url,
    thumbUrl: img.thumbnail ?? img.url,
    width: img.width ?? 0,
    height: img.height ?? 0,
    source: "openverse",
    photographer: img.creator,
    photographerUrl: img.creator_url,
    sourceUrl: img.foreign_landing_url,
    license: `${img.license.toUpperCase()} ${img.license_version ?? ""}`.trim(),
    attributionRequired: false, // cc0/pdm only
  };
}

export const openverse: ImageSource = {
  key: "openverse",
  label: "Openverse",
  enabled: () => true,

  async search({ query, page = 1, perPage = 40 }: ImageSearchOpts) {
    const url = new URL("https://api.openverse.org/v1/images/");
    url.searchParams.set("q", query);
    url.searchParams.set("license", "cc0,pdm");
    url.searchParams.set("page_size", String(perPage));
    url.searchParams.set("page", String(page));
    const headers: Record<string, string> = {};
    if (process.env.OPENVERSE_TOKEN)
      headers.Authorization = `Bearer ${process.env.OPENVERSE_TOKEN}`;
    const data = await fetchJson<{ results: ApiImage[] }>(url.toString(), {
      headers,
    });
    return (data.results ?? [])
      .filter((r) => !r.width || r.width >= MIN_WIDTH)
      .map(normalize);
  },
};
