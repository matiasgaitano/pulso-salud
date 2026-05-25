"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Consultation } from "@/types";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  params: Promise<{ id: string }>;
}

function SuccessContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    const init = async () => {
      setFetchLoading(true);
      try {
        // FIX: await PATCH before GET so the consultation is up-to-date
        if (paymentId) {
          await fetch(`/api/consultations/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "approved", paymentId, status: "paid" }),
          });
        }
        const res = await fetch(`/api/consultations/${id}`);
        const data: Consultation = await res.json();
        setConsultation(data);
      } catch (err) {
        console.error("Error loading consultation:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    init();
  }, [id, searchParams]);

  const joinCall = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId: id, isSpecialist: false }),
      });
      const data = await res.json();
      if (data.roomUrl) {
        router.push(`/consultation/${id}/video`);
      }
    } catch {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg
          className="h-10 w-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        ¡Pago confirmado!
      </h1>

      {consultation?.assignedSpecialist && (
        <p className="text-slate-500 text-sm mb-6">
          Tu consulta con <strong>{consultation.assignedSpecialist.name}</strong> está
          lista. Podés unirte a la videollamada ahora.
        </p>
      )}

      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={joinCall}
          loading={loading}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.361a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          Unirse a la videollamada
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/")}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner size="lg" /></div>}>
      <SuccessContent id={id} />
    </Suspense>
  );
}
