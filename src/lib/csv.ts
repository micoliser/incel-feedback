import type { Feedback } from "@prisma/client";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function feedbackToCsv(rows: Feedback[]): string {
  const headers = [
    "id",
    "createdAt",
    "fullName",
    "email",
    "services",
    "servicesOther",
    "experienceSeamless",
    "experienceComments",
    "staffRating",
    "bookAgain",
    "wouldRefer",
    "otherComments",
  ];

  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.createdAt.toISOString(),
        row.fullName,
        row.email,
        row.services.join("; "),
        row.servicesOther ?? "",
        row.experienceSeamless,
        row.experienceComments ?? "",
        row.staffRating,
        row.bookAgain,
        row.wouldRefer,
        row.otherComments ?? "",
      ]
        .map((cell) => escapeCsv(String(cell)))
        .join(","),
    );
  }

  return lines.join("\n");
}
