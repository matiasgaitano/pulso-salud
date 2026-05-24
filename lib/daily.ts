const DAILY_API_URL = process.env.DAILY_API_URL ?? "https://api.daily.co/v1";
const DAILY_API_KEY = process.env.DAILY_API_KEY ?? "";

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: number;
  config: Record<string, unknown>;
}

export async function createRoom(consultationId: string): Promise<DailyRoom> {
  const name = `pulso-${consultationId}`;
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // 2 horas

  const res = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name,
      properties: {
        exp,
        enable_screenshare: true,
        enable_chat: true,
        start_video_off: false,
        start_audio_off: false,
        max_participants: 2,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Daily.co error ${res.status}: ${err}`);
  }

  return res.json() as Promise<DailyRoom>;
}

export async function deleteRoom(roomName: string): Promise<void> {
  await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
  });
}

export async function createMeetingToken(
  roomName: string,
  isOwner: boolean
): Promise<string> {
  const res = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: isOwner,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
      },
    }),
  });

  if (!res.ok) throw new Error("No se pudo crear el token de Daily.co");
  const data = (await res.json()) as { token: string };
  return data.token;
}
