"use client";

// Central studio state: the current quote + background, the style/aspect being
// edited, cached image search results and tag vocabulary, and saved favorites
// (persisted to localStorage). Selecting a new quote auto-loads a themed
// background based on the quote's tags.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_STYLE,
  PRESETS,
  type AspectKey,
  type StyleState,
} from "@/lib/constants";
import {
  fetchRandomQuote,
  fetchTags,
  searchImages,
  searchQuotes,
} from "@/lib/api";
import type { ImageResult, QuoteResult } from "@/lib/types";

export type Favorite = {
  id: string;
  quote: QuoteResult;
  background: ImageResult;
  style: StyleState;
  aspect: AspectKey;
  thumb: string;
  createdAt: number;
};

function keywordFromQuote(q: QuoteResult): string {
  const tag = q.tags.find((t) => t.toLowerCase() !== "famous quotes");
  return (tag ?? q.tags[0] ?? "nature").toLowerCase();
}

function pick<T>(arr: T[]): T | null {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

type StudioState = {
  quote: QuoteResult | null;
  quoteSource: string;
  background: ImageResult | null;
  images: ImageResult[];
  imageQuery: string;
  imageFrom: string;
  tags: { name: string; count: number }[];
  style: StyleState;
  aspect: AspectKey;
  loadingQuote: boolean;
  loadingImages: boolean;
  favorites: Favorite[];

  newQuote: (tag?: string) => Promise<void>;
  setQuote: (q: QuoteResult, autoBackground?: boolean) => Promise<void>;
  loadImagesFor: (query: string) => Promise<void>;
  setBackground: (img: ImageResult) => void;
  shuffleBackground: () => void;
  setStyle: (patch: Partial<StyleState>) => void;
  applyPreset: (key: string) => void;
  resetStyle: () => void;
  setAspect: (a: AspectKey) => void;
  loadTags: () => Promise<void>;
  saveFavorite: (thumb: string) => void;
  removeFavorite: (id: string) => void;
  loadFavorite: (fav: Favorite) => void;
};

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      quote: null,
      quoteSource: "",
      background: null,
      images: [],
      imageQuery: "",
      imageFrom: "",
      tags: [],
      style: DEFAULT_STYLE,
      aspect: "16:9",
      loadingQuote: false,
      loadingImages: false,
      favorites: [],

      async newQuote(tag) {
        set({ loadingQuote: true });
        try {
          const quote = await fetchRandomQuote(tag);
          set({ quote, quoteSource: quote.source });
          await get().loadImagesFor(keywordFromQuote(quote));
        } catch (e) {
          console.error(e);
        } finally {
          set({ loadingQuote: false });
        }
      },

      async setQuote(quote, autoBackground = true) {
        set({ quote, quoteSource: quote.source });
        if (autoBackground) await get().loadImagesFor(keywordFromQuote(quote));
      },

      async loadImagesFor(query) {
        set({ loadingImages: true, imageQuery: query });
        try {
          const orientation =
            get().aspect === "9:16" || get().aspect === "4:5"
              ? "portrait"
              : get().aspect === "1:1"
                ? "square"
                : "landscape";
          const { images, from } = await searchImages(query, orientation);
          set({ images, imageFrom: from });
          const current = get().background;
          // Keep the current background if the user picked one; else auto-pick.
          if (!current) set({ background: pick(images) });
        } catch (e) {
          console.error(e);
        } finally {
          set({ loadingImages: false });
        }
      },

      setBackground(img) {
        set({ background: img });
      },

      shuffleBackground() {
        const { images, background } = get();
        if (images.length < 2) return set({ background: pick(images) });
        let next = pick(images);
        while (next && background && next.id === background.id)
          next = pick(images);
        set({ background: next });
      },

      setStyle(patch) {
        set({ style: { ...get().style, ...patch } });
      },

      applyPreset(key) {
        const preset = PRESETS.find((p) => p.key === key);
        if (preset) set({ style: { ...get().style, ...preset.style } });
      },

      resetStyle() {
        set({ style: DEFAULT_STYLE });
      },

      setAspect(aspect) {
        set({ aspect });
        // Re-query with the matching orientation for better crops.
        const q = get().imageQuery;
        if (q) get().loadImagesFor(q);
      },

      async loadTags() {
        if (get().tags.length) return;
        try {
          set({ tags: await fetchTags() });
        } catch {
          /* ignore */
        }
      },

      saveFavorite(thumb) {
        const { quote, background, style, aspect, favorites } = get();
        if (!quote || !background) return;
        const fav: Favorite = {
          id: crypto.randomUUID(),
          quote,
          background,
          style,
          aspect,
          thumb,
          createdAt: Date.now(),
        };
        set({ favorites: [fav, ...favorites] });
      },

      removeFavorite(id) {
        set({ favorites: get().favorites.filter((f) => f.id !== id) });
      },

      loadFavorite(fav) {
        set({
          quote: fav.quote,
          quoteSource: fav.quote.source,
          background: fav.background,
          style: fav.style,
          aspect: fav.aspect,
          images: [fav.background, ...get().images.filter((i) => i.id !== fav.background.id)],
        });
      },
    }),
    {
      name: "quotepaper-studio",
      // Only persist user-owned data + preferences, not transient session state.
      partialize: (s) => ({
        favorites: s.favorites,
        style: s.style,
        aspect: s.aspect,
      }),
    },
  ),
);
