import { redirect } from "next/navigation";

export default function MisspelledRsvpRedirect() {
  redirect("/rsvp");
}
