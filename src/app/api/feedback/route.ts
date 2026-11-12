import { NextResponse } from "next/server";
import { submitFeedback } from "@/app/actions/feedback";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await submitFeedback({ ok: false }, formData);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("POST /api/feedback failed:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "We could not save your feedback. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
