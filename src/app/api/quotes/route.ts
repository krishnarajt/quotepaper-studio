// Quote API: runs the redundancy chain server-side and normalizes everything to
// one shape. Modes:
//   ?mode=random&tag=Wisdom        -> a single quote (default)
//   ?mode=search&query=&tag=&author=&limit=  -> a list
//   ?mode=tags                     -> tag vocabulary for the library filter

import { getRandomQuote, searchQuotes, getQuoteTags } from "@/lib/sources/quotes";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "random";

  try {
    if (mode === "tags") {
      const tags = await getQuoteTags();
      return Response.json(
        { tags },
        { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
      );
    }

    if (mode === "search") {
      const quotes = await searchQuotes({
        query: searchParams.get("query") ?? undefined,
        tag: searchParams.get("tag") ?? undefined,
        author: searchParams.get("author") ?? undefined,
        limit: numberParam(searchParams.get("limit")),
      });
      return Response.json(
        { quotes },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
      );
    }

    const { quote, from } = await getRandomQuote({
      tag: searchParams.get("tag") ?? undefined,
    });
    return Response.json({ quote, from }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[api/quotes] error:", err);
    return Response.json({ error: "Failed to fetch quote" }, { status: 502 });
  }
}

function numberParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
