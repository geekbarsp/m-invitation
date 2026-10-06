"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteRsvpResponses } from "../../lib/rsvp-store";
import { inboxToken, rsvpInboxCookieName } from "./auth";

export type DeleteResponsesState = {
  status: "idle" | "error" | "success";
  message: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function passwordsMatch(submittedPassword: string, configuredPassword: string) {
  const submitted = Buffer.from(inboxToken(submittedPassword));
  const expected = Buffer.from(inboxToken(configuredPassword));
  return submitted.length === expected.length && timingSafeEqual(submitted, expected);
}

export async function signIn(formData: FormData) {
  const configuredPassword = process.env.RSVP_INBOX_PASSWORD;
  const submittedPassword = String(formData.get("password") ?? "");

  if (!configuredPassword || !submittedPassword) redirect("/rsvp?error=invalid");

  if (!passwordsMatch(submittedPassword, configuredPassword)) redirect("/rsvp?error=invalid");

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

export async function deleteResponses(
  _previousState: DeleteResponsesState,
  formData: FormData,
): Promise<DeleteResponsesState> {
  const configuredPassword = process.env.RSVP_INBOX_PASSWORD;
  const submittedPassword = String(formData.get("password") ?? "");
  const responseIds = [...new Set(formData.getAll("responseId").map(String))]
    .filter((id) => uuidPattern.test(id))
    .slice(0, 500);
  const cookieStore = await cookies();
  if (!configuredPassword
    || cookieStore.get(rsvpInboxCookieName)?.value !== inboxToken(configuredPassword)) {
    return { status: "error", message: "Your private session expired. Sign in again before deleting." };
  }
  if (!submittedPassword || !passwordsMatch(submittedPassword, configuredPassword)) {
    return { status: "error", message: "The inbox password is incorrect." };
  }
  if (responseIds.length === 0) {
    return { status: "error", message: "Select at least one response to delete." };
  }

  try {
    const deletedCount = await deleteRsvpResponses(responseIds);
    if (deletedCount === 0) {
      return { status: "error", message: "Those responses were already removed or could not be found." };
    }
    revalidatePath("/rsvp");
    return {
      status: "success",
      message: `${deletedCount} ${deletedCount === 1 ? "response" : "responses"} deleted.`,
    };
  } catch {
    return { status: "error", message: "Deletion failed. Nothing was removed. Please try again." };
  }
}
