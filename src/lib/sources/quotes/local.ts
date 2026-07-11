// Bundled offline corpus (2,127 tagged quotes from the Quotable dataset). This
// is the last-resort fallback: it needs no network, so the studio keeps
// producing themed quotes even if every live API is down.

import type { QuoteResult, QuoteSearchOpts, QuoteSource } from "@/lib/types";
import raw from "@/data/quotes.json";

type LocalQuote = {
  _id: string;
  content: string;
  author: string;
  tags: string[];
};

const QUOTES = raw as LocalQuote[];

function normalize(q: LocalQuote): QuoteResult {
  return {
    id: `local:${q._id}`,
    content: q.content,
    author: q.author,
    tags: q.tags ?? [],
    source: "local",
  };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const local: QuoteSource = {
  key: "local",
  label: "Offline",
  enabled: () => true,

  async random({ tag } = {}) {
    const pool = tag
      ? QUOTES.filter((q) => q.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()))
      : QUOTES;
    return normalize(pick(pool.length ? pool : QUOTES));
  },

  async search({ query, tag, author, limit }: QuoteSearchOpts) {
    const q = query?.toLowerCase();
    const results = QUOTES.filter((item) => {
      if (tag && !item.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()))
        return false;
      if (author && !item.author.toLowerCase().includes(author.toLowerCase()))
        return false;
      if (q && !item.content.toLowerCase().includes(q) && !item.author.toLowerCase().includes(q))
        return false;
      return true;
    });
    return results.slice(0, limit ?? 50).map(normalize);
  },
};

// The full local tag vocabulary, used to seed the library's tag filter offline.
export function localTags(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const q of QUOTES)
    for (const t of q.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
