"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import type { Consultation } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch(`/api/consultations/${id}`)
      .then((r) => r.json())
      .then((c: Consultation) => {
        setConsultation(c);
        setIsLoading(false);
      });
  }, [id]);

  const handlePay = async () => {
    if (!consultation?.assignedSpecialist) return;
    setPaying(true);
    const res = await fetch("/api/mercadopago/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultationId: id,
        specialistId: consultation.assignedSpecialist.id,
      }),
    });
    const data = await res.json();
    const url = data.sandboxInitPoint ?? data.initPoint;
    if (url) window.location.href = url;
    else setPaying(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!consultation?.assignedSpecialist) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 mb-4">No hay especialista asignado.</p>
        <Button onClick={() => router.push(`/consultation/${id}/specialist`)}>
          Elegir especialista
        </Button>
      </div>
    );
  }

  const sp = consultation.assignedSpecialist;

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
        Confirmá tu consulta
      </h1>

      <Card className="mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-14 w-14 rounded-full bg-pulso-100 flex items-center justify-center text-pulso-700 font-bold text-lg">
            {sp.name.replace(/^Dr[a]?\.\s+/, "").split(" ").slice(0, 2).map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{sp.name}</p>
            <p className="text-sm text-pulso-600">{sp.credentials}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Consulta por videollamada</span>
            <span className="font-medium text-slate-800">
              ${sp.priceARS.toLocaleString("es-AR")} ARS
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Paciente</span>
            <span className="font-medium text-slate-800">
              {consultation.patientName}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-lg">${sp.priceARS.toLocaleString("es-AR")} ARS</span>
        </div>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handlePay}
        loading={paying}
      >
        Pagar con MercadoPago
      </Button>

      <p className="text-xs text-slate-400 text-center mt-3">
        Procesado de forma segura por MercadoPago. No guardamos datos de tarjeta.
      </p>
    </div>
  );
}
