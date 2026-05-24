import { NextRequest, NextResponse } from "next/server";
import { createRoom, createMeetingToken } from "@/lib/daily";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { consultationId, isSpecialist } = await req.json();

  if (!consultationId) {
    return NextResponse.json({ error: "consultationId requerido" }, { status: 400 });
  }

  const consultation = db.consultations.findById(consultationId);
  if (!consultation) {
    return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
  }

  let roomUrl = consultation.dailyRoomUrl;
  let roomName = consultation.dailyRoomName;

  // Create room only once
  if (!roomUrl) {
    const room = await createRoom(consultationId);
    roomUrl = room.url;
    roomName = room.name;
    db.consultations.update(consultationId, {
      dailyRoomUrl: roomUrl,
      dailyRoomName: roomName,
      status: "scheduled",
    });
  }

  const token = await createMeetingToken(roomName!, isSpecialist ?? false);

  return NextResponse.json({ roomUrl, token });
}
