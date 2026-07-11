// Quotable mirror (api.quotable.kurokeita.dev) — a maintained, CORS-open,
// no-key reimplementation of the defunct api.quotable.io. Richest metadata of
// any live quote API (named tags + author), so it's our primary source.

import { fetchJson } from "@/lib/http";
import type { QuoteResult, QuoteSearchOpts, QuoteSource } from "@/lib/types";

const BASE = "https://api.quotable.kurokeita.dev/api";

type ApiQuote = {
  id: string;
  content: string;
  tags?: { id: string; name: string }[];
  author?: { name?: string };
};

function normalize(q: ApiQuote): QuoteResult {
  return {
    id: `quotable:${q.id}`,
    content: q.content,
    author: q.author?.name ?? "Unknown",
    tags: (q.tags ?? []).map((t) => t.name),
    source: "quotable",
  };
}

// The list endpoint only accepts these limit values; anything else 400s.
function clampLimit(n?: number): number {
  const allowed = [10, 25, 50, 100];
  if (!n) return 25;
  return allowed.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a));
}

export const quotable: QuoteSource = {
  key: "quotable",
  label: "Quotable",
  enabled: () => true,

  async random({ tag } = {}) {
    const url = new URL(`${BASE}/quotes/random`);
    if (tag) url.searchParams.set("tags", tag);
    const data = await fetchJson<{ quote: ApiQuote }>(url.toString());
    return data.quote ? normalize(data.quote) : null;
  },

  async search({ query, tag, author, limit }: QuoteSearchOpts) {
    const url = new URL(`${BASE}/quotes`);
    url.searchParams.set("limit", String(clampLimit(limit)));
    url.searchParams.set("page", "0");
    if (query) url.searchParams.set("query", query);
    if (tag) url.searchParams.set("tags", tag);
    if (author) url.searchParams.set("author", author);
    const data = await fetchJson<{ data: ApiQuote[] }>(url.toString());
    return (data.data ?? []).map(normalize);
  },
};

export async function quotableTags(): Promise<
  { name: string; count: number }[]
> {
  const data = await fetchJson<
    { name: string; quotesCount: number }[]
  >(`${BASE}/tags`);
  return data
    .map((t) => ({ name: t.name, count: t.quotesCount }))
    .sort((a, b) => b.count - a.count);
}
