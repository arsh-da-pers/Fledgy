import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Uses Claude's vision/document understanding to transcribe text from a
// scanned PDF or a photographed/screenshotted document — no OCR library
// needed, Claude reads the page image(s) directly.
async function transcribeWithVision(
  buffer: Buffer,
  mediaType: "application/pdf" | "image/jpeg" | "image/png"
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("NO_API_KEY");
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const base64 = buffer.toString("base64");

  const contentBlock =
    mediaType === "application/pdf"
      ? ({
          type: "document",
          source: { type: "base64", media_type: mediaType, data: base64 },
        } as const)
      : ({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64 },
        } as const);

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          contentBlock,
          {
            type: "text",
            text: "This is a scanned or photographed document (a CV or an essay). Transcribe ALL the visible text exactly as written, in reading order. Do not summarize, comment, or add anything — output only the raw transcribed text.",
          },
        ],
      },
    ],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text.trim() : "";
}

// Plain-text extraction from a designed/multi-column PDF often comes out with
// the reading order scrambled (columns interleaved, the name buried mid-page).
// This has Claude reconstruct the raw extracted text into clean, correctly
// ordered plain text. It's a text-in/text-out call, so it's reliable and
// doesn't depend on the PDF renderer.
async function reflowText(raw: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return raw;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `The text below was extracted from a CV/résumé PDF and may be out of order or fragmented because of the page's columns and layout. Reconstruct it into clean, correctly ordered plain text in natural reading order (name and headline first, then each section). Keep ALL of the information; do not summarise, invent, or add commentary. Output only the cleaned text.\n\n---\n${raw}`,
      },
    ],
  });
  const textBlock = msg.content.find((b) => b.type === "text");
  const out = textBlock && "text" in textBlock ? textBlock.text.trim() : "";
  return out.length >= 20 ? out : raw;
}

export async function POST(req: NextRequest) {
  // The file is posted straight from the browser as multipart form data.
  // Photos are downscaled client-side first (see lib/uploadAndExtract) so
  // they stay well under Vercel's ~4.5MB request-body limit — no Blob
  // storage round-trip needed.
  try {
    const form = await req.formData();
    const file = form.get("file");
    const filename =
      (form.get("filename") as string) ||
      (file instanceof File ? file.name : "");

    if (!file || !(file instanceof File) || !filename) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = filename.toLowerCase();

    let text = "";

    if (name.endsWith(".pdf")) {
      // Read the PDF with Claude's document understanding FIRST. It follows
      // the correct human reading order (designed/multi-column CVs come out
      // scrambled with plain-text extraction) and actually looks at the page
      // — layout, columns and photos — instead of scraping a jumbled text
      // layer. This is what "look at the PDF, don't just render text" needs.
      try {
        text = await transcribeWithVision(buffer, "application/pdf");
      } catch (err) {
        if (!(err instanceof Error && err.message === "NO_API_KEY")) {
          console.error(err);
        }
        text = "";
      }

      // If reading the page visually didn't yield usable text, fall back to
      // extracting the PDF's text layer. Designed/multi-column CVs come out of
      // that extraction with the reading order scrambled, so we then have
      // Claude reflow it into clean, correctly ordered text.
      if (text.length < 20) {
        let rawText = "";
        try {
          const pdfParse = (await import("pdf-parse")).default;
          const data = await pdfParse(buffer);
          rawText = data.text.trim();
        } catch {
          rawText = "";
        }
        if (rawText.length >= 20) {
          try {
            text = await reflowText(rawText);
          } catch (err) {
            console.error(err);
            text = rawText;
          }
        }
      }
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value.trim();
    } else if (name.endsWith(".doc")) {
      return NextResponse.json(
        {
          error:
            "Old-style .doc files aren't supported yet — please save it as .docx or .pdf and try again.",
        },
        { status: 400 }
      );
    } else if (
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png")
    ) {
      const mediaType = name.endsWith(".png") ? "image/png" : "image/jpeg";
      try {
        text = await transcribeWithVision(buffer, mediaType);
      } catch (err) {
        if (err instanceof Error && err.message === "NO_API_KEY") {
          return NextResponse.json(
            {
              error:
                "Reading photos needs an ANTHROPIC_API_KEY set on this deployment.",
            },
            { status: 500 }
          );
        }
        console.error(err);
      }
    } else {
      return NextResponse.json(
        { error: "Please upload a .pdf, .docx, .jpg, or .png file." },
        { status: 400 }
      );
    }

    text = text.trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        {
          error:
            "Couldn't find readable text in that file. Try a clearer scan/photo, or paste the text directly instead.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          "Something went wrong reading that file. Try pasting the text directly instead.",
      },
      { status: 500 }
    );
  }
}
