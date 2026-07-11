"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useStudio } from "@/lib/store/useStudio";
import { loadImage, renderComposition } from "@/lib/canvas";
import { Spinner } from "@/components/ui";

export default function StudioCanvas({
  canvasRef,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const background = useStudio((s) => s.background);
  const quote = useStudio((s) => s.quote);
  const style = useStudio((s) => s.style);
  const aspect = useStudio((s) => s.aspect);
  const loadingImages = useStudio((s) => s.loadingImages);
  const loadingQuote = useStudio((s) => s.loadingQuote);

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const renderToken = useRef(0);

  // Load the background image whenever it changes.
  useEffect(() => {
    let cancelled = false;
    if (!background) {
      setImg(null);
      return;
    }
    setImgLoading(true);
    loadImage(background.url)
      .then((i) => {
        if (cancelled) return;
        setImg(i);
        setImgLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setImg(null);
        setImgLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [background]);

  // Re-render the canvas on any visual change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const token = ++renderToken.current;
    void renderComposition(canvas, { img, quote, style, aspect }).then(() => {
      // A newer render superseded this one; ignore.
      if (token !== renderToken.current) return;
    });
  }, [img, quote, style, aspect, canvasRef]);

  const busy = loadingImages || loadingQuote || imgLoading;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="relative flex max-h-full max-w-full items-center justify-center">
        <canvas
          ref={canvasRef}
          className="max-h-[72vh] max-w-full rounded-xl shadow-2xl ring-1 ring-white/10"
        />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-[1px]">
            <Spinner className="h-8 w-8" />
          </div>
        )}
      </div>

      {background && (
        <p className="max-w-full truncate px-4 text-center text-xs text-zinc-500">
          {background.attributionRequired && background.attributionText ? (
            <>
              {background.attributionText}
              {background.sourceUrl && (
                <>
                  {" · "}
                  <a href={background.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-zinc-300">
                    source
                  </a>
                </>
              )}
            </>
          ) : (
            <>
              via {background.source}
              {background.license ? ` · ${background.license}` : ""}
            </>
          )}
        </p>
      )}
    </div>
  );
}
