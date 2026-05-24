import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TriageChat } from "@/components/chat/TriageChat";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;
  const consultation = db.consultations.findById(id);

  if (!consultation) notFound();

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
