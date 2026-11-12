"use server";

import { redirect } from "next/navigation";
import { clearAdminSessionCookie } from "@/lib/auth";

export async function logoutAdmin(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
