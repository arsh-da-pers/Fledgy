import { NextRequest, NextResponse } from "next/server";
import { getAllLeads } from "@/lib/leads";

export const runtime = "nodejs";

// Private leads export. Protected by the LEADS_ADMIN_KEY env var — if that
// isn't set, or the provided key doesn't match, we return 404 so the endpoint
// is invisible. Access with:
//   /api/leads?key=YOUR_SECRET            -> JSON
//   /api/leads?key=YOUR_SECRET&format=csv -> CSV download
export async function GET(req: NextRequest) {
  const adminKey = process.env.LEADS_ADMIN_KEY;
  const provided = req.nextUrl.searchParams.get("key");

  if (!adminKey || provided !== adminKey) {
    return new NextResponse("Not found", { status: 404 });
  }

  const emails = await getAllLeads();

  if (req.nextUrl.searchParams.get("format") === "csv") {
    const csv = ["email", ...emails].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="fledgy-leads.csv"',
      },
    });
  }

  return NextResponse.json({ count: emails.length, emails });
}
