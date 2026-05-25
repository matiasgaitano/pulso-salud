"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import type { Message, ClinicalRecord } from "@/types";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { Button } from "@/components/ui/Button";

interface Props {
  consultationId: string;
  patientName: string;
}

export function TriageChat({ consultationId, patientName }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialized = useRef(false);
  // Keep a ref of messages so sendMessage always has the latest without stale closure
  const messagesRef = useRef<Message[]>([]);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Keep ref in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const streamResponse = useCallback(
    async (userContent: string, history: { role: "user" | "assistant"; content: string }[]) => {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId, message: userContent, history }),
      });

      // FIX: check res.ok before reading the stream
      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      const assistantMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "text") {
              fullText += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: fullText } : m
                )
              );
            }

            // FIX: replace_text event to strip the XML block from display
            if (parsed.type === "replace_text") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: parsed.text } : m
                )
              );
            }

            if (parsed.type === "clinical_record") {
              setClinicalRecord(parsed.data);
              setIsComplete(true);
              // FIX: fire-and-forget — don't await inside the stream loop
              // Use void to acknowledge intentional non-awaiting
              void fetch(`/api/consultations/${consultationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  clinicalRecord: parsed.data,
                  status: "pending_payment",
                }),
              }).catch((err) => console.error("Failed to persist clinical record:", err));
            }
          } catch {
            // non-JSON SSE line, skip
          }
        }
      }
    },
    [consultationId]
  );

  const sendMessage = useCallback(
    async (userContent: string) => {
      if (!userContent.trim() || isTyping) return;

      const userMsg: Message = {
        id: uuidv4(),
        role: "user",
        content: userContent.trim(),
        timestamp: new Date(),
      };

      // FIX: read from ref (not stale closure) to get up-to-date history
      const history = messagesRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        await streamResponse(userContent.trim(), history);
      } catch (err) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content: "Hubo un error al procesar tu consulta. Por favor, intentá de nuevo.",
            timestamp: new Date(),
          },
        ]);
        console.error(err);
      }
    },
    [isTyping, streamResponse]
  );

  // Send initial greeting
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const greet = async () => {
      setIsTyping(true);
      try {
        await streamResponse(
          `Hola, soy ${patientName} y quiero una segunda opinión médica.`,
          []
        );
      } catch {
        setIsTyping(false);
      }
    };

    greet();
  }, [consultationId, patientName, streamResponse]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (isComplete && clinicalRecord) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Triage completado</h2>
          <p className="mt-1 text-slate-500 text-sm">
            Armamos tu ficha clínica. Ahora elegí tu especialista.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => router.push(`/consultation/${consultationId}/specialist`)}
        >
          Ver especialistas recomendados
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-3">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu respuesta… (Enter para enviar)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pulso-500 focus:border-transparent transition-all"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 h-11 w-11 p-0 rounded-xl"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-400 text-center">
          Esta consulta es para obtener una segunda opinión. Ante una emergencia llamá al <strong>911</strong>.
        </p>
      </div>
    </div>
  );
}
