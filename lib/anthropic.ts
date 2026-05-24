import Anthropic from "@anthropic-ai/sdk";
import type { ClinicalRecord, Specialty, Urgency } from "@/types";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const TRIAGE_SYSTEM_PROMPT = `Sos un asistente médico de triage de Pulso Salud, una plataforma argentina de segundas opiniones médicas.
Tu rol es recopilar información clínica del paciente de forma empática, clara y profesional, en español rioplatense.

FLUJO DE TRIAGE:
1. Saluda y preguntá el motivo de consulta principal
2. Investigá síntomas: onset, duración, intensidad (escala 1-10), factores que lo agravan o alivian
3. Antecedentes médicos relevantes (enfermedades crónicas, cirugías previas)
4. Medicación actual y alergias
5. Cuando tengas suficiente información (mínimo 4-5 intercambios), generá la ficha clínica

REGLAS:
- Hacé una pregunta por vez, no abrumes al paciente
- Usás lenguaje accesible, sin jerga médica excesiva
- Si el paciente describe síntomas de EMERGENCIA (dolor de pecho irradiado, dificultad respiratoria severa, pérdida de conciencia, ACV), indicá que llame al 911 inmediatamente
- No hacés diagnósticos. Solo orientás y derivás

ESPECIALIDADES DISPONIBLES: cardiologia, neurologia, dermatologia, traumatologia, ginecologia, pediatria, gastroenterologia, endocrinologia, psiquiatria, medicina_general

Cuando tengas suficiente información, finalizá con exactamente este bloque JSON (no agregues nada después):
<FICHA_CLINICA>
{
  "chiefComplaint": "descripción breve del motivo",
  "symptoms": ["síntoma 1", "síntoma 2"],
  "duration": "cuánto tiempo lleva con los síntomas",
  "medicalHistory": ["antecedente 1"],
  "currentMedications": ["medicamento 1"],
  "allergies": ["alergia 1"],
  "urgency": "low|medium|high|emergency",
  "recommendedSpecialty": "una de las especialidades listadas",
  "triageSummary": "resumen clínico en 2-3 oraciones para el especialista"
}
</FICHA_CLINICA>`;

export function parseClinicalRecord(text: string): ClinicalRecord | null {
  const match = text.match(/<FICHA_CLINICA>([\s\S]*?)<\/FICHA_CLINICA>/);
  if (!match) return null;

  try {
    const raw = JSON.parse(match[1].trim());
    return {
      chiefComplaint: raw.chiefComplaint ?? "",
      symptoms: raw.symptoms ?? [],
      duration: raw.duration ?? "",
      medicalHistory: raw.medicalHistory ?? [],
      currentMedications: raw.currentMedications ?? [],
      allergies: raw.allergies ?? [],
      urgency: (raw.urgency ?? "medium") as Urgency,
      recommendedSpecialty: (raw.recommendedSpecialty ?? "medicina_general") as Specialty,
      triageSummary: raw.triageSummary ?? "",
      generatedAt: new Date(),
    };
  } catch {
    return null;
  }
}

export function stripFichaBlock(text: string): string {
  return text.replace(/<FICHA_CLINICA>[\s\S]*?<\/FICHA_CLINICA>/, "").trim();
}
