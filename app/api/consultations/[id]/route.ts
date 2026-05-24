import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const consultation = db.consultations.findById(id);

  if (!consultation) {
    return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
  }

  return NextResponse.json(consultation);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const updated = db.consultations.update(id, body);

  if (!updated) {
    return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
