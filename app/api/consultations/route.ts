import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import type { CreateConsultationInput, Consultation } from "@/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateConsultationInput;

  if (!body.patientName?.trim() || !body.patientEmail?.trim()) {
    return NextResponse.json(
      { error: "Nombre y email son requeridos" },
      { status: 400 }
    );
  }

  const consultation: Consultation = {
    id: uuidv4(),
    patientName: body.patientName.trim(),
    patientEmail: body.patientEmail.trim(),
    messages: [],
    status: "triage",
    paymentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.consultations.create(consultation);

  return NextResponse.json(consultation, { status: 201 });
}

export async function GET() {
  const all = db.consultations.findAll();
  return NextResponse.json(all);
}
