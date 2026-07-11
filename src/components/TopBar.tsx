"use client";

import { type RefObject } from "react";
import { Download, Heart, Images, Sparkles } from "lucide-react";
import { useStudio } from "@/lib/store/useStudio";
import { downloadCanvas } from "@/lib/canvas";
import { ASPECT_ORDER, ASPECTS, type AspectKey } from "@/lib/constants";
import { SegButton } from "@/components/ui";

function makeThumb(canvas: HTMLCanvasElement): string {
  const scale = 360 / canvas.width;
  const off = document.createElement("canvas");
  off.width = 360;
  off.height = Math.round(canvas.height * scale);
  off.getContext("2d")?.drawImage(canvas, 0, 0, off.width, off.height);
  return off.toDataURL("image/jpeg", 0.7);
}

export default function TopBar({
  canvasRef,
  onOpenSaved,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onOpenSaved: () => void;
}) {
  const aspect = useStudio((s) => s.aspect);
  const setAspect = useStudio((s) => s.setAspect);
  const quote = useStudio((s) => s.quote);
  const saveFavorite = useStudio((s) => s.saveFavorite);
  const favCount = useStudio((s) => s.favorites.length);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const slug = (quote?.author ?? "quote").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24);
    downloadCanvas(canvas, `quotepaper-${slug}-${aspect.replace(":", "x")}.png`);
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas || !quote) return;
    saveFavorite(makeThumb(canvas));
  }

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 pr-2">
        <Sparkles className="h-5 w-5 text-indigo-400" />
        <span className="text-sm font-semibold tracking-tight text-white">Quotepaper Studio</span>
      </div>

      <div className="w-64 max-w-full">
        <SegButton<AspectKey>
          value={aspect}
          onChange={setAspect}
          options={ASPECT_ORDER.map((a) => ({ value: a, label: a, title: ASPECTS[a].label }))}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSaved}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/20"
        >
          <Images className="h-4 w-4" />
          Saved
          {favCount > 0 && (
            <span className="rounded-full bg-indigo-500 px-1.5 text-[10px] font-semibold text-white">{favCount}</span>
          )}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!quote}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/20 disabled:opacity-40"
        >
          <Heart className="h-4 w-4" />
          Save
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!quote}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </header>
  );
}
