import type { Urgency } from "@/types";

interface Props {
  urgency: Urgency;
}

const map: Record<Urgency, { label: string; className: string }> = {
  low:       { label: "Baja urgencia",  className: "bg-green-100 text-green-800" },
  medium:    { label: "Urgencia media", className: "bg-amber-100 text-amber-800" },
  high:      { label: "Alta urgencia",  className: "bg-orange-100 text-orange-800" },
  emergency: { label: "EMERGENCIA",     className: "bg-red-100 text-red-800 font-bold animate-pulse" },
};

export function UrgencyBadge({ urgency }: Props) {
  const { label, className } = map[urgency];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${className}`}>
      {label}
    </span>
  );
}

interface GenericBadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, className = "" }: GenericBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
