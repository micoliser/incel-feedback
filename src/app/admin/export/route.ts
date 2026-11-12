import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { feedbackToCsv } from "@/lib/csv";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const rows = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  const csv = feedbackToCsv(rows);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback-export-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
