// Art Institute of Chicago — CC0 public-domain artworks via IIIF, arbitrary
// resolution, zero attribution. No key. Great for artistic/abstract themes;
// less so for literal photographic keywords, so it sits lower in the chain.

import { fetchJson } from "@/lib/http";
import type { ImageResult, ImageSearchOpts, ImageSource } from "@/lib/types";

type SearchResp = {
  data: { id: number; title: string; image_id: string | null }[];
  config: { iiif_url: string };
};

export const artic: ImageSource = {
  key: "artic",
  label: "Art Institute of Chicago",
  enabled: () => true,

  async search({ query, perPage = 20 }: ImageSearchOpts) {
    const url = new URL("https://api.artic.edu/api/v1/artworks/search");
    url.searchParams.set("q", query);
    url.searchParams.set("query[term][is_public_domain]", "true");
    url.searchParams.set("fields", "id,title,image_id");
    url.searchParams.set("limit", String(Math.min(perPage, 100)));
    const data = await fetchJson<SearchResp>(url.toString());
    const iiif = data.config.iiif_url;
    return (data.data ?? [])
      .filter((a) => a.image_id) // image_id can be null
      .map((a) => ({
        id: `artic:${a.id}`,
        url: `${iiif}/${a.image_id}/full/1686,/0/default.jpg`,
        thumbUrl: `${iiif}/${a.image_id}/full/400,/0/default.jpg`,
        width: 1686,
        height: 0, // unknown until drawn; canvas uses the natural dimensions
        source: "artic",
        photographer: a.title,
        sourceUrl: `https://www.artic.edu/artworks/${a.id}`,
        license: "CC0 1.0",
        attributionRequired: false,
      }));
  },
};
