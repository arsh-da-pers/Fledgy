import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Issues short-lived, scoped tokens so the browser can upload files
// straight to Vercel Blob storage, bypassing the 4.5MB request-body limit
// that applies to Vercel serverless functions. Needs a Blob store connected
// to this project (Vercel dashboard -> Storage -> Create Database -> Blob
// -> Connect to Project) so BLOB_READ_WRITE_TOKEN is set.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;

  // Temporary diagnostics — logs metadata only, never the secret itself.
  const rwToken = process.env.BLOB_READ_WRITE_TOKEN || "";
  console.log("[fledgy] blob auth diagnostics", {
    hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN,
    blobStoreId: process.env.BLOB_STORE_ID || null,
    hasReadWriteToken: !!rwToken,
    readWriteTokenLength: rwToken.length,
    readWriteTokenIsTrimmed: rwToken === rwToken.trim(),
    readWriteTokenPrefix: rwToken.slice(0, 16),
    readWriteTokenStoreSegment: rwToken.split("_")[3] || null,
  });

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 20 * 1024 * 1024, // 20MB, well under Claude's 32MB request cap
        };
      },
      onUploadCompleted: async () => {
        // No-op: we read the file right after upload and delete it
        // ourselves from the extract-text route once we're done with it.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}
