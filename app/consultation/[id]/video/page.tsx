"use client";

import { useEffect, useState, use } from "react";
import type { Consultation } from "@/types";
import { VideoRoom } from "@/components/video/VideoRoom";
import { ClinicalRecordView } from "@/components/consultation/ClinicalRecord";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function VideoPage({ params }: Props) {
  const { id } = use(params);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [cRes, roomRes] = await Promise.all([
          fetch(`/api/consultations/${id}`),
          fetch("/api/daily/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consultationId: id, isSpecialist: false }),
          }),
        ]);

        const c: Consultation = await cRes.json();
        const roomData = await roomRes.json();

        setConsultation(c);
        setRoomUrl(roomData.roomUrl);
        setToken(roomData.token);
      } catch {
        setError("No se pudo iniciar la videollamada. Intentá de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !roomUrl) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-medium">{error ?? "Error inesperado"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">
          Videoconsulta en curso
        </h1>
        {consultation?.assignedSpecialist && (
          <p className="text-sm text-slate-500">
            Con <strong>{consultation.assignedSpecialist.name}</strong>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoRoom
            roomUrl={roomUrl}
            token={token ?? undefined}
            userName={consultation?.patientName ?? "Paciente"}
          />
        </div>

        {consultation?.clinicalRecord && (
          <div className="lg:col-span-1">
            <ClinicalRecordView record={consultation.clinicalRecord} />
          </div>
        )}
      </div>
    </div>
  );
}
