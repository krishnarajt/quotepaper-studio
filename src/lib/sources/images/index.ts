// Image redundancy chain. Order: Pixabay -> Openverse -> Unsplash (keyed) ->
// Pexels (keyed) -> Art Institute -> Lorem Picsum. Picsum never fails, so
// searchImages always returns at least a set of usable backgrounds.

import { firstOk } from "@/lib/http";
import type { ImageResult, ImageSearchOpts, ImageSource } from "@/lib/types";
import { pixabay } from "./pixabay";
import { openverse } from "./openverse";
import { unsplash } from "./unsplash";
import { pexels } from "./pexels";
import { artic } from "./artic";
import { picsum } from "./picsum";

const CHAIN: ImageSource[] = [pixabay, openverse, unsplash, pexels, artic, picsum];

function active(): ImageSource[] {
  return CHAIN.filter((s) => s.enabled());
}

export async function searchImages(opts: ImageSearchOpts): Promise<{
  images: ImageResult[];
  from: string;
}> {
  const result = await firstOk(
    active().map((s) => ({ key: s.key, run: () => s.search(opts) })),
  );
  if (result) return { images: result.value, from: result.from };
  const images = await picsum.search(opts); // defensive; picsum is in the chain
  return { images, from: "picsum" };
}

export function imageSourceStatus(): { key: string; label: string; enabled: boolean }[] {
  return CHAIN.map((s) => ({ key: s.key, label: s.label, enabled: s.enabled() }));
}
