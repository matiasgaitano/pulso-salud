"use client";

import type { Specialist } from "@/types";
import { Button } from "@/components/ui/Button";

const SPECIALTY_LABELS: Record<string, string> = {
  cardiologia:       "Cardiología",
  neurologia:        "Neurología",
  dermatologia:      "Dermatología",
  traumatologia:     "Traumatología",
  ginecologia:       "Ginecología",
  pediatria:         "Pediatría",
  gastroenterologia: "Gastroenterología",
  endocrinologia:    "Endocrinología",
  psiquiatria:       "Psiquiatría",
  medicina_general:  "Medicina General",
};

interface Props {
  specialist: Specialist;
  consultationId: string;
  onSelect: (specialist: Specialist) => void;
  isLoading?: boolean;
}

export function SpecialistCard({
  specialist,
  onSelect,
  isLoading = false,
}: Props) {
  const initials = specialist.name
    .replace(/^Dr[a]?\.\s+/, "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:border-pulso-200 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-pulso-100 flex items-center justify-center text-pulso-700 font-semibold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-sm leading-tight">
            {specialist.name}
          </p>
          <p className="text-xs text-pulso-600 font-medium mt-0.5">
            {SPECIALTY_LABELS[specialist.specialty] ?? specialist.specialty}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {specialist.credentials}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-amber-400 text-sm">★</span>
          <span className="text-sm font-semibold text-slate-800">
            {specialist.rating.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400">
            ({specialist.reviewCount} reseñas)
          </span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-slate-600 leading-relaxed">{specialist.bio}</p>

      {/* Slots */}
      {specialist.availableSlots.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">
            Próximos turnos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {specialist.availableSlots.slice(0, 3).map((slot) => {
              const d = new Date(slot);
              return (
                <span
                  key={slot}
                  className="text-xs bg-pulso-50 text-pulso-700 px-2 py-1 rounded-lg"
                >
                  {d.toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
        <div>
          <p className="text-xs text-slate-500">Consulta</p>
          <p className="font-bold text-slate-900 text-base">
            ${specialist.priceARS.toLocaleString("es-AR")} ARS
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => onSelect(specialist)}
          loading={isLoading}
        >
          Elegir especialista
        </Button>
      </div>
    </div>
  );
}
