import nodemailer from "nodemailer";
import { getEmailConfig } from "./env";
import type { FeedbackPayload } from "./validation";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function displayOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function formatServices(feedback: FeedbackPayload): string {
  if (feedback.services.includes("Other") && feedback.servicesOther?.trim()) {
    return [
      ...feedback.services.filter((s) => s !== "Other"),
      `Other: ${feedback.servicesOther.trim()}`,
    ].join(", ");
  }
  return feedback.services.join(", ");
}

function emailShell(options: {
  title: string;
  preheader: string;
  bodyHtml: string;
  footerNote: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#334e68;line-height:1.6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(options.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#0168a7 0%,#0d47a1 100%);padding:28px 28px 24px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:0.3px;">
                Incel Holidays and Tourism
              </p>
              <p style="margin:6px 0 0;color:#e0f2fe;font-size:13px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">
                Customer Satisfaction
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 28px;text-align:center;">
              <p style="margin:0;color:#627d98;font-size:12px;line-height:1.5;">
                ${options.footerNote}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRows(
  rows: Array<[string, string]>,
): string {
  return rows
    .map(
      ([label, value], index) => `
      <tr>
        <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;background:${index % 2 === 0 ? "#f0f7ff" : "#ffffff"};width:38%;color:#0d47a1;font-size:13px;font-weight:700;vertical-align:top;">
          ${escapeHtml(label)}
        </td>
        <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;background:${index % 2 === 0 ? "#fbfdff" : "#ffffff"};color:#091e42;font-size:13px;vertical-align:top;">
          ${escapeHtml(value)}
        </td>
      </tr>`,
    )
    .join("");
}

async function sendMail(options: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const config = getEmailConfig();
  const recipients = options.to.map((r) => r.trim()).filter(Boolean);

  if (!config.enabled) {
    console.info(
      `Email sending is disabled (EMAIL_ENABLED=False). Would have sent '${options.subject}' to ${recipients.join(", ")}`,
    );
    return false;
  }

  if (recipients.length === 0) {
    console.warn(`No recipients for email '${options.subject}'`);
    return false;
  }

  if (config.debug) {
    console.info(
      [
        "",
        "=".repeat(60),
        "[DEBUG EMAIL TRANSMISSION]",
        `From: ${config.fromFormatted}`,
        `To: ${recipients.join(", ")}`,
        options.replyTo ? `Reply-To: ${options.replyTo}` : null,
        `Subject: ${options.subject}`,
        "Body:",
        options.text,
        "=".repeat(60),
        "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.useTls && config.port !== 465,
    name: config.ehloDomain,
    auth:
      config.user || config.password
        ? { user: config.user, pass: config.password }
        : undefined,
  });

  try {
    await transporter.sendMail({
      from: config.fromFormatted,
      to: recipients.join(", "),
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    });
  } finally {
    transporter.close();
  }

  console.info(
    `Successfully sent email '${options.subject}' to ${recipients.join(", ")}`,
  );
  return true;
}

export async function sendCustomerThankYou(
  feedback: FeedbackPayload,
): Promise<void> {
  const config = getEmailConfig();
  const subject = "Thank you for your feedback — Incel Holidays and Tourism";

  const text = [
    `Dear ${feedback.fullName},`,
    "",
    "Thank you for taking the time to share your feedback with Incel Holidays and Tourism.",
    "",
    "Your comments help us improve our service and ensure every journey meets the standard our guests deserve. We are grateful that you chose to travel with us.",
    "",
    "Should you require any further assistance, please reply to this email and our team will be pleased to help.",
    "",
    "We look forward to welcoming you again.",
    "",
    "Yours sincerely,",
    config.senderName,
    config.fromAddress,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;color:#091e42;">
      Dear <strong>${escapeHtml(feedback.fullName)}</strong>,
    </p>
    <p style="margin:0 0 14px;font-size:15px;color:#334e68;">
      Thank you for taking the time to share your feedback with
      <strong>Incel Holidays and Tourism</strong>.
    </p>
    <p style="margin:0 0 14px;font-size:15px;color:#334e68;">
      Your comments help us improve our service and ensure every journey meets the
      standard our guests deserve. We are grateful that you chose to travel with us.
    </p>
    <p style="margin:0 0 22px;font-size:15px;color:#334e68;">
      Should you require any further assistance, please reply to this email and our
      team will be pleased to help.
    </p>
    <p style="margin:0 0 4px;font-size:15px;color:#334e68;">
      We look forward to welcoming you again.
    </p>
    <p style="margin:22px 0 0;font-size:15px;color:#091e42;">
      Yours sincerely,<br />
      <strong style="color:#0d47a1;">${escapeHtml(config.senderName)}</strong><br />
      <a href="mailto:${escapeHtml(config.fromAddress)}" style="color:#0168a7;text-decoration:none;">${escapeHtml(config.fromAddress)}</a>
    </p>
  `;

  const html = emailShell({
    title: subject,
    preheader:
      "Thank you for sharing your feedback with Incel Holidays and Tourism.",
    bodyHtml,
    footerNote: `This message was sent by ${escapeHtml(config.senderName)}. Please do not share sensitive information by email unless necessary.`,
  });

  await sendMail({
    to: [feedback.email],
    subject,
    text,
    html,
    replyTo: config.fromAddress,
  });
}

export async function sendInternalNotification(
  feedback: FeedbackPayload,
): Promise<void> {
  const config = getEmailConfig();
  const recipients =
    config.internalRecipients.length > 0
      ? config.internalRecipients
      : [config.fromAddress];

  const services = formatServices(feedback);
  const adminUrl = `${config.appBaseUrl}/admin`;
  const subject = `New customer feedback — ${feedback.fullName}`;

  const rows: Array<[string, string]> = [
    ["Full name", feedback.fullName],
    ["Email", feedback.email],
    ["Services rendered", services],
    ["Experience seamless", feedback.experienceSeamless],
    ["Experience comments", displayOrDash(feedback.experienceComments)],
    ["Staff rating", feedback.staffRating],
    ["Would book again", feedback.bookAgain],
    ["Would refer us", feedback.wouldRefer],
    ["Other comments", displayOrDash(feedback.otherComments)],
  ];

  const text = [
    "Dear Team,",
    "",
    "A new customer satisfaction response has been submitted and is ready for review.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "View all feedback in the admin portal:",
    adminUrl,
    "",
    "Sign in with the shared admin password. If you do not have the password, please contact the IT team.",
    "",
    "If the button in the HTML version of this email does not work, copy and paste the link above into your browser.",
    "",
    config.senderName,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:18px;font-weight:800;color:#091e42;">
      New customer feedback received
    </p>
    <p style="margin:0 0 22px;font-size:14px;color:#486581;">
      A guest has submitted a customer satisfaction form. A summary appears below.
      Please review the full record in the admin portal.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 24px;">
      ${detailRows(rows)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
      <tr>
        <td align="center">
          <a href="${escapeHtml(adminUrl)}"
             style="display:inline-block;background:linear-gradient(135deg,#0168a7 0%,#0d47a1 100%);color:#ffffff !important;font-weight:700;font-size:14px;padding:13px 26px;border-radius:8px;text-decoration:none;">
            View feedback in admin
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 10px;font-size:13px;color:#486581;text-align:center;">
      Sign in with the shared admin password. If you do not have the password,
      please contact the IT team.
    </p>

    <div style="margin:18px 0 0;padding:14px 16px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#0d47a1;text-transform:uppercase;letter-spacing:0.4px;">
        Link (copy and paste if the button does not work)
      </p>
      <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;">
        <a href="${escapeHtml(adminUrl)}" style="color:#0168a7;text-decoration:underline;">${escapeHtml(adminUrl)}</a>
      </p>
    </div>

    <p style="margin:22px 0 0;font-size:13px;color:#627d98;">
      You may reply directly to this email to contact the guest at
      <a href="mailto:${escapeHtml(feedback.email)}" style="color:#0168a7;text-decoration:none;">${escapeHtml(feedback.email)}</a>.
    </p>
  `;

  const html = emailShell({
    title: subject,
    preheader: `New feedback from ${feedback.fullName} is ready for review.`,
    bodyHtml,
    footerNote: `Internal notification from ${escapeHtml(config.senderName)}. For access issues, contact the IT team.`,
  });

  await sendMail({
    to: recipients,
    subject,
    text,
    html,
    replyTo: feedback.email,
  });
}

export async function sendFeedbackEmails(
  feedback: FeedbackPayload,
): Promise<void> {
  try {
    await sendCustomerThankYou(feedback);
  } catch (error) {
    console.error("Failed to send customer feedback email:", error);
  }

  try {
    await sendInternalNotification(feedback);
  } catch (error) {
    console.error("Failed to send internal feedback email:", error);
  }
}
