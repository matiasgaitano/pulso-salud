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

// Keyword-based safety net: overrides the model's specialty choice when it's clearly wrong.
// Haiku sometimes ignores prompt instructions — this catches obvious mismatches.
const SPECIALTY_KEYWORDS: { specialty: Specialty; keywords: string[] }[] = [
  {
    specialty: "traumatologia",
    keywords: [
      "rodilla", "menisco", "ligamento", "columna", "lumbar", "cervical",
      "fractura", "esguince", "tendinitis", "articulación", "cadera",
      "tobillo", "hombro", "codo", "muñeca", "operacion hueso", "cirugía ortopédica",
      "dolor muscular", "lesión deportiva", "hernia de disco", "escoliosis",
    ],
  },
  {
    specialty: "cardiologia",
    keywords: [
      "dolor de pecho", "presión alta", "hipertensión", "palpitaciones",
      "arritmia", "infarto", "angina", "colesterol", "insuficiencia cardíaca",
      "corazón", "taquicardia", "bradicardia",
    ],
  },
  {
    specialty: "neurologia",
    keywords: [
      "dolor de cabeza", "migraña", "jaqueca", "mareos", "vértigo",
      "convulsión", "epilepsia", "hormigueo", "entumecimiento", "temblor",
      "pérdida de memoria", "esclerosis", "parkinson", "neuropatía",
    ],
  },
  {
    specialty: "dermatologia",
    keywords: [
      "mancha en la piel", "lunar", "erupción", "picazón", "sarpullido",
      "acné", "psoriasis", "eczema", "dermatitis", "hongo en la piel",
      "caída de cabello", "alopecia", "urticaria",
    ],
  },
  {
    specialty: "gastroenterologia",
    keywords: [
      "dolor de estómago", "dolor abdominal", "diarrea", "constipación",
      "estreñimiento", "reflujo", "acidez", "colon", "intestino",
      "náuseas", "vómitos crónicos", "sangre en heces", "colitis",
      "celíaca", "crohn", "hígado", "vesícula",
    ],
  },
  {
    specialty: "ginecologia",
    keywords: [
      "menstruación", "regla", "período", "embarazo", "menopausia",
      "ovario", "útero", "vagina", "flujo", "dolor pélvico",
      "endometriosis", "quiste ovárico", "anticonceptivos",
    ],
  },
  {
    specialty: "endocrinologia",
    keywords: [
      "diabetes", "glucosa", "azúcar en sangre", "tiroides", "hipotiroidismo",
      "hipertiroidismo", "obesidad", "sobrepeso", "hormona", "insulina",
      "cansancio crónico", "fatiga crónica", "metabolismo",
    ],
  },
  {
    specialty: "psiquiatria",
    keywords: [
      "ansiedad", "depresión", "pánico", "ataque de pánico", "insomnio",
      "tristeza", "angustia", "fobia", "trastorno", "adicción",
      "no puedo dormir", "pensamientos negativos", "ganas de llorar",
    ],
  },
  {
    specialty: "pediatria",
    keywords: [
      "niño", "niña", "bebé", "hijo", "hija", "menor de edad",
      "tiene 1 año", "tiene 2 años", "tiene 3 años", "tiene 4 años",
      "tiene 5 años", "tiene 6 años", "tiene 7 años", "tiene 8 años",
      "tiene 9 años", "tiene 10 años", "tiene 11 años", "tiene 12 años",
      "tiene 13 años", "tiene 14 años", "tiene 15 años", "tiene 16 años",
      "mi hijo", "mi hija", "el nene", "la nena",
    ],
  },
  {
    specialty: "neurologia",
    keywords: ["dolor de cabeza fuerte", "cefalea"],
  },
];

function overrideSpecialtyByKeywords(
  record: ClinicalRecord,
  conversationText: string
): Specialty {
  const text = [
    record.chiefComplaint,
    ...record.symptoms,
    record.triageSummary,
    conversationText,
  ]
    .join(" ")
    .toLowerCase();

  // Score each specialty by how many keywords appear in the text
  const scores: Partial<Record<Specialty, number>> = {};
  for (const { specialty, keywords } of SPECIALTY_KEYWORDS) {
    const matches = keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
    if (matches > 0) scores[specialty] = (scores[specialty] ?? 0) + matches;
  }

  if (Object.keys(scores).length === 0) return record.recommendedSpecialty;

  // Return specialty with highest keyword score
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[0] as Specialty;
}

export function parseClinicalRecord(text: string, conversationText = ""): ClinicalRecord | null {
  const match = text.match(/<FICHA_CLINICA>([\s\S]*?)<\/FICHA_CLINICA>/);
  if (!match) return null;

  try {
    const raw = JSON.parse(match[1].trim());
    const base: ClinicalRecord = {
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
    return {
      ...base,
      recommendedSpecialty: overrideSpecialtyByKeywords(base, conversationText),
    };
  } catch {
    return null;
  }
}

export function stripFichaBlock(text: string): string {
  return text.replace(/<FICHA_CLINICA>[\s\S]*?<\/FICHA_CLINICA>/, "").trim();
}
