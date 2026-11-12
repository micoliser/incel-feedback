"use server";

import { prisma } from "@/lib/db";
import { sendFeedbackEmails } from "@/lib/email";
import { feedbackSchema } from "@/lib/validation";

export type SubmitFeedbackState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitFeedback(
  _prev: SubmitFeedbackState,
  formData: FormData,
): Promise<SubmitFeedbackState> {
  const services = formData.getAll("services").map(String);

  const parsed = feedbackSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    services,
    servicesOther: String(formData.get("servicesOther") ?? ""),
    experienceSeamless: String(formData.get("experienceSeamless") ?? ""),
    experienceComments: String(formData.get("experienceComments") ?? ""),
    staffRating: String(formData.get("staffRating") ?? ""),
    bookAgain: String(formData.get("bookAgain") ?? ""),
    wouldRefer: String(formData.get("wouldRefer") ?? ""),
    otherComments: String(formData.get("otherComments") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  try {
    await prisma.feedback.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        services: data.services,
        servicesOther: data.services.includes("Other")
          ? data.servicesOther || null
          : null,
        experienceSeamless: data.experienceSeamless,
        experienceComments: data.experienceComments || null,
        staffRating: data.staffRating,
        bookAgain: data.bookAgain,
        wouldRefer: data.wouldRefer,
        otherComments: data.otherComments || null,
      },
    });
  } catch (error) {
    console.error("Failed to save feedback:", error);
    return {
      ok: false,
      message: "We could not save your feedback. Please try again shortly.",
    };
  }

  try {
    await sendFeedbackEmails(data);
  } catch (error) {
    console.error("Feedback saved but email dispatch failed:", error);
  }

  return { ok: true };
}
