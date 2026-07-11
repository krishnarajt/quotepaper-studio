// Image API: runs the image redundancy chain server-side (injecting keys for
// Pixabay/Unsplash/Pexels) and returns normalized results.
//   ?query=ocean&page=1&perPage=40&orientation=landscape
//   ?mode=status  -> which providers are configured/enabled

import { searchImages, imageSourceStatus } from "@/lib/sources/images";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("mode") === "status") {
    return Response.json({ sources: imageSourceStatus() });
  }

  const query = (searchParams.get("query") ?? "").trim() || "nature";
  const orientation = searchParams.get("orientation") as
    | "landscape"
    | "portrait"
    | "square"
    | null;

  try {
    const { images, from } = await searchImages({
      query,
      page: numberParam(searchParams.get("page")) ?? 1,
      perPage: numberParam(searchParams.get("perPage")) ?? 40,
      orientation: orientation ?? undefined,
    });
    return Response.json(
      { images, from, query },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    console.error("[api/images] error:", err);
    return Response.json({ error: "Failed to fetch images" }, { status: 502 });
  }
}

function numberParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
