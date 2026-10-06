"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, CheckSquare2, Clock3, MessageCircle, ShieldCheck, Square, Trash2, Users, X } from "lucide-react";
import type { RsvpResponse } from "../../lib/rsvp-store";
import { deleteResponses, type DeleteResponsesState } from "./actions";
import styles from "./responses.module.css";

const initialDeleteState: DeleteResponsesState = { status: "idle", message: "" };
const responseDate = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

export default function ResponseManager({ responses }: { responses: RsvpResponse[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);
  const [deleteState, deleteAction, deletePending] = useActionState(async (previousState: DeleteResponsesState, formData: FormData) => {
    const result = await deleteResponses(previousState, formData);
    if (passwordInput.current) passwordInput.current.value = "";
    if (result.status === "success") {
      setSelectedIds(new Set());
      setConfirmationOpen(false);
      router.refresh();
    } else {
      window.requestAnimationFrame(() => passwordInput.current?.focus());
    }
    return result;
  }, initialDeleteState);
  const validSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => responses.some((response) => response.id === id))),
    [responses, selectedIds],
  );
  const allSelected = responses.length > 0 && validSelectedIds.size === responses.length;
  const selectedResponses = useMemo(
    () => responses.filter((response) => validSelectedIds.has(response.id)),
    [responses, validSelectedIds],
  );

  useEffect(() => {
    if (!confirmationOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => passwordInput.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [confirmationOpen]);

  useEffect(() => {
    if (!confirmationOpen) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deletePending) setConfirmationOpen(false);
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [confirmationOpen, deletePending]);

  const toggleResponse = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(responses.map((response) => response.id)));
  };

  return <>
    <div className={styles.managerBar}>
      <button type="button" className={styles.selectAll} onClick={toggleAll} aria-pressed={allSelected}>
        {allSelected ? <CheckSquare2 size={17} /> : <Square size={17} />}
        <span>Select all</span>
      </button>
      <p aria-live="polite"><strong>{validSelectedIds.size}</strong> selected</p>
      <button type="button" className={styles.deleteButton} disabled={validSelectedIds.size === 0} onClick={() => setConfirmationOpen(true)}>
        <Trash2 size={15} /> Delete selected
      </button>
    </div>

    {deleteState.status === "success" && <div className={styles.successNotice} role="status"><Check size={15} />{deleteState.message}</div>}

    <div className={styles.responseList}>
      {responses.map((response) => {
        const selected = selectedIds.has(response.id);
        return <article className={`${styles.responseCard} ${selected ? styles.selectedCard : ""}`} key={response.id}>
          <label className={styles.cardSelector}>
            <input type="checkbox" checked={selected} onChange={() => toggleResponse(response.id)} aria-label={`Select ${response.full_name}`} />
            <span aria-hidden="true">{selected ? <Check size={14} /> : null}</span>
          </label>
          <div className={styles.responseTop}>
            <div><h3>{response.full_name}</h3><time dateTime={response.created_at}><Clock3 size={13} />{responseDate.format(new Date(response.created_at))}</time></div>
            <span className={response.attendance === "yes" ? styles.accepted : styles.declined}>{response.attendance === "yes" ? <Check size={13} /> : <X size={13} />}{response.attendance === "yes" ? "Attending" : "Declined"}</span>
          </div>
          {response.attendance === "yes" && <p className={styles.partySize}><Users size={15} />{response.guest_count} {response.guest_count === 1 ? "guest" : "guests"}</p>}
          {response.message && <blockquote><MessageCircle size={15} /><p>{response.message}</p></blockquote>}
        </article>;
      })}
    </div>

    {confirmationOpen && <div className={styles.modalBackdrop} role="presentation">
      <section className={styles.confirmationModal} role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
        <button type="button" className={styles.closeModal} onClick={() => setConfirmationOpen(false)} disabled={deletePending} aria-label="Close confirmation"><X size={18} /></button>
        <span className={styles.warningIcon}><AlertTriangle size={23} /></span>
        <p className={styles.modalKicker}>Protected action</p>
        <h3 id="delete-title">Delete {validSelectedIds.size} {validSelectedIds.size === 1 ? "response" : "responses"}?</h3>
        <p id="delete-description">This cannot be undone. Enter the private inbox password to confirm.</p>
        <div className={styles.selectedPreview}>{selectedResponses.slice(0, 3).map((response) => <span key={response.id}>{response.full_name}</span>)}{selectedResponses.length > 3 && <span>+{selectedResponses.length - 3} more</span>}</div>
        <form action={deleteAction} className={styles.deleteForm}>
          {[...validSelectedIds].map((id) => <input key={id} type="hidden" name="responseId" value={id} />)}
          <label htmlFor="delete-password">Inbox password</label>
          <div className={styles.passwordField}><ShieldCheck size={17} /><input ref={passwordInput} id="delete-password" name="password" type="password" autoComplete="current-password" required /></div>
          {deleteState.status === "error" && <p className={styles.deleteError} role="alert">{deleteState.message}</p>}
          <div className={styles.modalActions}>
            <button type="button" onClick={() => setConfirmationOpen(false)} disabled={deletePending}>Keep responses</button>
            <button type="submit" disabled={deletePending}>{deletePending ? "Deleting…" : <><Trash2 size={15} /> Confirm deletion</>}</button>
          </div>
        </form>
      </section>
    </div>}
  </>;
}
