// Quote redundancy chain. Order: Quotable mirror -> DummyJSON -> API Ninjas
// (only if keyed) -> bundled offline corpus. The offline source can never fail,
// so getRandomQuote always resolves to a quote.

import { firstOk } from "@/lib/http";
import type { QuoteResult, QuoteSearchOpts, QuoteSource } from "@/lib/types";
import { quotable, quotableTags } from "./quotable";
import { dummyjson } from "./dummyjson";
import { apininjas } from "./apininjas";
import { local, localTags } from "./local";

const CHAIN: QuoteSource[] = [quotable, dummyjson, apininjas, local];

function active(): QuoteSource[] {
  return CHAIN.filter((s) => s.enabled());
}

export async function getRandomQuote(opts: { tag?: string } = {}): Promise<{
  quote: QuoteResult;
  from: string;
}> {
  const result = await firstOk(
    active().map((s) => ({ key: s.key, run: () => s.random(opts) })),
  );
  // `local` never fails, so this is defensive only.
  if (!result) return { quote: await forceLocal(opts), from: "local" };
  return { quote: result.value, from: result.from };
}

async function forceLocal(opts: { tag?: string }): Promise<QuoteResult> {
  return (await local.random(opts))!;
}

export async function searchQuotes(opts: QuoteSearchOpts): Promise<QuoteResult[]> {
  const result = await firstOk(
    active()
      .filter((s) => s.search)
      .map((s) => ({ key: s.key, run: () => s.search!(opts) })),
  );
  return result?.value ?? [];
}

// Tag vocabulary for the library filter: live tags if the mirror is up, else
// the offline vocabulary. Both share the same names.
export async function getQuoteTags(): Promise<{ name: string; count: number }[]> {
  try {
    const tags = await quotableTags();
    if (tags.length) return tags;
  } catch {
    /* fall through to offline */
  }
  return localTags();
}
