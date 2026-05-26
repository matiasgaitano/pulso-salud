import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/profile";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { HealthRecommendation } from "@/lib/profile";

const PRIORITY_STYLE = {
  high:   { dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200",   label: "Alta prioridad" },
  medium: { dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Seguimiento" },
  low:    { dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200", label: "Preventivo" },
};

const SEX_LABEL: Record<string, string> = { male: "Masculino", female: "Femenino", other: "Otro" };

export default async function SaludPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const profile = await getProfileByUserId(userId);
  const hasProfile = profile && (
    profile.basicInfo?.age ||
    profile.activeConditions?.length ||
    profile.allergies?.length
  );

  const recommendations = (profile?.recommendations ?? []).filter((r: HealthRecommendation) => !r.dismissed);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi Salud</h1>
          <p className="text-slate-500 text-sm mt-0.5">Tu panel de salud personalizado</p>
        </div>
        <Link href="/onboarding"
          className="text-sm text-pulso-600 font-medium hover:underline">
          {hasProfile ? "Editar perfil" : "Completar perfil"}
        </Link>
      </div>

      {!hasProfile && (
        <div className="bg-pulso-50 border border-pulso-200 rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-pulso-800 mb-1">Completá tu perfil de salud</p>
          <p className="text-sm text-pulso-700 mb-3">
            Con tus datos básicos y antecedentes, el sistema puede darte recomendaciones preventivas personalizadas y agilizar tu próximo triage.
          </p>
          <Link href="/onboarding"
            className="inline-block px-4 py-2 bg-pulso-600 text-white text-sm font-medium rounded-xl hover:bg-pulso-700 transition-colors">
            Completar ahora (3 min)
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {/* Basic info */}
        {profile?.basicInfo && Object.keys(profile.basicInfo).length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos básicos</h2>
            <div className="flex flex-wrap gap-4">
              {profile.basicInfo.age && <Chip label={`${profile.basicInfo.age} años`} />}
              {profile.basicInfo.biologicalSex && <Chip label={SEX_LABEL[profile.basicInfo.biologicalSex]} />}
              {profile.basicInfo.heightCm && <Chip label={`${profile.basicInfo.heightCm} cm`} />}
              {profile.basicInfo.weightKg && <Chip label={`${profile.basicInfo.weightKg} kg`} />}
              {profile.basicInfo.bloodType && <Chip label={`Grupo ${profile.basicInfo.bloodType}`} />}
            </div>
          </section>
        )}

        {/* Active conditions */}
        {profile?.activeConditions && profile.activeConditions.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Condiciones activas</h2>
            <div className="space-y-2">
              {profile.activeConditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{c.name}</span>
                  {c.since && <span className="text-xs text-slate-400">desde {c.since}</span>}
                  {c.source && <span className="text-xs text-slate-400">· {c.source}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Allergies + medications */}
        {((profile?.allergies?.length ?? 0) > 0 || (profile?.currentMedications?.length ?? 0) > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile?.allergies && profile.allergies.length > 0 && (
              <section className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">🔴 Alergias</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">
                      {a}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {profile?.currentMedications && profile.currentMedications.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Medicación habitual</h2>
                <div className="space-y-1">
                  {profile.currentMedications.map((m, i) => (
                    <p key={i} className="text-sm text-slate-700">• {m}</p>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Family history */}
        {profile?.familyHistory && profile.familyHistory.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Antecedentes familiares</h2>
            <div className="flex flex-wrap gap-2">
              {profile.familyHistory.map((f, i) => (
                <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-lg border border-amber-200">
                  {f.condition}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Health patterns */}
        {profile?.healthPatterns && profile.healthPatterns.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Patrones detectados</h2>
            <div className="space-y-2">
              {profile.healthPatterns.map((p, i) => (
                <p key={i} className="text-sm text-slate-700">
                  ⟳ <span className="font-medium">{p.area}</span>
                  {p.count > 1 && <span className="text-slate-500"> — {p.count} episodios</span>}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Recomendaciones del sistema
              </h2>
              <span className="text-xs bg-pulso-100 text-pulso-700 px-2 py-0.5 rounded-full font-medium">IA</span>
            </div>
            <div className="space-y-4">
              {recommendations.map((rec: HealthRecommendation) => {
                const style = PRIORITY_STYLE[rec.priority] ?? PRIORITY_STYLE.low;
                return (
                  <div key={rec.id} className={`rounded-xl border p-4 ${style.badge}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                            {style.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold mb-0.5">{rec.title}</p>
                        <p className="text-sm opacity-80 leading-relaxed">{rec.description}</p>
                        {rec.reason && (
                          <p className="text-xs opacity-60 mt-1 italic">{rec.reason}</p>
                        )}
                        {rec.specialty && (
                          <Link href="/triage"
                            className="inline-block mt-2 text-xs font-semibold underline underline-offset-2">
                            Iniciar consulta →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!hasProfile && recommendations.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            Completá tu perfil y hacé tu primera consulta para ver recomendaciones personalizadas
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="px-3 py-1.5 bg-slate-50 text-slate-700 text-sm rounded-xl border border-slate-200">
      {label}
    </span>
  );
}
