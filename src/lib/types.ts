// Normalized shapes every provider adapter maps into, so the rest of the app
// never has to know which source a quote or image came from.

export type QuoteResult = {
  id: string;
  content: string;
  author: string;
  tags: string[];
  source: string; // provider key, e.g. "quotable" | "dummyjson" | "local"
};

export type ImageResult = {
  id: string;
  url: string; // best full/display URL
  thumbUrl: string; // smaller URL for grids
  width: number;
  height: number;
  source: string; // provider key
  color?: string; // dominant color, when the provider gives one
  photographer?: string;
  photographerUrl?: string;
  sourceUrl?: string; // page to credit / link back to
  license?: string;
  attributionRequired: boolean;
  attributionText?: string; // pre-formatted credit line when required
  downloadLocation?: string; // Unsplash "trigger a download" endpoint
};

export type QuoteSearchOpts = {
  query?: string;
  tag?: string;
  author?: string;
  limit?: number;
};

export type ImageSearchOpts = {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: "landscape" | "portrait" | "square";
};

export type QuoteSource = {
  key: string;
  label: string;
  enabled: () => boolean;
  random: (opts: { tag?: string }) => Promise<QuoteResult | null>;
  search?: (opts: QuoteSearchOpts) => Promise<QuoteResult[]>;
};

export type ImageSource = {
  key: string;
  label: string;
  enabled: () => boolean;
  search: (opts: ImageSearchOpts) => Promise<ImageResult[]>;
};
