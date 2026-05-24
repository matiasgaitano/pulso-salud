"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DailyCall = any;

interface Props {
  roomUrl: string;
  token?: string;
  userName: string;
}

type DailyCallState = "loading" | "joining" | "joined" | "left" | "error";

export function VideoRoom({ roomUrl, token, userName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall>(null);
  const [state, setState] = useState<DailyCallState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);

  const leave = useCallback(async () => {
    if (callRef.current) {
      await callRef.current.leave();
      callRef.current.destroy();
      callRef.current = null;
    }
    setState("left");
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let call: DailyCall;

    const init = async () => {
      try {
        const DailyModule = await import("@daily-co/daily-js");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const DailyConstructor = (DailyModule as any).default ?? DailyModule;

        call = DailyConstructor.createFrame(containerRef.current!, {
          iframeStyle: {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "1rem",
          },
          showLeaveButton: false,
          showFullscreenButton: true,
        });

        callRef.current = call;

        call.on("joining-meeting", () => setState("joining"));
        call.on("joined-meeting", () => setState("joined"));
        call.on("left-meeting", () => setState("left"));
        call.on("error", (e: { errorMsg?: string }) => {
          setError(e?.errorMsg ?? "Error de videollamada");
          setState("error");
        });
        call.on("participant-joined", () => {
          setParticipantCount((n) => n + 1);
        });
        call.on("participant-left", () => {
          setParticipantCount((n) => Math.max(0, n - 1));
        });

        setState("joining");
        await call.join({
          url: roomUrl,
          token: token ?? undefined,
          userName,
        });
      } catch (err) {
        setError("No se pudo iniciar la videollamada.");
        setState("error");
        console.error(err);
      }
    };

    init();

    return () => {
      call?.destroy();
    };
  }, [roomUrl, token, userName]);

  if (state === "left") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64 bg-slate-50 rounded-2xl">
        <p className="text-slate-600 font-medium">Llamada finalizada</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Volver a entrar
        </Button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 bg-red-50 rounded-2xl">
        <p className="text-red-700 font-medium">Error en la videollamada</p>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Video container */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {(state === "loading" || state === "joining") && (
          <div className="absolute inset-0 bg-slate-900 rounded-2xl flex items-center justify-center gap-3">
            <Spinner size="md" />
            <span className="text-white text-sm">
              {state === "loading" ? "Cargando…" : "Conectando…"}
            </span>
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      {/* Controls */}
      {state === "joined" && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-600">
              {participantCount > 0
                ? `${participantCount + 1} participante${participantCount + 1 !== 1 ? "s" : ""}`
                : "Esperando al especialista…"}
            </span>
          </div>
          <Button variant="danger" size="sm" onClick={leave}>
            Finalizar llamada
          </Button>
        </div>
      )}
    </div>
  );
}
