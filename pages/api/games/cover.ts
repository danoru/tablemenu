import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import sharp from "sharp";

import { authOptions } from "@/lib/authOptions";

// Square-cropped, recompressed board-game cover proxy. Exists so the client-side
// PDF renderer can embed BGG art: geekdo image URLs are cross-origin (no CORS
// for fetch) and sometimes webp, which @react-pdf can't decode. Normalising to
// a small same-origin JPEG fixes both and keeps exported PDFs light.

const ALLOWED_HOSTS = /(^|\.)geekdo-images\.com$|(^|\.)geekdo\.com$|(^|\.)boardgamegeek\.com$/i;
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const COVER_SIZE = 240;
const PAPER = "#fffbf0"; // transparent PNGs flatten onto menu paper

function isAllowed(url: URL): boolean {
  return url.protocol === "https:" && ALLOWED_HOSTS.test(url.hostname);
}

// @react-pdf's <Image> aborts the whole document render if a src returns a
// non-image body, so once the caller is authenticated every outcome — bad src,
// upstream failure, oversized file — must still be a JPEG. Failures get this
// plain paper tile (uncached, so transient upstream errors heal on retry).
let placeholderPromise: Promise<Buffer> | null = null;
function placeholderJpeg(): Promise<Buffer> {
  placeholderPromise ??= sharp({
    create: { width: COVER_SIZE, height: COVER_SIZE, channels: 3, background: PAPER },
  })
    .jpeg({ quality: 82 })
    .toBuffer();
  return placeholderPromise;
}

async function sendPlaceholder(res: NextApiResponse) {
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(await placeholderJpeg());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const src = typeof req.query.src === "string" ? req.query.src : "";
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return sendPlaceholder(res);
  }
  if (!isAllowed(url)) {
    return sendPlaceholder(res);
  }

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(8000) });
    // fetch follows redirects — re-check the landing URL so an allowed host
    // can't bounce us to an internal or third-party address (SSRF).
    if (!upstream.ok || !isAllowed(new URL(upstream.url))) {
      return sendPlaceholder(res);
    }
    const declared = Number(upstream.headers.get("content-length") ?? 0);
    if (declared > MAX_SOURCE_BYTES) {
      return sendPlaceholder(res);
    }
    const source = Buffer.from(await upstream.arrayBuffer());
    if (source.byteLength > MAX_SOURCE_BYTES) {
      return sendPlaceholder(res);
    }

    const jpeg = await sharp(source)
      .resize(COVER_SIZE, COVER_SIZE, { fit: "cover" })
      .flatten({ background: PAPER })
      .jpeg({ quality: 82 })
      .toBuffer();

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=86400");
    return res.status(200).send(jpeg);
  } catch {
    return sendPlaceholder(res);
  }
}
