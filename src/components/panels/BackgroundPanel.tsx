"use client";

import { useState } from "react";
import Image from "next/image";
import { Shuffle } from "lucide-react";
import { useStudio } from "@/lib/store/useStudio";
import { proxied } from "@/lib/api";
import { Section, Spinner } from "@/components/ui";

export default function BackgroundPanel() {
  const images = useStudio((s) => s.images);
  const background = useStudio((s) => s.background);
  const imageQuery = useStudio((s) => s.imageQuery);
  const imageFrom = useStudio((s) => s.imageFrom);
  const loading = useStudio((s) => s.loadingImages);
  const loadImagesFor = useStudio((s) => s.loadImagesFor);
  const setBackground = useStudio((s) => s.setBackground);
  const shuffleBackground = useStudio((s) => s.shuffleBackground);

  const [term, setTerm] = useState("");

  return (
    <Section
      title="Background"
      action={
        imageFrom ? (
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {images.length} · {imageFrom}
          </span>
        ) : null
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (term.trim()) loadImagesFor(term.trim());
        }}
        className="mb-3 flex gap-2"
      >
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={imageQuery || "Search photos…"}
          className="min-w-0 flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:bg-white/10 focus:outline-none"
        />
        <button
          type="button"
          onClick={shuffleBackground}
          disabled={images.length < 2}
          title="Shuffle background"
          className="flex items-center justify-center rounded-lg bg-white/10 px-3 text-zinc-200 transition hover:bg-white/20 disabled:opacity-40"
        >
          <Shuffle className="h-4 w-4" />
        </button>
      </form>

      {loading && images.length === 0 ? (
        <div className="flex h-24 items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <div className="grid max-h-64 grid-cols-3 gap-1.5 overflow-y-auto">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setBackground(img)}
              className={`relative aspect-square overflow-hidden rounded-md ring-2 transition ${
                background?.id === img.id ? "ring-indigo-400" : "ring-transparent hover:ring-white/30"
              }`}
            >
              <Image
                src={proxied(img.thumbUrl)}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </Section>
  );
}
