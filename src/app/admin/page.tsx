import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/actions/admin";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatSubmitted(date: Date) {
  const day = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return { day, time };
}

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
          <div className="admin-brand">
            <Image
              src="/tourism-logo.png"
              alt="Incel Holidays and Tourism"
              width={382}
              height={159}
              className="admin-brand__logo"
              priority
            />
            <div>
              <h1>Feedback responses</h1>
              <p>
                {responses.length} response{responses.length === 1 ? "" : "s"}
              </p>
            </div>
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
                  <th scope="col">Submitted</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Services</th>
                  <th scope="col">Experience</th>
                  <th scope="col">Staff</th>
                  <th scope="col">Book again</th>
                  <th scope="col">Refer</th>
                  <th scope="col">Comments</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((row) => {
                  const submitted = formatSubmitted(row.createdAt);
                  const services = [
                    ...row.services.filter((s) => s !== "Other"),
                    ...(row.servicesOther
                      ? [`Other: ${row.servicesOther}`]
                      : row.services.includes("Other")
                        ? ["Other"]
                        : []),
                  ];

                  return (
                    <tr key={row.id}>
                      <td className="admin-cell-datetime">
                        <span className="admin-date">{submitted.day}</span>
                        <span className="admin-time tabular">{submitted.time}</span>
                      </td>
                      <td className="admin-cell-name">{row.fullName}</td>
                      <td className="admin-cell-email">
                        <a href={`mailto:${row.email}`}>{row.email}</a>
                      </td>
                      <td>
                        <div className="admin-chip-list">
                          {services.map((service) => (
                            <span key={service} className="service-chip">
                              {service}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="admin-stack">
                          <span className="rating-pill">{row.experienceSeamless}</span>
                          {row.experienceComments ? (
                            <p className="admin-note">{row.experienceComments}</p>
                          ) : null}
                        </div>
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
                      <td className="admin-cell-comments">
                        {row.otherComments ? (
                          <p className="admin-note" title={row.otherComments}>
                            {row.otherComments}
                          </p>
                        ) : (
                          <span className="admin-empty">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
