# Image brief — "Warm Institution" (Navy + Brass)

Every asset below has a real slot in the built code. Paths are where the file
must land; the component column is what consumes it. Nothing here needs a code
change unless noted.

**Palette to match** — navy `#0B1620` · brass `#B8862B` · warm paper `#FAF6EE`.
Forest green is a *status* colour only, so keep it out of photography.

---

## Priority 1 — DONE (generated, not shipped as binaries)

All three former 404s are now generated at build time by Next's file-based
metadata. No assets to commission, and they can't drift from the brand.

| Route | Source | Notes |
|---|---|---|
| `/opengraph-image` | `src/app/opengraph-image.tsx` | 1200×630 PNG, real Fraunces |
| `/apple-icon` | `src/app/apple-icon.tsx` | 180×180 PNG, seal-and-doorway mark |
| `/icon.svg` | `src/app/icon.svg` | moved out of `public/` so Next emits the `<link>` |

The hand-written `icons` and `openGraph.images` keys were removed from
`layout.tsx` — they pointed at `/og.jpg`, `/favicon.ico` and
`/apple-touch-icon.png`, none of which existed.

**Three Satori constraints worth knowing before editing these files:**

1. It can't read `next/font`'s fonts, only raw binaries — and it rejects
   `woff2` and *variable* fonts. A static 600-weight WOFF is vendored at
   `src/assets/fonts/Fraunces-SemiBold.woff` (22KB, OFL). Don't swap it for the
   variable TTF; Satori throws `Cannot read properties of undefined`.
2. Any element with more than one child needs an explicit `display: flex`.
3. Glyphs outside the vendored subset trigger a dynamic font download that
   fails the build — which is why the card reads "Free to agree" rather than
   "₦0 to agree".

**Still missing:** `/favicon.ico`. `icon.svg` covers every modern browser, but
some crawlers probe `/favicon.ico` by convention and will get a 404. Harmless,
and fixable by rasterising `icon.svg` to a 32×32 `.ico` into `src/app/` — no
tooling for that was available locally.

---

## Copy-paste prompts

Each is complete — the grade and negative prompt are already baked in, so
nothing needs assembling. Generate the four marked ESSENTIAL first; they
carry most of the visual lift.

Save every file into `apps/web/public/`.

### 01 · `hero-lagos-residence.jpg` · 2400×1600 (16:9) · **ESSENTIAL**

```
Wide editorial photograph of a modern mid-rise residential apartment building in Lekki, Lagos, Nigeria, late afternoon golden light raking across the facade, terracotta and cream rendered walls, dark window frames, one warmly lit window, mature palm and frangipani trees in the foreground softly out of focus, deep navy-blue sky at the top of the frame, quiet and unpeopled, generous empty space across the left third of the frame, warm afternoon light, soft directional shadows, slightly desaturated with warm golden highlights and deep cool navy-blue shadows, brass and terracotta tones in the midtones, no green cast, subtle 35mm film grain, natural colour, no HDR, no blue-teal colour grading, documentary photography, shot on 35mm lens f/2.8, no text, no logos, no watermarks

--ar 16:9 --style raw
Negative: text, letters, words, watermark, logo, signage, distorted hands, extra fingers, plastic skin, stock-photo smile, looking at camera, corporate handshake cliché, blue-teal grading, HDR, oversaturated, cluttered
```

### 02 · `letting-interior.jpg` · 1400×1750 (4:5) · **ESSENTIAL**

```
Interior photograph of a bright empty Nigerian apartment living room, polished concrete or warm terrazzo floor, tall windows with sheer curtains diffusing afternoon light, a single tan leather mid-century armchair, warm off-white walls with one deep navy accent wall, a slim brass floor lamp, a set of keys and a document folder on a low side table, calm and aspirational but modest and real, no clutter, warm afternoon light, soft directional shadows, slightly desaturated with warm golden highlights and deep cool navy-blue shadows, brass and terracotta tones in the midtones, no green cast, subtle 35mm film grain, natural colour, no HDR, no blue-teal colour grading, documentary photography, shot on 35mm lens f/2.8, no text, no logos, no watermarks

--ar 4:5 --style raw
Negative: text, letters, words, watermark, logo, signage, distorted hands, extra fingers, plastic skin, stock-photo smile, looking at camera, corporate handshake cliché, blue-teal grading, HDR, oversaturated, cluttered
```

### 03 · `renting-moving-in.jpg` · 1400×1750 (4:5) · **ESSENTIAL**

```
Documentary photograph of a young Nigerian woman seen from behind and slightly to the side, standing in the doorway of a newly rented apartment holding a cardboard moving box, warm afternoon light streaming past her into the empty room, her face not visible, unstyled everyday clothing, hopeful and quiet, shallow depth of field, warm afternoon light, soft directional shadows, slightly desaturated with warm golden highlights and deep cool navy-blue shadows, brass and terracotta tones in the midtones, no green cast, subtle 35mm film grain, natural colour, no HDR, no blue-teal colour grading, documentary photography, shot on 35mm lens f/2.8, no text, no logos, no watermarks

--ar 4:5 --style raw
Negative: text, letters, words, watermark, logo, signage, distorted hands, extra fingers, plastic skin, stock-photo smile, looking at camera, corporate handshake cliché, blue-teal grading, HDR, oversaturated, cluttered
```

### 04 · `trust-handover.jpg` · 1600×1200 (4:3) · **ESSENTIAL**

```
Close documentary photograph of two pairs of hands across a wooden table, one hand passing a set of house keys to another, a printed tenancy agreement and a pen resting beside them, warm window light from the right, faces entirely out of frame, cropped at the forearms, intimate and calm, warm afternoon light, soft directional shadows, slightly desaturated with warm golden highlights and deep cool navy-blue shadows, brass and terracotta tones in the midtones, no green cast, subtle 35mm film grain, natural colour, no HDR, no blue-teal colour grading, documentary photography, shot on 35mm lens f/2.8, no text, no logos, no watermarks

--ar 4:3 --style raw
Negative: text, letters, words, watermark, logo, signage, distorted hands, extra fingers, plastic skin, stock-photo smile, looking at camera, corporate handshake cliché, blue-teal grading, HDR, oversaturated, cluttered
```

### 05 · `verification-desk.jpg` · 1600×1000 (16:10) · **OPTIONAL**

```
Overhead flat-lay photograph on a dark walnut desk: a Nigerian property title document, an embossed brass notary seal catching the light, a brass fountain pen, a pair of reading glasses, warm lamplight from the upper left casting long soft shadows, a deep navy desk mat beneath, warm off-white paper, warm afternoon light, soft directional shadows, slightly desaturated with warm golden highlights and deep cool navy-blue shadows, brass and terracotta tones in the midtones, no green cast, subtle 35mm film grain, natural colour, no HDR, no blue-teal colour grading, documentary photography, shot on 35mm lens f/2.8, no text, no logos, no watermarks

--ar 16:10 --style raw
Negative: text, letters, words, watermark, logo, signage, distorted hands, extra fingers, plastic skin, stock-photo smile, looking at camera, corporate handshake cliché, blue-teal grading, HDR, oversaturated, cluttered
```

### 06 · `legal-team.jpg` · 1600×1000 (16:10) · **OPTIONAL**

```
Environmental documentary photograph inside a modern Lagos law office, a Nigerian lawyer at a desk reviewing a printed document, seen in three-quarter profile from a distance, large window with warm afternoon light behind, bookshelf softly out of focus, natural unposed posture, muted navy and warm wood tones, warm afternoon light, soft directional shadows, slightly desaturated with warm golden highlights and deep cool navy-blue shadows, brass and terracotta tones in the midtones, no green cast, subtle 35mm film grain, natural colour, no HDR, no blue-teal colour grading, documentary photography, shot on 35mm lens f/2.8, no text, no logos, no watermarks

--ar 16:10 --style raw
Negative: text, letters, words, watermark, logo, signage, distorted hands, extra fingers, plastic skin, stock-photo smile, looking at camera, corporate handshake cliché, blue-teal grading, HDR, oversaturated, cluttered
```

### 07 · `property-placeholder.jpg` · 1200×900 (4:3) · **OPTIONAL**

```
Minimal architectural detail photograph, a warm cream rendered wall meeting a dark window reveal at an angle, raking afternoon light, abstract and unidentifiable as any specific building, mostly negative space, warm afternoon light, soft directional shadows, slightly desaturated with warm golden highlights and deep cool navy-blue shadows, brass and terracotta tones in the midtones, no green cast, subtle 35mm film grain, natural colour, no HDR, no blue-teal colour grading, documentary photography, shot on 35mm lens f/2.8, no text, no logos, no watermarks

--ar 4:3 --style raw
Negative: text, letters, words, watermark, logo, signage, distorted hands, extra fingers, plastic skin, stock-photo smile, looking at camera, corporate handshake cliché, blue-teal grading, HDR, oversaturated, cluttered
```

### 08–10 · How-it-works trio · 1200×1200 each, transparent PNG · **OPTIONAL**

Generate all three in one session so the camera angle and lighting match —
they sit side by side and any drift between them is obvious.

**08 · `step-connect.png` — Connect**

```
Isometric 3D render of two simple house forms on separate navy platforms joined by a single clean brass arc. Matte clay materials with one polished brass element, soft studio lighting from the upper left, deep navy #0B1620 base forms with warm brass #B8862B accents and warm off-white #FAF6EE surfaces, subtle contact shadow, transparent background, no green, no text, centred in frame

--ar 1:1
Negative: text, letters, logo, watermark, green, busy background, drop shadow on backdrop
```

**09 · `step-agree.png` — Agree**

```
Isometric 3D render of a warm off-white document sheet floating above a navy platform, a brass signature line and a brass check mark rising off it. Matte clay materials with one polished brass element, soft studio lighting from the upper left, deep navy #0B1620 base forms with warm brass #B8862B accents and warm off-white #FAF6EE surfaces, subtle contact shadow, transparent background, no green, no text, centred in frame

--ar 1:1
Negative: text, letters, logo, watermark, green, busy background, drop shadow on backdrop
```

**10 · `step-protect.png` — Protect**

```
Isometric 3D render of a navy house form enclosed inside a translucent shield, a polished brass seal at the shield's base. Matte clay materials with one polished brass element, soft studio lighting from the upper left, deep navy #0B1620 base forms with warm brass #B8862B accents and warm off-white #FAF6EE surfaces, subtle contact shadow, transparent background, no green, no text, centred in frame

--ar 1:1
Negative: text, letters, logo, watermark, green, busy background, drop shadow on backdrop
```

### 11 · `seal-motif.svg` · 1000×1000 transparent · **OPTIONAL**

Vector — generate as PNG then trace, or draw directly.

```
Minimal vector illustration of an embossed circular verification seal, concentric fine-line rings with a subtle radial guilloche pattern like a banknote, a simple house silhouette at the centre, brass and deep gold monochrome, flat with a subtle emboss shadow, engraved certificate aesthetic, transparent background, no text

--ar 1:1
Negative: text, letters, photorealism, gradient mesh, 3D, drop shadow
```

### Export notes

- **WebP or AVIF** for the photographs, not JPEG. The hero is the page's LCP
  element and the single biggest Lighthouse lever.
- Keep the filenames exactly as given — the slots will be wired to them.
- The hero's left third must stay quiet; the headline sits there behind a scrim.

---

## Before adding any of these

`next.config.js` already has `remotePatterns` for Supabase-hosted photos, but
local files in `public/` need no config. Two rules:

1. **Export as WebP or AVIF**, not JPEG, wherever the source allows — the hero
   at 2400px wide is the page's LCP element and the single biggest lever on
   Lighthouse.
2. **Use `SafeImage`** (`components/ui/SafeImage.tsx`) rather than `next/image`
   directly, so an unoptimisable URL degrades instead of throwing at runtime.
