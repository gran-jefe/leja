import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Loads the vendored Fraunces TTF for `next/og`.
 *
 * Satori can't read the fonts `next/font` installs — it needs the raw binary —
 * and it only parses TTF/OTF/WOFF. Fetching from Google Fonts at build time
 * doesn't work for either format on offer: a modern user agent gets woff2,
 * which Satori rejects, and the legacy user agent that used to return TTF now
 * serves a subsetted payload with a non-TrueType header.
 *
 * It also cannot handle *variable* fonts: Fraunces' variable TTF makes Satori
 * throw "Cannot read properties of undefined (reading '256')". A static
 * single-weight instance is required.
 *
 * So a static 600-weight WOFF is vendored at
 * `src/assets/fonts/Fraunces-SemiBold.woff` (22KB, SIL Open Font License,
 * redistribution permitted). Reading from disk also makes builds deterministic
 * and offline-capable — a font CDN outage can no longer fail a deploy.
 */
const FONT_PATH = path.join(process.cwd(), 'src/assets/fonts/Fraunces-SemiBold.woff');

let cached: Buffer | null = null;

export async function loadDisplayFont(): Promise<Buffer> {
  if (!cached) cached = await readFile(FONT_PATH);
  return cached;
}
