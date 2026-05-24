import type { ClinicalRecord } from "@/types";
import { UrgencyBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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
  record: ClinicalRecord;
}

export function ClinicalRecordView({ record }: Props) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Ficha clínica</h3>
        <UrgencyBadge urgency={record.urgency} />
      </div>

      <div className="space-y-4">
        <Section label="Motivo de consulta" content={record.chiefComplaint} />

        <ListSection label="Síntomas" items={record.symptoms} />

        <Section label="Duración" content={record.duration} />

        {record.medicalHistory.length > 0 && (
          <ListSection label="Antecedentes" items={record.medicalHistory} />
        )}

        {record.currentMedications.length > 0 && (
          <ListSection label="Medicación actual" items={record.currentMedications} />
        )}

        {record.allergies.length > 0 && (
          <ListSection label="Alergias" items={record.allergies} />
        )}

        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Especialidad recomendada
          </p>
          <p className="text-sm font-semibold text-pulso-700">
            {SPECIALTY_LABELS[record.recommendedSpecialty] ?? record.recommendedSpecialty}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Resumen para el especialista
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {record.triageSummary}
          </p>
        </div>
      </div>
    </Card>
  );
}

function Section({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm text-slate-800">{content}</p>
    </div>
  );
}

function ListSection({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-800">
            <span className="text-pulso-400 mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
