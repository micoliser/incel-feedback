import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="page-shell">
      <div className="container">
        <header className="page-header reveal" style={{ marginBottom: 20 }}>
          <Image
            src="/tourism-logo.png"
            alt="Incel Holidays and Tourism"
            width={382}
            height={159}
            className="page-header__logo"
            style={{ width: "min(180px, 58%)" }}
          />
        </header>
        <div className="reveal" style={{ animationDelay: "70ms" }}>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
