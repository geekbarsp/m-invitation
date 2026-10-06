import { NextResponse } from "next/server";
import { createRsvpResponse } from "../../../lib/rsvp-store";

export const runtime = "nodejs";

function cleanSingleLine(value: unknown, maxLength: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return NextResponse.json({ error: "This request is not allowed." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const fullName = cleanSingleLine(body.name, 120);
    const attendance = body.attendance === "yes" || body.attendance === "no" ? body.attendance : null;
    const requestedGuests = Number.parseInt(String(body.guests ?? "1"), 10);
    const message = String(body.message ?? "").trim().slice(0, 1000);

    if (fullName.length < 2 || !attendance) {
      return NextResponse.json({ error: "Please enter your name and attendance choice." }, { status: 400 });
    }

    if (attendance === "yes" && (!Number.isSafeInteger(requestedGuests) || requestedGuests < 1 || requestedGuests > 2_147_483_647)) {
      return NextResponse.json({ error: "Please enter a valid number of guests." }, { status: 400 });
    }

    await createRsvpResponse({
      full_name: fullName,
      attendance,
      guest_count: attendance === "yes" ? requestedGuests : 0,
      message: message || null,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("RSVP submission failed:", error);
    return NextResponse.json(
      { error: "We couldn't save your reply right now. Please try again." },
      { status: 500 },
    );
  }
}
