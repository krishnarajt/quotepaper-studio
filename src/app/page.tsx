"use client";

import { useEffect, useRef, useState } from "react";
import { useStudio } from "@/lib/store/useStudio";
import TopBar from "@/components/TopBar";
import StudioCanvas from "@/components/StudioCanvas";
import QuotePanel from "@/components/panels/QuotePanel";
import BackgroundPanel from "@/components/panels/BackgroundPanel";
import StylePanel from "@/components/panels/StylePanel";
import LibraryModal from "@/components/LibraryModal";
import SavedModal from "@/components/SavedModal";
import { Spinner } from "@/components/ui";

export default function StudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  const quote = useStudio((s) => s.quote);
  const newQuote = useStudio((s) => s.newQuote);

  // Gate on mount to avoid hydration mismatches from persisted (localStorage)
  // state, then fetch the first quote + background.
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !quote) newQuote();
  }, [mounted, quote, newQuote]);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      <TopBar canvasRef={canvasRef} onOpenSaved={() => setSavedOpen(true)} />

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_50%_0%,#1e1b3a_0%,#09090b_60%)] p-4 lg:p-8">
          <StudioCanvas canvasRef={canvasRef} />
        </div>

        <aside className="w-full shrink-0 overflow-y-auto border-t border-white/10 bg-zinc-900/60 lg:w-[360px] lg:border-l lg:border-t-0">
          <QuotePanel onOpenLibrary={() => setLibraryOpen(true)} />
          <BackgroundPanel />
          <StylePanel />
          <p className="px-4 py-5 text-[11px] leading-relaxed text-zinc-600">
            Quotes: Quotable · DummyJSON · offline corpus. Images: Pixabay · Openverse · Unsplash · Pexels · Art Institute · Picsum.
            Sources fall back automatically if any are unavailable.
          </p>
        </aside>
      </main>

      <LibraryModal open={libraryOpen} onClose={() => setLibraryOpen(false)} />
      <SavedModal open={savedOpen} onClose={() => setSavedOpen(false)} />
    </>
  );
}
