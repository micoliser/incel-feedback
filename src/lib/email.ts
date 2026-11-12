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
        options.text.slice(0, 500) + (options.text.length > 500 ? "..." : ""),
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
    // Critical for Google SMTP from CapRover/Docker: EHLO must be a real domain
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
    "Thank you for sharing your feedback with Incel Holidays and Tourism.",
    "Your comments help us serve you better.",
    "",
    "We look forward to welcoming you again.",
    "",
    config.senderName,
  ].join("\n");

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #091e42; line-height: 1.6;">
      <p>Dear ${escapeHtml(feedback.fullName)},</p>
      <p>Thank you for sharing your feedback with <strong>Incel Holidays and Tourism</strong>. Your comments help us serve you better.</p>
      <p>We look forward to welcoming you again.</p>
      <p style="color: #0168a7; font-weight: 700;">${escapeHtml(config.senderName)}</p>
    </div>
  `;

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

  const services = feedback.services.includes("Other") && feedback.servicesOther
    ? [
        ...feedback.services.filter((s) => s !== "Other"),
        `Other: ${feedback.servicesOther}`,
      ]
    : feedback.services;

  const subject = `New customer feedback from ${feedback.fullName}`;
  const lines = [
    "A new customer satisfaction response was submitted.",
    "",
    `Name: ${feedback.fullName}`,
    `Email: ${feedback.email}`,
    `Services: ${services.join(", ")}`,
    `Experience seamless: ${feedback.experienceSeamless}`,
    `Experience comments: ${feedback.experienceComments || "—"}`,
    `Staff rating: ${feedback.staffRating}`,
    `Book again: ${feedback.bookAgain}`,
    `Would refer: ${feedback.wouldRefer}`,
    `Other comments: ${feedback.otherComments || "—"}`,
  ];

  const text = lines.join("\n");
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #091e42; line-height: 1.6;">
      <h2 style="color: #0d47a1; margin-bottom: 8px;">New customer feedback</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        ${[
          ["Name", feedback.fullName],
          ["Email", feedback.email],
          ["Services", services.join(", ")],
          ["Experience seamless", feedback.experienceSeamless],
          ["Experience comments", feedback.experienceComments || "—"],
          ["Staff rating", feedback.staffRating],
          ["Book again", feedback.bookAgain],
          ["Would refer", feedback.wouldRefer],
          ["Other comments", feedback.otherComments || "—"],
        ]
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f0f7ff; font-weight: 700; width: 40%;">${escapeHtml(label)}</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
    </div>
  `;

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
  // Sequential sends avoid Google rate-limiting two EHLO connections at once
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
