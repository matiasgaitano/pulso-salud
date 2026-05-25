import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ConsultationStatus, PaymentStatus, ClinicalRecord, Specialist } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

// Fields a client is allowed to PATCH — prevents mass-assignment attacks
interface AllowedPatch {
  status?: ConsultationStatus;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  clinicalRecord?: ClinicalRecord;
  assignedSpecialist?: Specialist;
  dailyRoomUrl?: string;
  dailyRoomName?: string;
}

const ALLOWED_PATCH_KEYS: (keyof AllowedPatch)[] = [
  "status",
  "paymentStatus",
  "paymentId",
  "clinicalRecord",
  "assignedSpecialist",
  "dailyRoomUrl",
  "dailyRoomName",
];

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const consultation = await db.consultations.findById(id);

  if (!consultation) {
    return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
  }

  return NextResponse.json(consultation);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Only allow whitelisted fields
  const patch: AllowedPatch = {};
  for (const key of ALLOWED_PATCH_KEYS) {
    if (key in body) {
      (patch as Record<string, unknown>)[key] = body[key];
    }
  }

  const updated = await db.consultations.update(id, patch);

  if (!updated) {
    return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
