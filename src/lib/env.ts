function flag(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === "") return fallback;
  return ["true", "1", "yes"].includes(value.toLowerCase());
}

export function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const user = process.env.DB_USER ?? "postgres";
  const password = process.env.DB_PASSWORD ?? "";
  const host = process.env.DB_HOST ?? "127.0.0.1";
  const port = process.env.DB_PORT ?? "5432";
  const name = process.env.DB_NAME ?? "incel_feedback_db";

  const auth = password
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
    : encodeURIComponent(user);

  // Prefer unix socket peer auth when host is empty (local peer / CapRover-style optional host)
  if (!process.env.DB_HOST) {
    return `postgresql://${auth}@/${name}?host=/var/run/postgresql`;
  }

  return `postgresql://${auth}@${host}:${port}/${name}`;
}

function domainFromEmail(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
}

export function getAppBaseUrl(): string {
  const raw =
    process.env.APP_BASE_URL?.trim() ||
    process.env.FRONTEND_BASE_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function getEmailConfig() {
  const fromAddress =
    process.env.DEFAULT_FROM_EMAIL?.trim() || "info@inceltourism.com";
  const senderName =
    process.env.EMAIL_SENDER_NAME?.trim() || "Incel Holidays and Tourism";
  // Google rejects EHLO from Docker hostnames (srv-captain--...). Use a real domain.
  const ehloDomain =
    process.env.EMAIL_EHLO_DOMAIN?.trim() ||
    domainFromEmail(fromAddress) ||
    "inceltourism.com";

  return {
    enabled: flag(process.env.EMAIL_ENABLED, true),
    debug: flag(process.env.EMAIL_DEBUG, false),
    host: process.env.EMAIL_HOST?.trim() || "smtp-relay.gmail.com",
    port: Number(process.env.EMAIL_PORT || "587"),
    useTls: flag(process.env.EMAIL_USE_TLS, true),
    user: process.env.EMAIL_HOST_USER?.trim() || "",
    password: process.env.EMAIL_HOST_PASSWORD || "",
    fromAddress,
    senderName,
    fromFormatted: `${senderName} <${fromAddress}>`,
    ehloDomain,
    appBaseUrl: getAppBaseUrl(),
    internalRecipients: (process.env.INTERNAL_NOTIFICATION_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
  };
}

export function getAdminConfig() {
  return {
    password: process.env.ADMIN_PASSWORD || "",
    sessionSecret:
      process.env.ADMIN_SESSION_SECRET ||
      process.env.ADMIN_PASSWORD ||
      "dev-insecure-secret",
  };
}
