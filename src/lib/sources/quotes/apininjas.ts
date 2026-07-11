// API Ninjas quotes — has category tags, but the key must stay secret, so this
// adapter only ever runs server-side (inside the /api/quotes route). Disabled
// automatically when API_NINJAS_KEY is not set.

import { fetchJson } from "@/lib/http";
import type { QuoteResult, QuoteSearchOpts, QuoteSource } from "@/lib/types";

const BASE = "https://api.api-ninjas.com/v1/quotes";

type ApiQuote = { quote: string; author: string; category?: string };

let counter = 0;
function normalize(q: ApiQuote): QuoteResult {
  return {
    id: `apininjas:${counter++}`,
    content: q.quote,
    author: q.author,
    tags: q.category ? [titleCase(q.category)] : [],
    source: "apininjas",
  };
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function headers(): Record<string, string> {
  return { "X-Api-Key": process.env.API_NINJAS_KEY ?? "" };
}

export const apininjas: QuoteSource = {
  key: "apininjas",
  label: "API Ninjas",
  enabled: () => Boolean(process.env.API_NINJAS_KEY),

  async random({ tag } = {}) {
    const url = new URL(BASE);
    if (tag) url.searchParams.set("category", tag.toLowerCase());
    const data = await fetchJson<ApiQuote[]>(url.toString(), {
      headers: headers(),
    });
    return data[0] ? normalize(data[0]) : null;
  },

  async search({ tag }: QuoteSearchOpts) {
    const url = new URL(BASE);
    if (tag) url.searchParams.set("category", tag.toLowerCase());
    const data = await fetchJson<ApiQuote[]>(url.toString(), {
      headers: headers(),
    });
    return data.map(normalize);
  },
};
