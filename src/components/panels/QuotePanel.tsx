"use client";

import { RefreshCw, Search, Quote as QuoteIcon } from "lucide-react";
import { useStudio } from "@/lib/store/useStudio";
import { Section, Chip, Spinner } from "@/components/ui";

const SOURCE_LABEL: Record<string, string> = {
  quotable: "Quotable",
  dummyjson: "DummyJSON",
  apininjas: "API Ninjas",
  local: "Offline",
};

export default function QuotePanel({ onOpenLibrary }: { onOpenLibrary: () => void }) {
  const quote = useStudio((s) => s.quote);
  const quoteSource = useStudio((s) => s.quoteSource);
  const loading = useStudio((s) => s.loadingQuote);
  const newQuote = useStudio((s) => s.newQuote);

  return (
    <Section
      title="Quote"
      action={
        quoteSource ? (
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {SOURCE_LABEL[quoteSource] ?? quoteSource}
          </span>
        ) : null
      }
    >
      <div className="mb-3 rounded-lg bg-white/5 p-3">
        {quote ? (
          <>
            <p className="flex gap-1.5 text-sm leading-relaxed text-zinc-100">
              <QuoteIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span>{quote.content}</span>
            </p>
            <p className="mt-2 text-xs text-zinc-400">— {quote.author}</p>
            {quote.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {quote.tags.map((t) => (
                  <Chip key={t} label={t} onClick={() => newQuote(t)} />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500">Loading a quote…</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => newQuote()}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          New quote
        </button>
        <button
          type="button"
          onClick={onOpenLibrary}
          className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/20"
          title="Browse the quote library"
        >
          <Search className="h-4 w-4" />
          Library
        </button>
      </div>
    </Section>
  );
}
