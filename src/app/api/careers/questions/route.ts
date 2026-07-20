import { NextResponse } from "next/server";
import { PERSONALITY_ITEMS } from "@/lib/personalityItems";
import { publicQuestions } from "@/lib/aptitudeQuestions";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    personalityItems: PERSONALITY_ITEMS,
    aptitudeQuestions: publicQuestions(),
  });
}
