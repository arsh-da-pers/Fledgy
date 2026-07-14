import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    if (name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".doc")) {
      return NextResponse.json(
        {
          error:
            "Old-style .doc files aren't supported yet — please save it as .docx or .pdf and try again.",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Please upload a .pdf or .docx file." },
        { status: 400 }
      );
    }

    text = text.trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        {
          error:
            "Couldn't find readable text in that file (it may be a scanned image). Try pasting the text directly instead.",
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
