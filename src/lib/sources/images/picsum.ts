// Lorem Picsum — the guaranteed "never blank" fallback. It has no keyword
// search, so we derive deterministic seeds from the query: the same keyword
// always yields the same set of backgrounds (stable, if not semantically
// related). Always enabled, always returns results.

import type { ImageResult, ImageSearchOpts, ImageSource } from "@/lib/types";

function seedFrom(query: string, i: number): string {
  let h = 0;
  const s = `${query}-${i}`;
  for (let c = 0; c < s.length; c++) h = (h * 31 + s.charCodeAt(c)) | 0;
  return `qp${Math.abs(h)}`;
}

export const picsum: ImageSource = {
  key: "picsum",
  label: "Lorem Picsum",
  enabled: () => true,

  async search({ query, perPage = 12 }: ImageSearchOpts) {
    const results: ImageResult[] = [];
    for (let i = 0; i < perPage; i++) {
      const seed = seedFrom(query || "quote", i);
      results.push({
        id: `picsum:${seed}`,
        url: `https://picsum.photos/seed/${seed}/1920/1080`,
        thumbUrl: `https://picsum.photos/seed/${seed}/400/225`,
        width: 1920,
        height: 1080,
        source: "picsum",
        sourceUrl: "https://picsum.photos",
        license: "Lorem Picsum",
        attributionRequired: false,
      });
    }
    return results;
  },
};
