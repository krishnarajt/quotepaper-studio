// DummyJSON quotes — no key, CORS-open, hosted on a different CDN than the
// mirror, so it's a good independent fallback. Downside: no tags, so quotes
// from here can't drive theme-matching (we fall back to a neutral wallpaper).

import { fetchJson } from "@/lib/http";
import type { QuoteResult, QuoteSearchOpts, QuoteSource } from "@/lib/types";

const BASE = "https://dummyjson.com/quotes";

type ApiQuote = { id: number; quote: string; author: string };

function normalize(q: ApiQuote): QuoteResult {
  return {
    id: `dummyjson:${q.id}`,
    content: q.quote,
    author: q.author,
    tags: [],
    source: "dummyjson",
  };
}

export const dummyjson: QuoteSource = {
  key: "dummyjson",
  label: "DummyJSON",
  enabled: () => true,

  async random() {
    const q = await fetchJson<ApiQuote>(`${BASE}/random`);
    return normalize(q);
  },

  // DummyJSON has no server-side search; we page a chunk and filter client-side.
  async search({ query, limit }: QuoteSearchOpts) {
    const data = await fetchJson<{ quotes: ApiQuote[] }>(
      `${BASE}?limit=${Math.min(limit ?? 30, 100)}`,
    );
    let quotes = data.quotes ?? [];
    if (query) {
      const q = query.toLowerCase();
      quotes = quotes.filter(
        (x) =>
          x.quote.toLowerCase().includes(q) ||
          x.author.toLowerCase().includes(q),
      );
    }
    return quotes.map(normalize);
  },
};
