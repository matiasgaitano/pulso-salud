"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import type { Consultation } from "@/types";
import { TriageChat } from "@/components/chat/TriageChat";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/consultations/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: Consultation) => {
        setConsultation(data);
        setLoading(false);
      })
      .catch(() => {
        router.replace("/triage");
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!consultation) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">
          Triage médico
        </h1>
        <p className="text-sm text-slate-500">
          Hola, <strong>{consultation.patientName}</strong>. Respondé las
          preguntas del asistente para armar tu ficha clínica.
        </p>
      </div>

      <div
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}
      >
        <TriageChat
          consultationId={id}
          patientName={consultation.patientName}
        />
      </div>
    </div>
  );
}
