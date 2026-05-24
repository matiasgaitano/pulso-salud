import { NextRequest, NextResponse } from "next/server";
import { createConsultationPreference } from "@/lib/mercadopago";
import { db } from "@/lib/db";
import { getSpecialistById } from "@/lib/specialists";

export async function POST(req: NextRequest) {
  const { consultationId, specialistId } = await req.json();

  const consultation = db.consultations.findById(consultationId);
  if (!consultation) {
    return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
  }

  const specialist = getSpecialistById(specialistId);
  if (!specialist) {
    return NextResponse.json({ error: "Especialista no encontrado" }, { status: 404 });
  }

  // Persist selected specialist
  db.consultations.update(consultationId, {
    assignedSpecialist: specialist,
    status: "pending_payment",
  });

  const preference = await createConsultationPreference(
    consultationId,
    specialist,
    consultation.patientEmail
  );

  return NextResponse.json({
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point,
  });
}
