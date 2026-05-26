import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProfileByUserId } from "@/lib/profile";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Consultation } from "@/types";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  triage:           { label: "En triage",          color: "bg-slate-100 text-slate-600" },
  pending_payment:  { label: "Pendiente de pago",   color: "bg-amber-100 text-amber-700" },
  paid:             { label: "Pago confirmado",      color: "bg-blue-100 text-blue-700" },
  scheduled:        { label: "Turno confirmado",     color: "bg-pulso-100 text-pulso-700" },
  in_progress:      { label: "En curso",             color: "bg-green-100 text-green-700" },
  completed:        { label: "Completada",           color: "bg-slate-100 text-slate-500" },
  cancelled:        { label: "Cancelada",            color: "bg-red-100 text-red-600" },
};

const SPECIALTY_LABEL: Record<string, string> = {
  cardiologia: "Cardiología", neurologia: "Neurología", dermatologia: "Dermatología",
  traumatologia: "Traumatología", ginecologia: "Ginecología", pediatria: "Pediatría",
  gastroenterologia: "Gastroenterología", endocrinologia: "Endocrinología",
  psiquiatria: "Psiquiatría", medicina_general: "Medicina General",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const email = session.user.email!;
  const [consultations, profile] = await Promise.all([
    db.consultations.findByPatientEmail(email),
    getProfileByUserId(userId),
  ]);
  const profileComplete = !!(profile?.basicInfo?.age || profile?.activeConditions?.length);

  const active = consultations.filter((c) => !["completed", "cancelled"].includes(c.status));
  const past = consultations.filter((c) => ["completed", "cancelled"].includes(c.status));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hola, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Tu panel de salud</p>
        </div>
        <Link
          href="/triage"
          className="px-4 py-2.5 bg-pulso-600 text-white rounded-xl text-sm font-medium hover:bg-pulso-700 transition-colors"
        >
          + Nueva consulta
        </Link>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1 mb-6 bg-slate-50 p-1 rounded-xl w-fit">
        <Link href="/dashboard"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-slate-900 shadow-sm">
          Mis consultas
        </Link>
        <Link href="/dashboard/salud"
          className="px-4 py-2 text-sm font-medium rounded-lg text-slate-500 hover:text-slate-700 transition-colors">
          Mi Salud
        </Link>
      </div>

      {/* Onboarding banner */}
      {!profileComplete && (
        <div className="bg-pulso-50 border border-pulso-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-pulso-800">Completá tu perfil de salud</p>
            <p className="text-xs text-pulso-700 mt-0.5">Agiliza el triage y activa las recomendaciones preventivas personalizadas</p>
          </div>
          <Link href="/onboarding"
            className="flex-shrink-0 px-4 py-2 bg-pulso-600 text-white text-sm font-medium rounded-xl hover:bg-pulso-700 transition-colors">
            Completar
          </Link>
        </div>
      )}

      {consultations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-sm">Todavía no tenés consultas</p>
          <Link href="/triage" className="mt-4 inline-block text-pulso-600 text-sm font-medium hover:underline">
            Iniciá tu primera consulta
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Activas
              </h2>
              <div className="space-y-3">
                {active.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Historial
              </h2>
              <div className="space-y-3">
                {past.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ConsultationCard({ consultation: c }: { consultation: Consultation }) {
  const status = STATUS_LABEL[c.status] ?? { label: c.status, color: "bg-slate-100 text-slate-600" };
  const specialty = c.clinicalRecord?.recommendedSpecialty;
  const specialtyLabel = specialty ? (SPECIALTY_LABEL[specialty] ?? specialty) : null;

  return (
    <Link
      href={`/consultation/${c.id}/specialist`}
      className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-pulso-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {specialtyLabel && (
              <span className="text-sm font-semibold text-slate-900">{specialtyLabel}</span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
          {c.assignedSpecialist && (
            <p className="text-sm text-slate-500 mt-0.5">{c.assignedSpecialist.name}</p>
          )}
          {c.clinicalRecord?.chiefComplaint && (
            <p className="text-xs text-slate-400 mt-1 truncate">{c.clinicalRecord.chiefComplaint}</p>
          )}
        </div>
        <p className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
          {new Date(c.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
        </p>
      </div>
    </Link>
  );
}
