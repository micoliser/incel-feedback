import { z } from "zod";
import {
  EXPERIENCE_OPTIONS,
  LIKELIHOOD_OPTIONS,
  SERVICE_OPTIONS,
  STAFF_RATING_OPTIONS,
} from "./constants";

export const feedbackSchema = z
  .object({
    fullName: z
      .string({ error: "Please enter your full name" })
      .trim()
      .min(2, "Please enter your full name"),
    email: z
      .string({ error: "Please enter a valid email address" })
      .trim()
      .email("Please enter a valid email address"),
    services: z
      .array(z.enum(SERVICE_OPTIONS))
      .min(1, "Select at least one service"),
    servicesOther: z.string().trim().optional().or(z.literal("")),
    experienceSeamless: z.enum(EXPERIENCE_OPTIONS, {
      message: "Please rate the booking experience",
    }),
    experienceComments: z.string().trim().optional().or(z.literal("")),
    staffRating: z.enum(STAFF_RATING_OPTIONS, {
      message: "Please rate our staff",
    }),
    bookAgain: z.enum(LIKELIHOOD_OPTIONS, {
      message: "Please tell us if you would book again",
    }),
    wouldRefer: z.enum(LIKELIHOOD_OPTIONS, {
      message: "Please tell us if you would refer us",
    }),
    otherComments: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.services.includes("Other") && !data.servicesOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["servicesOther"],
        message: "Please specify the other service",
      });
    }
  });

export type FeedbackPayload = z.infer<typeof feedbackSchema>;
