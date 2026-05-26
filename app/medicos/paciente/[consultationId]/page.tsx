import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProfileByEmail } from "@/lib/profile";
import { getSpecialistById } from "@/lib/specialists";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { HealthRecommendation } from "@/lib/profile";

const URGENCY_STYLE: Record<string, string> = {
  low:       "bg-green-50 text-green-700 border-green-200",
  medium:    "bg-amber-50 text-amber-700 border-amber-200",
  high:      "bg-red-50 text-red-700 border-red-200",
  emergency: "bg-red-600 text-white border-red-600",
};
const URGENCY_LABEL: Record<string, string> = {
  low: "Baja", medium: "Media", high: "Alta", emergency: "EMERGENCIA",
};
const SEX_LABEL: Record<string, string> = {
  male: "Masculino", female: "Femenino", other: "Otro",
};
const PRIORITY_STYLE = {
  high:   { dot: "bg-red-500",   badge: "bg-red-50 border-red-200 text-red-800",     label: "Alta prioridad" },
  medium: { dot: "bg-amber-400", badge: "bg-amber-50 border-amber-200 text-amber-800", label: "Seguimiento" },
  low:    { dot: "bg-green-500", badge: "bg-green-50 border-green-200 text-green-800", label: "Preventivo" },
};

interface Props {
  params: Promise<{ consultationId: string }>;
}

export default async function MedicoPacientePage({ params }: Props) {
  const { consultationId } = await params;

  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; specialistId?: string } | undefined;
  if (!user || user.role !== "doctor") redirect("/login");

  const specialist = user.specialistId ? getSpecialistById(user.specialistId) : null;
  if (!specialist) redirect("/login");

  const consultation = await db.consultations.findById(consultationId);
  if (!consultation) notFound();

  // Verify this consultation is assigned to this doctor
  if (consultation.assignedSpecialist?.id !== specialist.id) redirect("/medicos/dashboard");

  const profile = await getProfileByEmail(consultation.patientEmail);
  const recommendations = (profile?.recommendations ?? []).filter(
    (r: HealthRecommendation) => !r.dismissed
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <Link href="/medicos/dashboard" className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block">
            ← Volver al panel
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{consultation.patientName}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{consultation.patientEmail}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {consultation.dailyRoomUrl && (
            <a href={consultation.dailyRoomUrl} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2.5 bg-pulso-600 text-white rounded-xl text-sm font-medium hover:bg-pulso-700 transition-colors">
              Iniciar videollamada
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Clinical + consultation */}
        <div className="lg:col-span-2 space-y-4">

          {/* Triage clinical record */}
          {consultation.clinicalRecord && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700">Ficha del triage</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  URGENCY_STYLE[consultation.clinicalRecord.urgency] ?? URGENCY_STYLE.medium
                }`}>
                  Urgencia {URGENCY_LABEL[consultation.clinicalRecord.urgency] ?? consultation.clinicalRecord.urgency}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Motivo de consulta</p>
                  <p className="text-sm text-slate-800">{consultation.clinicalRecord.chiefComplaint}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Síntomas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {consultation.clinicalRecord.symptoms.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs rounded-lg border border-slate-200">{s}</span>
                    ))}
                  </div>
                </div>
                {consultation.clinicalRecord.duration && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Duración</p>
                    <p className="text-sm text-slate-800">{consultation.clinicalRecord.duration}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Resumen clínico</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3">
                    {consultation.clinicalRecord.triageSummary}
                  </p>
                </div>
                {consultation.clinicalRecord.medicalHistory?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Antecedentes mencionados</p>
                    <p className="text-sm text-slate-700">{consultation.clinicalRecord.medicalHistory.join(", ")}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-semibold text-slate-700">Recomendaciones del sistema</h2>
                <span className="text-xs bg-pulso-100 text-pulso-700 px-2 py-0.5 rounded-full font-medium">IA</span>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec: HealthRecommendation) => {
                  const style = PRIORITY_STYLE[rec.priority] ?? PRIORITY_STYLE.low;
                  return (
                    <div key={rec.id} className={`rounded-xl border p-3.5 ${style.badge}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-0.5">{style.label}</p>
                          <p className="text-sm font-semibold">{rec.title}</p>
                          <p className="text-sm opacity-80 leading-relaxed">{rec.description}</p>
                          {rec.reason && <p className="text-xs opacity-60 mt-1 italic">{rec.reason}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right column — Health profile */}
        <div className="space-y-4">

          {/* Basic info */}
          {profile?.basicInfo && Object.keys(profile.basicInfo).length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos del paciente</h2>
              <div className="space-y-1.5">
                {profile.basicInfo.age && <InfoRow label="Edad" value={`${profile.basicInfo.age} años`} />}
                {profile.basicInfo.biologicalSex && <InfoRow label="Sexo" value={SEX_LABEL[profile.basicInfo.biologicalSex] ?? ""} />}
                {profile.basicInfo.heightCm && <InfoRow label="Altura" value={`${profile.basicInfo.heightCm} cm`} />}
                {profile.basicInfo.weightKg && <InfoRow label="Peso" value={`${profile.basicInfo.weightKg} kg`} />}
                {profile.basicInfo.bloodType && <InfoRow label="Grupo" value={profile.basicInfo.bloodType} />}
              </div>
            </section>
          )}

          {/* Allergies — highlighted */}
          {profile?.allergies && profile.allergies.length > 0 && (
            <section className="bg-red-50 rounded-2xl border border-red-200 p-4">
              <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">🔴 Alergias</h2>
              <div className="flex flex-wrap gap-1.5">
                {profile.allergies.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white text-red-700 text-xs font-semibold rounded-lg border border-red-300">
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Medications */}
          {profile?.currentMedications && profile.currentMedications.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Medicación habitual</h2>
              <div className="space-y-1">
                {profile.currentMedications.map((m, i) => (
                  <p key={i} className="text-sm text-slate-700">• {m}</p>
                ))}
              </div>
            </section>
          )}

          {/* Active conditions */}
          {profile?.activeConditions && profile.activeConditions.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Condiciones activas</h2>
              <div className="space-y-1.5">
                {profile.activeConditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{c.name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Family history */}
          {profile?.familyHistory && profile.familyHistory.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Antecedentes familiares</h2>
              <div className="space-y-1">
                {profile.familyHistory.map((f, i) => (
                  <p key={i} className="text-sm text-slate-700">• {f.condition}</p>
                ))}
              </div>
            </section>
          )}

          {/* Health patterns */}
          {profile?.healthPatterns && profile.healthPatterns.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Patrones detectados</h2>
              <div className="space-y-1">
                {profile.healthPatterns.map((p, i) => (
                  <p key={i} className="text-sm text-slate-700">
                    ⟳ {p.area}
                    {p.count > 1 && <span className="text-slate-400"> ({p.count}x)</span>}
                  </p>
                ))}
              </div>
            </section>
          )}

          {!profile && (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-center">
              <p className="text-xs text-slate-400">El paciente no completó su perfil de salud todavía</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}
