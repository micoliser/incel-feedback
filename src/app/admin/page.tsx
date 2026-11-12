import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/actions/admin";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const responses = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-shell">
      <div className="container container-wide">
        <div className="admin-toolbar reveal">
          <div>
            <h1>Feedback responses</h1>
            <p>
              {responses.length} response{responses.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="admin-actions">
            <Link href="/admin/export" className="btn-secondary">
              Export CSV
            </Link>
            <form action={logoutAdmin}>
              <button type="submit" className="btn-secondary">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="form-card empty-state reveal">
            <h2>No responses yet</h2>
            <p>
              When customers submit the satisfaction form, their answers will appear here.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap reveal" style={{ animationDelay: "60ms" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Submitted</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Services</th>
                  <th>Experience</th>
                  <th>Staff</th>
                  <th>Book again</th>
                  <th>Refer</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((row) => (
                  <tr key={row.id}>
                    <td className="tabular">
                      {row.createdAt.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                      {row.fullName}
                    </td>
                    <td>{row.email}</td>
                    <td>
                      {row.services.join(", ")}
                      {row.servicesOther ? ` (${row.servicesOther})` : ""}
                    </td>
                    <td>
                      <span className="rating-pill">{row.experienceSeamless}</span>
                      {row.experienceComments ? (
                        <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                          {row.experienceComments}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span className="rating-pill">{row.staffRating}</span>
                    </td>
                    <td>
                      <span className="rating-pill">{row.bookAgain}</span>
                    </td>
                    <td>
                      <span className="rating-pill">{row.wouldRefer}</span>
                    </td>
                    <td style={{ minWidth: 160 }}>{row.otherComments || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
