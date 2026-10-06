"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { inboxToken, rsvpInboxCookieName } from "./auth";

export async function signIn(formData: FormData) {
  const configuredPassword = process.env.RSVP_INBOX_PASSWORD;
  const submittedPassword = String(formData.get("password") ?? "");

  if (!configuredPassword || !submittedPassword) redirect("/rsvp?error=invalid");

  const submitted = Buffer.from(inboxToken(submittedPassword));
  const expected = Buffer.from(inboxToken(configuredPassword));
  if (submitted.length !== expected.length || !timingSafeEqual(submitted, expected)) redirect("/rsvp?error=invalid");

  const cookieStore = await cookies();
  cookieStore.set(rsvpInboxCookieName, inboxToken(configuredPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 14,
    path: "/rsvp",
  });
  redirect("/rsvp");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(rsvpInboxCookieName);
  redirect("/rsvp");
}
