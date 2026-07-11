// Streams a chosen photo back through our own origin with CORS headers, so the
// studio can draw ANY provider's image onto a <canvas> and still export a PNG
// (cross-origin images without CORS headers otherwise "taint" the canvas and
// block toBlob/toDataURL).
//
// It is a bounded proxy, not an open one: only https URLs on an allowlist of
// our providers' image hosts are fetched. Extend via IMG_PROXY_ALLOWED_HOSTS
// (comma-separated host suffixes).

export const runtime = "nodejs";

const DEFAULT_ALLOWED = [
  "pixabay.com",
  "unsplash.com",
  "images.unsplash.com",
  "pexels.com",
  "images.pexels.com",
  "artic.edu",
  "picsum.photos",
  "fastly.picsum.photos",
  // Openverse serves cc0 images from many upstream hosts:
  "openverse.org",
  "staticflickr.com",
  "flickr.com",
  "wikimedia.org",
  "stocksnap.io",
  "rawpixel.com",
  "nappy.co",
];

function allowedHosts(): string[] {
  const extra = (process.env.IMG_PROXY_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED, ...extra];
}

function isAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return allowedHosts().some((s) => host === s || host.endsWith(`.${s}`));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) return new Response("Missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (parsed.protocol !== "https:") return new Response("Only https allowed", { status: 400 });
  if (!isAllowed(parsed.hostname))
    return new Response(`Host not allowed: ${parsed.hostname}`, { status: 400 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: { "User-Agent": "QuotepaperStudio/1.0 (+image-proxy)" },
    });
    if (!upstream.ok || !upstream.body)
      return new Response(`Upstream ${upstream.status}`, { status: 502 });

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/"))
      return new Response("Not an image", { status: 415 });

    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=2592000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[img-proxy] error:", (err as Error).message);
    return new Response("Proxy error", { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
