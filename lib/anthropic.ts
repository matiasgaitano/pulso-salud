import Anthropic from "@anthropic-ai/sdk";
import type { ClinicalRecord, Specialty, Urgency } from "@/types";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const TRIAGE_SYSTEM_PROMPT = `Sos un asistente médico de triage de Pulso Salud, una plataforma argentina de segundas opiniones médicas.
Tu rol es recopilar información clínica del paciente de forma empática, clara y profesional, en español rioplatense.

FLUJO DE TRIAGE:
1. Saludá y preguntá el motivo de consulta principal
2. Investigá síntomas: inicio, duración, intensidad (escala 1-10), factores que lo agravan o alivian
3. Antecedentes médicos relevantes (enfermedades crónicas, cirugías previas)
4. Medicación actual y alergias conocidas
5. Con 4-5 intercambios suficientes, generá la ficha clínica

REGLAS DE CONVERSACIÓN:
- Hacé UNA sola pregunta por turno
- Usá lenguaje accesible, sin jerga médica excesiva
- Si hay síntomas de EMERGENCIA (dolor de pecho irradiado al brazo, dificultad respiratoria severa, pérdida de conciencia, signos de ACV), indicá INMEDIATAMENTE que llame al 911
- No hacés diagnósticos. Solo orientás y derivás al especialista correcto

CRITERIOS PARA ELEGIR ESPECIALIDAD:
- cardiologia: dolor de pecho, palpitaciones, presión alta, arritmias, insuficiencia cardíaca, colesterol
- neurologia: dolores de cabeza frecuentes/intensos, mareos, convulsiones, hormigueos, pérdida de fuerza, problemas de memoria, temblores
- dermatologia: manchas, lunares, erupciones, picazón, caída de cabello, acné severo, psoriasis, hongos
- traumatologia: dolores articulares, musculares, fracturas, tendinitis, lesiones deportivas, columna, rodilla, hombro
- ginecologia: problemas menstruales, dolor pélvico, embarazo, menopausia, flujo vaginal, salud reproductiva
- pediatria: síntomas en menores de 18 años, fiebre en niños, desarrollo infantil, vacunas
- gastroenterologia: dolor abdominal, diarrea crónica, constipación, reflujo, náuseas, sangrado digestivo, colon irritable
- endocrinologia: diabetes, problemas de tiroides, obesidad, problemas hormonales, cansancio crónico inexplicable
- psiquiatria: ansiedad, depresión, insomnio crónico, ataques de pánico, trastornos del estado de ánimo, adicciones
- medicina_general: síntomas inespecíficos, chequeos generales, fiebre, resfríos, cuando no encaja en otra categoría

ESPECIALIDADES DISPONIBLES (escribilas EXACTAMENTE así, sin tildes):
cardiologia | neurologia | dermatologia | traumatologia | ginecologia | pediatria | gastroenterologia | endocrinologia | psiquiatria | medicina_general

Cuando tengas suficiente información, finalizá con EXACTAMENTE este bloque JSON (sin nada después):
<FICHA_CLINICA>
{
  "chiefComplaint": "descripción breve del motivo principal en 1 oración",
  "symptoms": ["síntoma 1", "síntoma 2", "síntoma 3"],
  "duration": "tiempo que lleva con los síntomas",
  "medicalHistory": ["antecedente 1"],
  "currentMedications": ["medicamento 1"],
  "allergies": ["alergia 1"],
  "urgency": "low|medium|high|emergency",
  "recommendedSpecialty": "una_de_las_especialidades_listadas",
  "triageSummary": "resumen clínico de 2-3 oraciones para el especialista, incluyendo síntomas clave y contexto relevante"
}
</FICHA_CLINICA>`;

// Normalize specialty value to handle accented or capitalized variants from the model
const SPECIALTY_ALIASES: Record<string, Specialty> = {
  cardiologia: "cardiologia",
  cardiología: "cardiologia",
  neurologia: "neurologia",
  neurología: "neurologia",
  dermatologia: "dermatologia",
  dermatología: "dermatologia",
  traumatologia: "traumatologia",
  traumatología: "traumatologia",
  ginecologia: "ginecologia",
  ginecología: "ginecologia",
  pediatria: "pediatria",
  pediatría: "pediatria",
  gastroenterologia: "gastroenterologia",
  gastroenterología: "gastroenterologia",
  endocrinologia: "endocrinologia",
  endocrinología: "endocrinologia",
  psiquiatria: "psiquiatria",
  psiquiatría: "psiquiatria",
  medicina_general: "medicina_general",
  "medicina general": "medicina_general",
  "médico general": "medicina_general",
  clínica: "medicina_general",
  clinica: "medicina_general",
};

function normalizeSpecialty(raw: string): Specialty {
  const normalized = raw.toLowerCase().trim();
  return SPECIALTY_ALIASES[normalized] ?? "medicina_general";
}

export function parseClinicalRecord(text: string): ClinicalRecord | null {
  const match = text.match(/<FICHA_CLINICA>([\s\S]*?)<\/FICHA_CLINICA>/);
  if (!match) return null;

  try {
    const raw = JSON.parse(match[1].trim());
    return {
      chiefComplaint: raw.chiefComplaint ?? "",
      symptoms: Array.isArray(raw.symptoms) ? raw.symptoms : [],
      duration: raw.duration ?? "",
      medicalHistory: Array.isArray(raw.medicalHistory) ? raw.medicalHistory : [],
      currentMedications: Array.isArray(raw.currentMedications) ? raw.currentMedications : [],
      allergies: Array.isArray(raw.allergies) ? raw.allergies : [],
      urgency: (raw.urgency ?? "medium") as Urgency,
      recommendedSpecialty: normalizeSpecialty(raw.recommendedSpecialty ?? ""),
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
