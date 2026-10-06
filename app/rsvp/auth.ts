import { createHash } from "node:crypto";

export const rsvpInboxCookieName = "mm_rsvp_inbox";

export function inboxToken(password: string) {
  return createHash("sha256").update(`mardy-mayumi-rsvp:${password}`).digest("hex");
}

export function getExpectedInboxToken() {
  const password = process.env.RSVP_INBOX_PASSWORD;
  return password ? inboxToken(password) : null;
}
