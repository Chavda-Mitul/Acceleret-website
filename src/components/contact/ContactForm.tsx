"use client";

import Link from "next/link";
import { useActionState, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { submitWalkthrough, type ContactState } from "@/app/(site)/contact/actions";
import { validateLead, limits, type LeadErrors, type LeadField, type LeadValues } from "@/app/(site)/contact/validation";
import { site, whatsappHref } from "@/content/site";
import { Note } from "@/components/Note";

const initial: ContactState = { status: "idle", message: "", errors: {}, values: {} };

const fields: { name: LeadField; label: string; type: string; autoComplete: string; inputMode?: "tel" | "email" }[] = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "company", label: "Company", type: "text", autoComplete: "organization" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", inputMode: "tel" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email" },
];

const MESSAGE_LABEL = "What does your team currently manage on WhatsApp, Excel or by memory?";

/**
 * Contact form (brief §4 Contact). Checks fields as you go and on submit,
 * then the server action checks again and delivers. Works without JavaScript.
 */
export function ContactForm() {
  // A fresh form after a successful send, once the visitor navigates away and back (Activity).
  const [instance, setInstance] = useState(0);
  const sent = useRef(false);
  useLayoutEffect(
    () => () => {
      if (sent.current) {
        sent.current = false;
        setInstance((n) => n + 1);
      }
    },
    [],
  );
  return <Form key={instance} onSent={() => (sent.current = true)} />;
}

function Form({ onSent }: { onSent: () => void }) {
  const [state, action, pending] = useActionState(submitWalkthrough, initial);
  const [clientErrors, setClientErrors] = useState<LeadErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LeadField, boolean>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const wa = whatsappHref();

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  const onSentRef = useRef(onSent);
  useEffect(() => {
    onSentRef.current = onSent;
  });

  // A new server response replaces whatever the client last showed (derived during render).
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") setClientErrors(state.errors);
  }

  // After a server response (only then), move focus to what needs attention.
  useEffect(() => {
    if (state.status === "success") {
      onSentRef.current();
      return;
    }
    if (state.status !== "error") return;
    const first = Object.keys(state.errors)[0] as LeadField | undefined;
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    else summaryRef.current?.focus();
  }, [state]);

  const readValues = (): LeadValues => {
    const f = new FormData(formRef.current!);
    const get = (k: string) => String(f.get(k) ?? "");
    return {
      name: get("name"),
      company: get("company"),
      phone: get("phone"),
      email: get("email"),
      message: get("message"),
    };
  };

  const check = (field: LeadField) => {
    const errs = validateLead(readValues());
    setClientErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const onBlur = (field: LeadField) => {
    setTouched((t) => ({ ...t, [field]: true }));
    check(field);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const errs = validateLead(readValues());
    if (Object.keys(errs).length > 0) {
      e.preventDefault();
      setClientErrors(errs);
      setTouched({ name: true, company: true, phone: true, email: true, message: true });
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  };

  if (state.status === "success") {
    return (
      <div className="form-success" role="status" aria-live="polite">
        <svg className="form-success__art" viewBox="0 0 320 90" aria-hidden focusable={false}>
          <path d="M10 45 H150 Q170 45 170 25 V20" className="form-success__route" pathLength={1} />
          <path d="M170 45 H300" className="form-success__route form-success__route--2" pathLength={1} />
          <circle cx="10" cy="45" r="6" className="form-success__start" />
          <g className="form-success__node">
            <rect x="214" y="27" width="96" height="36" rx="11" />
            <circle cx="232" cy="45" r="4.5" />
            <text x="244" y="50">
              Acceleret
            </text>
          </g>
        </svg>
        <h2 className="t-h3">Thanks{state.name ? `, ${state.name}` : ""}. We&apos;ve got it.</h2>
        <p>Your request is with the team. We&apos;ll get back to you to set up the 30-minute walkthrough.</p>
        <p className="form-success__more">
          Want to add something? Email{" "}
          <a className="prose-link" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
          {wa ? (
            <>
              {" "}
              or{" "}
              <a className="prose-link" href={wa} target="_blank" rel="noopener noreferrer">
                message us on WhatsApp
              </a>
            </>
          ) : null}
          .
        </p>
      </div>
    );
  }

  const errorFor = (f: LeadField) => (touched[f] || state.status === "error" ? clientErrors[f] : undefined);
  const errorCount = Object.values(clientErrors).filter(Boolean).length;
  const v = state.values;

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={onSubmit}
      noValidate
      className="lead-form"
      aria-describedby="lead-form-note"
    >
      <div
        ref={summaryRef}
        tabIndex={-1}
        className="lead-form__summary"
        role="alert"
        data-show={state.status === "error" && (state.message || errorCount) ? "true" : "false"}
      >
        {state.status === "error"
          ? state.errors && Object.keys(state.errors).length
            ? "Some details need another look."
            : state.message
          : null}
      </div>

      <div className="lead-form__grid">
        {fields.map((f) => {
          const err = errorFor(f.name);
          return (
            <div key={f.name} className="field" data-invalid={err ? "true" : undefined}>
              <label htmlFor={`f-${f.name}`}>{f.label}</label>
              <input
                id={`f-${f.name}`}
                name={f.name}
                type={f.type}
                inputMode={f.inputMode}
                autoComplete={f.autoComplete}
                required
                maxLength={limits[f.name]}
                defaultValue={v[f.name] ?? ""}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? `e-${f.name}` : undefined}
                onBlur={() => onBlur(f.name)}
                onChange={() => (clientErrors[f.name] ? check(f.name) : undefined)}
              />
              <p id={`e-${f.name}`} className="field__error" aria-live="polite">
                {err}
              </p>
            </div>
          );
        })}
        <div className="field field--wide" data-invalid={errorFor("message") ? "true" : undefined}>
          <label htmlFor="f-message">{MESSAGE_LABEL}</label>
          <Note arrow="down-left" size="sm" className="field__note" as="span">
            a sentence or two is plenty
          </Note>
          <textarea
            id="f-message"
            name="message"
            rows={5}
            required
            maxLength={limits.message}
            defaultValue={v.message ?? ""}
            placeholder="Enquiries come in on three WhatsApp groups, quotes are in one person's Excel…"
            aria-invalid={errorFor("message") ? true : undefined}
            aria-describedby={errorFor("message") ? "e-message" : undefined}
            onBlur={() => onBlur("message")}
            onChange={() => (clientErrors.message ? check("message") : undefined)}
          />
          <p id="e-message" className="field__error" aria-live="polite">
            {errorFor("message")}
          </p>
        </div>
      </div>

      {/* Spam traps: hidden from people and assistive technology. */}
      <div className="lead-form__trap" aria-hidden="true">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        <input ref={startedRef} name="started" type="hidden" defaultValue="" />
      </div>

      <div className="lead-form__foot">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Sending…" : site.primaryCta.label}
          <span className="btn-node" aria-hidden />
        </button>
        <p id="lead-form-note" className="lead-form__note">
          We use these details only to reply about your walkthrough.{" "}
          <Link className="prose-link" href="/privacy">
            Privacy
          </Link>
        </p>
      </div>
    </form>
  );
}
