import { NextRequest } from "next/server";
import {
  anthropic,
  TRIAGE_SYSTEM_PROMPT,
  parseClinicalRecord,
  stripFichaBlock,
} from "@/lib/anthropic";
import type { TriageRequest } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TriageRequest;
  const { message, history } = body;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: TRIAGE_SYSTEM_PROMPT,
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
          // Strip the XML block from the last text sent
          const cleanText = stripFichaBlock(fullText);
          // Re-send cleaned text as a replace signal
          send({ type: "replace_text", text: cleanText });
          send({ type: "clinical_record", data: clinicalRecord });
        }

        send({ type: "done" });
      } catch (err) {
        send({
          type: "error",
          message:
            err instanceof Error ? err.message : "Error desconocido",
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
