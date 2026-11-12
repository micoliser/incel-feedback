"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(undefined);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!result.ok) {
        setMessage(result.message || "Incorrect password. Please try again.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setMessage("Could not sign in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="form-card"
      style={{ maxWidth: 440, margin: "0 auto", padding: "28px 28px 24px" }}
    >
      <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.65rem" }}>Admin login</h1>
      <p style={{ marginTop: 0, marginBottom: 22, color: "var(--text-secondary)" }}>
        Enter the shared staff password to view responses and export CSV.
      </p>

      {message ? (
        <div className="alert alert-error" role="alert">
          {message}
        </div>
      ) : null}

      <label className="field-label" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="input-text"
        placeholder="Admin password"
        aria-invalid={Boolean(message)}
      />

      <button
        type="submit"
        className="btn-primary"
        disabled={pending}
        style={{ width: "100%", marginTop: 18 }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
