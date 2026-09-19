import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { isValidEmail } from "@/lib/usage";
import { recordLead, recordInquiry } from "@/lib/leads";
import { sendNotification } from "@/lib/notify";
import { mentorById, mentorLabel } from "@/lib/mentors";

export const runtime = "nodejs";

// Three things arrive here:
//   role "seeker"  — waitlist signup
//   role "mentor"  — someone applying to mentor
//   role "inquiry" — a session request for a specific mentor
//
// An enquiry never reaches the mentor directly. It is stored, Fledgy is
// notified, and Arshkiran forwards it — which is the whole point of listing
// mentors without names or email addresses during the soft launch.
export async function POST(req: NextRequest) {
  try {
    const { email, role, name, expertise, mentorId, message } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }
    if (role !== "seeker" && role !== "mentor" && role !== "inquiry") {
      return NextResponse.json(
        { error: "Please choose whether you want mentoring or want to mentor." },
        { status: 400 }
      );
    }
    if (role === "mentor" && (!expertise || String(expertise).trim().length < 2)) {
      return NextResponse.json(
        { error: "Please tell us your field or area of expertise." },
        { status: 400 }
      );
    }

    const cleanName = name ? String(name).trim() : undefined;

    if (role === "inquiry") {
      const mentor = mentorById(String(mentorId || ""));
      if (!mentor || !mentor.published) {
        return NextResponse.json(
          { error: "That mentor isn't taking sessions right now." },
          { status: 400 }
        );
      }
      const text = message ? String(message).trim().slice(0, 2000) : "";
      if (text.length < 5) {
        return NextResponse.json(
          { error: "Tell us a line or two about what you need help with." },
          { status: 400 }
        );
      }

      const label = mentorLabel(mentor);
      const at = new Date().toISOString();

      await recordInquiry({
        email,
        mentorId: mentor.id,
        mentorLabel: label,
        message: text,
        name: cleanName,
        at,
      });
      await recordLead(email, { source: "mentors", role: "inquiry", name: cleanName });

      logFeedback({
        tool: "waitlist",
        hitTool: "mentor_inquiry",
        mentorId: mentor.id,
        email,
      });

      // Best-effort: the enquiry is already saved, so this is a convenience.
      await sendNotification(
        `Mentor enquiry — ${label}`,
        [
          `Mentor: ${label}`,
          `From: ${cleanName || "(no name given)"} <${email}>`,
          `Mentor's inbox: ${mentor.email || "(none set — forward manually)"}`,
          "",
          text,
          "",
          "Reply to the student yourself, or forward this on.",
        ].join("\n")
      );

      return NextResponse.json({ ok: true });
    }

    logFeedback({
      tool: "waitlist",
      hitTool: "mentors",
      role,
      name: cleanName,
      expertise: expertise ? String(expertise).trim() : undefined,
      email,
    });

    await recordLead(email, {
      source: "mentors",
      role,
      name: cleanName,
      expertise: expertise ? String(expertise).trim() : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
