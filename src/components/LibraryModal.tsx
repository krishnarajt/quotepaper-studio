"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Modal from "@/components/Modal";
import { Chip, Spinner } from "@/components/ui";
import { useStudio } from "@/lib/store/useStudio";
import { searchQuotes } from "@/lib/api";
import type { QuoteResult } from "@/lib/types";

export default function LibraryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tags = useStudio((s) => s.tags);
  const loadTags = useStudio((s) => s.loadTags);
  const setQuote = useStudio((s) => s.setQuote);

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [results, setResults] = useState<QuoteResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadTags();
  }, [open, loadTags]);

  // Debounced search whenever the query or tag changes while open.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchQuotes({ query: query.trim() || undefined, tag: tag ?? undefined, limit: 50 });
      setResults(r);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [open, query, tag]);

  return (
    <Modal open={open} onClose={onClose} title="Quote library">
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-white/5 px-3">
        <Search className="h-4 w-4 text-zinc-500" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search quotes or authors…"
          className="w-full bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Chip label="All" active={tag === null} onClick={() => setTag(null)} />
        {tags.slice(0, 18).map((t) => (
          <Chip key={t.name} label={t.name} active={tag === t.name} onClick={() => setTag(t.name)} />
        ))}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      ) : results.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">No quotes found.</p>
      ) : (
        <ul className="space-y-2">
          {results.map((q) => (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => {
                  setQuote(q);
                  onClose();
                }}
                className="w-full rounded-lg bg-white/5 p-3 text-left transition hover:bg-white/10"
              >
                <p className="text-sm text-zinc-100">{q.content}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  — {q.author}
                  {q.tags.length > 0 && <span className="text-zinc-600"> · {q.tags.join(", ")}</span>}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
