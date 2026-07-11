// Client-side helpers for talking to our own API routes, plus the proxy-URL
// builder that every image must go through before being drawn to canvas.

import type { ImageResult, QuoteResult } from "@/lib/types";

export function proxied(url: string): string {
  return `/api/img-proxy?url=${encodeURIComponent(url)}`;
}

export async function fetchRandomQuote(tag?: string): Promise<QuoteResult> {
  const url = new URL("/api/quotes", location.origin);
  if (tag) url.searchParams.set("tag", tag);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("quote fetch failed");
  const data = await res.json();
  return data.quote as QuoteResult;
}

export async function searchQuotes(opts: {
  query?: string;
  tag?: string;
  author?: string;
  limit?: number;
}): Promise<QuoteResult[]> {
  const url = new URL("/api/quotes", location.origin);
  url.searchParams.set("mode", "search");
  if (opts.query) url.searchParams.set("query", opts.query);
  if (opts.tag) url.searchParams.set("tag", opts.tag);
  if (opts.author) url.searchParams.set("author", opts.author);
  if (opts.limit) url.searchParams.set("limit", String(opts.limit));
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()).quotes ?? [];
}

export async function fetchTags(): Promise<{ name: string; count: number }[]> {
  const res = await fetch("/api/quotes?mode=tags");
  if (!res.ok) return [];
  return (await res.json()).tags ?? [];
}

// Cache of image-search results (just metadata/URLs, so memory is tiny). Avoids
// re-hitting /api/images for repeated keywords or when toggling aspect ratios
// back and forth. Bounded LRU; failures are not cached so retries can succeed.
const SEARCH_CACHE_LIMIT = 24;
const searchCache = new Map<string, { images: ImageResult[]; from: string }>();

export async function searchImages(
  query: string,
  orientation: "landscape" | "portrait" | "square" = "landscape",
  perPage = 40,
): Promise<{ images: ImageResult[]; from: string }> {
  const q = (query || "nature").toLowerCase();
  const key = `${q}|${orientation}|${perPage}`;

  const hit = searchCache.get(key);
  if (hit) {
    searchCache.delete(key);
    searchCache.set(key, hit);
    return hit;
  }

  const url = new URL("/api/images", location.origin);
  url.searchParams.set("query", query || "nature");
  url.searchParams.set("orientation", orientation);
  url.searchParams.set("perPage", String(perPage));
  const res = await fetch(url);
  if (!res.ok) return { images: [], from: "none" };
  const result = (await res.json()) as { images: ImageResult[]; from: string };

  if (result.images.length > 0) {
    searchCache.set(key, result);
    if (searchCache.size > SEARCH_CACHE_LIMIT) {
      const oldest = searchCache.keys().next().value;
      if (oldest) searchCache.delete(oldest);
    }
  }
  return result;
}
