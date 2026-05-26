import { NextRequest } from "next/server";
import {
  anthropic,
  TRIAGE_SYSTEM_PROMPT,
  parseClinicalRecord,
  classifySpecialty,
  stripFichaBlock,
} from "@/lib/anthropic";
import { getProfileByEmail } from "@/lib/profile";
import { runMemoryAgent } from "@/lib/memory-agent";
import { db } from "@/lib/db";
import type { TriageRequest } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildProfileContext(profile: Awaited<ReturnType<typeof getProfileByEmail>>): string {
  if (!profile) return "";

  const parts: string[] = [];

  if (profile.basicInfo?.age) {
    parts.push(
      `Paciente de ${profile.basicInfo.age} años, ` +
      `${profile.basicInfo.biologicalSex === "male" ? "masculino" : profile.basicInfo.biologicalSex === "female" ? "femenino" : "otro"}.`
    );
  }
  if (profile.allergies?.length) {
    parts.push(`ALERGIAS CONOCIDAS: ${profile.allergies.join(", ")}. MUY IMPORTANTE: no recetes ni sugieras estos medicamentos.`);
  }
  if (profile.currentMedications?.length) {
    parts.push(`Medicación habitual: ${profile.currentMedications.join(", ")}.`);
  }
  if (profile.activeConditions?.length) {
    parts.push(`Condiciones activas: ${profile.activeConditions.map((c) => c.name).join(", ")}.`);
  }

  if (parts.length === 0) return "";

  return `\n\nCONTEXTO DEL PACIENTE (ya conocido, no preguntes de nuevo):
${parts.join(" ")}
Usá esta información para agilizar el triage y personalizarlo.`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TriageRequest;
  const { consultationId, message, history } = body;

  // Load patient profile for pre-fill (fire early, use below)
  const consultation = await db.consultations.findById(consultationId);
  const profilePromise = consultation?.patientEmail
    ? getProfileByEmail(consultation.patientEmail)
    : Promise.resolve(null);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const profile = await profilePromise;
        const profileContext = buildProfileContext(profile);
        const systemPrompt = TRIAGE_SYSTEM_PROMPT + profileContext;

        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            ...history.map((h) => ({
              role: h.role as "user" | "assistant",
              content: h.content,
            })),
            { role: "user", content: message },
          ],
          stream: true,
        });

        let fullText = "";

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            send({ type: "text", text: event.delta.text });
          }
        }

        // Check if triage is complete
        const conversationText = [...history.map((h) => h.content), message, fullText].join(" ");
        const clinicalRecord = parseClinicalRecord(fullText, conversationText);

        if (clinicalRecord) {
          const verifiedSpecialty = await classifySpecialty(clinicalRecord, conversationText);
          const finalRecord = { ...clinicalRecord, recommendedSpecialty: verifiedSpecialty };
          const cleanText = stripFichaBlock(fullText);
          send({ type: "replace_text", text: cleanText });
          send({ type: "clinical_record", data: finalRecord });

          // Fire memory agent in background — don't block the stream
          if (consultation?.patientEmail) {
            runMemoryAgent(consultation.patientEmail, finalRecord).catch(() => {});
          }
        }

        send({ type: "done" });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Error desconocido",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
