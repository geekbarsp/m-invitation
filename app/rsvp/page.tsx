import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CalendarDays, Check, Clock3, Database, Heart, LockKeyhole, LogOut, MailOpen, Users, X } from "lucide-react";
import { getRsvpResponses, type RsvpResponse } from "../../lib/rsvp-store";
import AutoRefresh from "./AutoRefresh";
import ResponseManager from "./ResponseManager";
import { signIn, signOut } from "./actions";
import { getExpectedInboxToken, rsvpInboxCookieName } from "./auth";
import styles from "./rsvp.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private RSVP Inbox | Mardy & Mayumi",
  description: "Private wedding RSVP response inbox for Mardy Morales and Mayumi Vergara.",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function RsvpInboxPage({ searchParams }: PageProps) {
  const [{ error }, cookieStore] = await Promise.all([searchParams, cookies()]);
  const expectedToken = getExpectedInboxToken();
  const configured = Boolean(expectedToken);
  const authenticated = configured && cookieStore.get(rsvpInboxCookieName)?.value === expectedToken;

  if (!configured) {
    return <InboxShell>
      <section className={styles.setupCard}>
        <span className={styles.iconCircle}><Database size={24} /></span>
        <p className={styles.kicker}>One last connection</p>
        <h1>Your private inbox is ready.</h1>
        <p>Add the RSVP inbox password to the website environment before opening this private dashboard.</p>
        <div className={styles.setupNote}><LockKeyhole size={16} /><span>No guest information is publicly visible.</span></div>
      </section>
    </InboxShell>;
  }

  if (!authenticated) {
    return <InboxShell>
      <section className={styles.loginCard}>
        <span className={styles.iconCircle}><LockKeyhole size={24} /></span>
        <p className={styles.kicker}>For the couple only</p>
        <h1>Open your RSVP inbox.</h1>
        <p>Enter the private password to view guest responses.</p>
        <form action={signIn} className={styles.loginForm}>
          <label htmlFor="password">Inbox password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={error === "invalid"} />
          {error === "invalid" && <p className={styles.formError} role="alert">That password is incorrect.</p>}
          <button type="submit">View responses <MailOpen size={17} /></button>
        </form>
      </section>
    </InboxShell>;
  }

  let responses: RsvpResponse[] = [];
  let loadError = false;
  try {
    responses = await getRsvpResponses();
  } catch {
    loadError = true;
  }

  const attending = responses.filter((response) => response.attendance === "yes");
  const declined = responses.length - attending.length;
  const totalGuests = attending.reduce((total, response) => total + response.guest_count, 0);

  return <main className={styles.dashboard}>
    <AutoRefresh />
    <header className={styles.dashboardHeader}>
      <div><span className={styles.monogram}>M<span>&amp;</span>M</span><p>Private wedding dashboard</p></div>
      <form action={signOut}><button className={styles.signOut} type="submit"><LogOut size={16} /><span>Sign out</span></button></form>
    </header>

    <section className={styles.heroPanel}>
      <div><p className={styles.kicker}>November 15, 2026</p><h1>RSVP <em>Inbox</em></h1><p>Every guest reply, collected in one private place.</p></div>
      <span className={styles.heartMark}><Heart size={27} /></span>
    </section>

    <section className={styles.metrics} aria-label="RSVP summary">
      <article><span><Users size={18} /></span><strong>{responses.length}</strong><p>Responses</p></article>
      <article><span><Check size={18} /></span><strong>{attending.length}</strong><p>Attending</p></article>
      <article><span><Heart size={18} /></span><strong>{totalGuests}</strong><p>Total guests</p></article>
      <article><span><X size={18} /></span><strong>{declined}</strong><p>Declined</p></article>
    </section>

    <section className={styles.responsesPanel}>
      <div className={styles.responsesHeading}><div><p className={styles.kicker}>Guest list</p><h2>Responses</h2></div><span className={styles.privateBadge}><LockKeyhole size={12} /> Private</span></div>

      {loadError ? <div className={styles.emptyState}>
        <span className={styles.emptyIcon}><Database size={28} /></span>
        <h3>Unable to load responses</h3>
        <p>Please check the Supabase URL and secret key in Vercel, then refresh this page.</p>
      </div> : responses.length === 0 ? <div className={styles.emptyState}>
        <span className={styles.emptyIcon}><MailOpen size={28} /></span>
        <h3>No responses yet</h3>
        <p>New replies from the invitation will appear here automatically.</p>
        <div className={styles.previewFields}><span><CalendarDays size={14} /> Attendance</span><span><Users size={14} /> Party size</span><span><Clock3 size={14} /> Submitted</span></div>
      </div> : <ResponseManager responses={responses} />}
    </section>
  </main>;
}

function InboxShell({ children }: { children: React.ReactNode }) {
  return <main className={styles.shell}>
    <div className={styles.shellTop}><span className={styles.monogram}>M<span>&amp;</span>M</span><small>Mardy &amp; Mayumi</small></div>
    {children}
    <p className={styles.shellFooter}>Private RSVP inbox · Abby&apos;s Event Center</p>
  </main>;
}
