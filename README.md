# Quotepaper Studio

Make beautiful wallpapers from inspiring quotes. Pull a themed background that
matches a quote, style the text live, and export a PNG at wallpaper resolution.

A modern rebuild of the original Create-React-App *Quotepaper Generator*, now on
**Next.js (App Router) + React 19 + TypeScript + Tailwind 4**, with a resilient
multi-source data layer that keeps working even when individual APIs go down.

## Features

- **Quote engine** with a redundancy chain: Quotable mirror → DummyJSON →
  API Ninjas (optional) → a **bundled offline corpus** (2,127 tagged quotes) so
  it never fails, even with no network.
- **Wallpaper engine** across six free sources: Pixabay → Openverse (CC0) →
  Unsplash → Pexels → Art Institute of Chicago (CC0) → Lorem Picsum. The chain
  auto-falls-through, so you always get a background.
- **Themed matching** — the quote's tags drive the background search.
- **Live studio editor** — font, size, colour, alignment, position, uppercase,
  quote marks, background darken/blur/vignette, and 5 aspect ratios
  (16:9, 9:16, 1:1, 4:5, 3:2).
- **One-click PNG export** at full resolution (1080p+). All images are streamed
  through a same-origin proxy so the canvas never taints.
- **Quote library** (search/browse by keyword & tag) and **saved favorites**
  (persisted in your browser).
- Required photographer/source **attribution** shown for Unsplash & Pexels.

## Architecture

```
src/
  app/
    api/quotes/route.ts     # runs the quote chain server-side, normalizes output
    api/images/route.ts     # runs the image chain server-side, injects secret keys
    api/img-proxy/route.ts  # streams any provider image with CORS → canvas-safe export
    page.tsx                # the studio UI
  lib/
    sources/quotes/*        # one adapter per quote provider + the chain
    sources/images/*        # one adapter per image provider + the chain
    canvas.ts               # background + text rendering and PNG export
    store/useStudio.ts      # app state (zustand, favorites persisted)
  data/quotes.json          # bundled offline fallback corpus
```

Adding or removing a source is a single file in `src/lib/sources/*`.

## Running locally

```bash
npm install
cp .env.example .env.local   # optional — add keys to enable more sources
npm run dev                  # http://localhost:3000  (this repo runs it on 9441)
```

The app runs **with zero keys** using the keyless sources (Quotable mirror,
DummyJSON, Openverse, Art Institute, Picsum) plus the offline corpus. Each key
below simply adds another provider to the chain.

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables (all optional):

| Variable | Enables | Get a key |
|---|---|---|
| `PIXABAY_API_KEY` | Pixabay photos | https://pixabay.com/api/docs/ |
| `UNSPLASH_ACCESS_KEY` | Unsplash photos | https://unsplash.com/developers |
| `PEXELS_API_KEY` | Pexels photos | https://www.pexels.com/api/ |
| `API_NINJAS_KEY` | Category-tagged quotes | https://api-ninjas.com/ |
| `OPENVERSE_TOKEN` | Higher Openverse rate limits | https://api.openverse.org |
| `IMG_PROXY_ALLOWED_HOSTS` | Extra image hosts for the proxy (comma-separated) | — |

> **Security:** keys live only in server-side API routes, never in the browser
> bundle. Rotate the Unsplash key if you migrated it from the old public repo.

## Deploy to Vercel

Push to a Git repo and import it in Vercel — the Next.js preset needs no extra
config. Add the environment variables above, and deploy. The API routes become
serverless functions automatically.
