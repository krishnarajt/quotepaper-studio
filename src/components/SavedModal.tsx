"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import { useStudio } from "@/lib/store/useStudio";

export default function SavedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const favorites = useStudio((s) => s.favorites);
  const loadFavorite = useStudio((s) => s.loadFavorite);
  const removeFavorite = useStudio((s) => s.removeFavorite);

  return (
    <Modal open={open} onClose={onClose} title={`Saved (${favorites.length})`}>
      {favorites.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          Nothing saved yet. Compose a wallpaper and hit <span className="text-zinc-300">Save</span>.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {favorites.map((f) => (
            <div key={f.id} className="group relative overflow-hidden rounded-lg ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => {
                  loadFavorite(f);
                  onClose();
                }}
                className="block w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.thumb} alt={f.quote.content} className="aspect-video w-full object-cover" />
                <p className="truncate px-2 py-1.5 text-left text-[11px] text-zinc-400">— {f.quote.author}</p>
              </button>
              <button
                type="button"
                onClick={() => removeFavorite(f.id)}
                title="Delete"
                className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-zinc-300 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
