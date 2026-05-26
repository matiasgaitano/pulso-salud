import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSpecialistById } from "@/lib/specialists";
import { redirect } from "next/navigation";
import type { Consultation } from "@/types";

export default async function MedicosDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; specialistId?: string } | undefined;
  if (!user || user.role !== "doctor") redirect("/login");

  const specialist = user.specialistId ? getSpecialistById(user.specialistId) : null;
  if (!specialist) redirect("/login");

  const all = await db.consultations.findAll();
  const mine = all.filter(
    (c) => c.assignedSpecialist?.id === specialist.id &&
    !["triage", "pending_payment", "cancelled"].includes(c.status)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayConsults = mine.filter((c) => {
    const d = new Date(c.createdAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const upcoming = mine.filter((c) => !["completed"].includes(c.status));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{specialist.name}</h1>
        <p className="text-pulso-600 text-sm font-medium mt-0.5 capitalize">
          {specialist.specialty.replace("_", " ")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Hoy", value: todayConsults.length },
          { label: "Pendientes", value: upcoming.length },
          { label: "Completadas", value: mine.filter((c) => c.status === "completed").length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-bold text-slateso-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Consultas asignadas
        </h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-400 text-sm">No tenés consultas pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((c) => <PatientCard key={c.id} consultation={c} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function PatientCard({ consultation: c }: { consultation: Consultation }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-sm">{c.patientName}</p>
          {c.clinicalRecord?.chiefComplaint && (
            <p className="text-sm text-slate-500 mt-0.5 truncate">
              {c.clinicalRecord.chiefComplaint}
            </p>
          )}
          {c.clinicalRecord?.triageSummary && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {c.clinicalRecord.triageSummary}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            c.status === "completed"
              ? "bg-slate-100 text-slate-500"
              : "bg-pulso-100 text-pulso-700"
          }`}>
            {c.status === "completed" ? "Completada" : "Pendiente"}
          </span>
          <p className="text-xs text-slate-400">
            {new Date(c.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
          </p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-50">
        <a
          href={`/medicos/paciente/${c.id}`}
          className="text-xs text-pulso-600 font-medium hover:underline"
        >
          Ver ficha completa y panel de salud →
        </a>
      </div>
    </div>
  );
}
