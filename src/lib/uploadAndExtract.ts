"use client";

import { upload } from "@vercel/blob/client";

// Downscales a photo client-side before it ever leaves the browser. Phone
// camera photos are routinely 3-8MB, which is both slow to upload and
// pushes on Claude's vision token cost — a CV/essay photo doesn't need
// more than ~2000px on its longest side to stay perfectly legible.
async function downscaleImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const maxDim = 2000;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));

  // Already small enough — don't bother re-encoding.
  if (scale >= 1 && file.size < 4 * 1024 * 1024) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85)
  );
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

// Uploads a file straight to Vercel Blob from the browser (so large scans
// and photos never hit the 4.5MB body limit on our API routes), then asks
// /api/extract-text to read the text out of it.
export async function uploadAndExtractText(file: File): Promise<string> {
  const prepared = await downscaleImage(file);

  let blob;
  try {
    blob = await upload(prepared.name, prepared, {
      access: "private",
      handleUploadUrl: "/api/upload",
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[fledgy] blob upload() failed",
      err,
      err instanceof Error ? err.stack : undefined
    );
    throw err;
  }

  let res;
  try {
    res = await fetch("/api/extract-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: blob.url, filename: prepared.name }),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[fledgy] extract-text fetch failed",
      err,
      err instanceof Error ? err.stack : undefined
    );
    throw err;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data.text as string;
}
