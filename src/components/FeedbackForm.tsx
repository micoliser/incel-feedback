"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  EXPERIENCE_OPTIONS,
  LIKELIHOOD_OPTIONS,
  SERVICE_OPTIONS,
  STAFF_RATING_OPTIONS,
} from "@/lib/constants";
import type { SubmitFeedbackState } from "@/app/actions/feedback";

function FieldError({
  id,
  errors,
  name,
}: {
  id: string;
  errors?: Record<string, string[]>;
  name: string;
}) {
  const message = errors?.[name]?.[0];
  if (!message) return null;
  return (
    <p className="field-error" id={id} role="alert">
      {message}
    </p>
  );
}

function hasError(errors: Record<string, string[]> | undefined, name: string) {
  return Boolean(errors?.[name]?.[0]);
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6.5 9.5 17 4 11.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeedbackForm() {
  const formId = useId();
  const alertRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SubmitFeedbackState>({ ok: false });
  const [pending, setPending] = useState(false);
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    if (state.message && !state.ok) {
      alertRef.current?.focus();
    }
  }, [state.message, state.ok]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({ ok: false });

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as SubmitFeedbackState;
      setState(result);
    } catch {
      setState({
        ok: false,
        message: "We could not save your feedback. Please try again shortly.",
      });
    } finally {
      setPending(false);
    }
  }

  if (state.ok) {
    return (
      <div className="form-card success-card" role="status" aria-live="polite">
        <div className="success-icon">
          <CheckIcon />
        </div>
        <h2>Thank you for your feedback</h2>
        <p>
          We appreciate you taking the time to share your experience. A confirmation
          email is on its way, and we look forward to serving you again.
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors;

  return (
    <form onSubmit={onSubmit} className="form-card" noValidate>
      {state.message ? (
        <div
          ref={alertRef}
          className="alert alert-error"
          role="alert"
          tabIndex={-1}
        >
          {state.message}
        </div>
      ) : null}

      <div className="form-section">
        <div className="field-grid field-grid-2">
          <div>
            <label className="field-label" htmlFor={`${formId}-fullName`}>
              Full name
            </label>
            <input
              id={`${formId}-fullName`}
              name="fullName"
              type="text"
              required
              autoComplete="name"
              className="input-text"
              placeholder="Your full name"
              aria-invalid={hasError(errors, "fullName")}
              aria-describedby={
                hasError(errors, "fullName") ? `${formId}-fullName-error` : undefined
              }
            />
            <FieldError id={`${formId}-fullName-error`} errors={errors} name="fullName" />
          </div>

          <div>
            <label className="field-label" htmlFor={`${formId}-email`}>
              Email address
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-text"
              placeholder="you@example.com"
              aria-invalid={hasError(errors, "email")}
              aria-describedby={
                hasError(errors, "email")
                  ? `${formId}-email-hint ${formId}-email-error`
                  : `${formId}-email-hint`
              }
            />
            <span
              className="field-hint"
              id={`${formId}-email-hint`}
              style={{ marginTop: 8, marginBottom: 0 }}
            >
              We will send a short thank-you confirmation to this address.
            </span>
            <FieldError id={`${formId}-email-error`} errors={errors} name="email" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
          <legend className="field-label">Type of service(s) rendered</legend>
          <div className="choice-grid choice-grid-2">
            {SERVICE_OPTIONS.map((service) => (
              <label key={service} className="choice-option">
                <input
                  type="checkbox"
                  name="services"
                  value={service}
                  checked={services.includes(service)}
                  onChange={(event) => {
                    setServices((prev) =>
                      event.target.checked
                        ? [...prev, service]
                        : prev.filter((item) => item !== service),
                    );
                  }}
                />
                <span>{service}</span>
              </label>
            ))}
          </div>
          <FieldError id={`${formId}-services-error`} errors={errors} name="services" />
        </fieldset>

        {services.includes("Other") ? (
          <div style={{ marginTop: 14 }}>
            <label className="field-label" htmlFor={`${formId}-servicesOther`}>
              Please specify
            </label>
            <input
              id={`${formId}-servicesOther`}
              name="servicesOther"
              type="text"
              className="input-text"
              placeholder="Other service"
              aria-invalid={hasError(errors, "servicesOther")}
              aria-describedby={
                hasError(errors, "servicesOther")
                  ? `${formId}-servicesOther-error`
                  : undefined
              }
            />
            <FieldError
              id={`${formId}-servicesOther-error`}
              errors={errors}
              name="servicesOther"
            />
          </div>
        ) : null}
      </div>

      <div className="form-section">
        <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
          <legend className="field-label">
            Was the booking process and overall experience seamless?
          </legend>
          <div className="choice-grid choice-grid-2">
            {EXPERIENCE_OPTIONS.map((option) => (
              <label key={option} className="choice-option">
                <input type="radio" name="experienceSeamless" value={option} required />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <FieldError
            id={`${formId}-experienceSeamless-error`}
            errors={errors}
            name="experienceSeamless"
          />
        </fieldset>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" htmlFor={`${formId}-experienceComments`}>
            Comments <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <textarea
            id={`${formId}-experienceComments`}
            name="experienceComments"
            className="input-textarea"
            placeholder="Anything we should know about the booking experience?"
          />
        </div>
      </div>

      <div className="form-section">
        <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
          <legend className="field-label">
            How would you rate the friendliness and professionalism of our staff?
          </legend>
          <div className="choice-grid choice-grid-2">
            {STAFF_RATING_OPTIONS.map((option) => (
              <label key={option} className="choice-option">
                <input type="radio" name="staffRating" value={option} required />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <FieldError
            id={`${formId}-staffRating-error`}
            errors={errors}
            name="staffRating"
          />
        </fieldset>
      </div>

      <div className="form-section">
        <div className="field-grid field-grid-2">
          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend className="field-label">Would you book with us again?</legend>
            <div className="choice-grid">
              {LIKELIHOOD_OPTIONS.map((option) => (
                <label key={option} className="choice-option">
                  <input type="radio" name="bookAgain" value={option} required />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <FieldError id={`${formId}-bookAgain-error`} errors={errors} name="bookAgain" />
          </fieldset>

          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend className="field-label">
              Would you refer our services to friends and family?
            </legend>
            <div className="choice-grid">
              {LIKELIHOOD_OPTIONS.map((option) => (
                <label key={option} className="choice-option">
                  <input type="radio" name="wouldRefer" value={option} required />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <FieldError id={`${formId}-wouldRefer-error`} errors={errors} name="wouldRefer" />
          </fieldset>
        </div>
      </div>

      <div className="form-section">
        <label className="field-label" htmlFor={`${formId}-otherComments`}>
          Other comments{" "}
          <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>(optional)</span>
        </label>
        <textarea
          id={`${formId}-otherComments`}
          name="otherComments"
          className="input-textarea"
          placeholder="Optional thoughts or suggestions"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={pending} style={{ width: "100%" }}>
          {pending ? "Submitting…" : "Submit feedback"}
        </button>
      </div>
    </form>
  );
}
