"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import type { Consultation, Specialist } from "@/types";
import { SpecialistCard } from "@/components/consultation/SpecialistCard";
import { ClinicalRecordView } from "@/components/consultation/ClinicalRecord";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SpecialistPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cRes, sRes] = await Promise.all([
        fetch(`/api/consultations/${id}`),
        fetch(`/api/specialists`),
      ]);
      const c: Consultation = await cRes.json();
      const all: Specialist[] = await sRes.json();

      setConsultation(c);

      if (c.clinicalRecord) {
        const recommended = c.clinicalRecord.recommendedSpecialty;
        const primary = all.filter((s) => s.specialty === recommended);
        // Always show at least 3 options — pad with medicina_general if needed
        const fallback = all.filter(
          (s) => s.specialty === "medicina_general" && !primary.includes(s)
        );
        const result = primary.length >= 2
          ? primary
          : [...primary, ...fallback].slice(0, 3);
        setSpecialists(result);
      } else {
        setSpecialists(all.slice(0, 3));
      }
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleSelect = async (specialist: Specialist) => {
    setLoadingId(specialist.id);
    try {
      const res = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId: id, specialistId: specialist.id }),
      });
      const data = await res.json();
      // In sandbox use sandboxInitPoint; in production use initPoint
      const url = data.sandboxInitPoint ?? data.initPoint;
      if (url) {
        window.location.href = url;
      } else {
        router.push(`/consultation/${id}/payment`);
      }
    } catch {
      setLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Especialistas recomendados
      </h1>
      <div className="flex items-center gap-2 mb-8">
        <p className="text-slate-500 text-sm">
          Basado en tu triage, el sistema recomendó:
        </p>
        {consultation?.clinicalRecord && (
          <span className="bg-pulso-100 text-pulso-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {consultation.clinicalRecord.recommendedSpecialty.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specialist list */}
        <div className="lg:col-span-2 space-y-4">
          {specialists.map((sp) => (
            <SpecialistCard
              key={sp.id}
              specialist={sp}
              consultationId={id}
              onSelect={handleSelect}
              isLoading={loadingId === sp.id}
            />
          ))}
        </div>

        {/* Clinical record sidebar */}
        {consultation?.clinicalRecord && (
          <div className="lg:col-span-1">
            <ClinicalRecordView record={consultation.clinicalRecord} />
          </div>
        )}
      </div>
    </div>
  );
}
