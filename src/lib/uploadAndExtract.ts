"use client";

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

// Sends the file straight to our own /api/extract-text route, which reads
// the text out of it. Photos are downscaled first (above) so they stay well
// under Vercel's ~4.5MB request-body limit; for other files we guard the
// size here and ask the user to compress or paste text if they're too big.
// (We deliberately don't route through Vercel Blob storage anymore — it added
// a fragile token dependency for files that are small enough to send directly.)
export async function uploadAndExtractText(file: File): Promise<string> {
  const prepared = await downscaleImage(file);

  const MAX_BYTES = 4 * 1024 * 1024;
  if (prepared.size > MAX_BYTES) {
    throw new Error(
      "That file is a little too large to read directly. Please compress it (or export a smaller PDF), or paste your text into the box below."
    );
  }

  const form = new FormData();
  form.append("file", prepared, prepared.name);
  form.append("filename", prepared.name);

  let res;
  try {
    res = await fetch("/api/extract-text", { method: "POST", body: form });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[fledgy] extract-text upload failed",
      err,
      err instanceof Error ? err.stack : undefined
    );
    throw err;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data.text as string;
}
