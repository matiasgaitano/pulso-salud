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

CRITERIOS ESTRICTOS PARA ELEGIR ESPECIALIDAD:

traumatologia → TODO lo relacionado con huesos, articulaciones, músculos, tendones o ligamentos:
  rodilla, cadera, hombro, codo, muñeca, tobillo, columna, espalda baja, cuello, costillas
  menisco, ligamento, cartílago, fractura, esguince, luxación, tendinitis, bursitis
  hernia de disco, escoliosis, artrosis, artritis, osteoporosis, osteoartritis
  lesión deportiva, golpe, caída, contractura, tortícolis, dolor lumbar, ciática
  "me van a operar la rodilla/cadera/columna/hombro/tobillo" → siempre traumatologia
  rehabilitación post-quirúrgica por huesos o articulaciones → traumatologia

cardiologia → corazón y circulación:
  dolor de pecho, palpitaciones, presión alta, presión baja, arritmia, taquicardia
  insuficiencia cardíaca, soplo cardíaco, colesterol alto, triglicéridos, angina
  NO usar para dolores musculares ni articulares aunque sean en el pecho

neurologia → sistema nervioso:
  dolor de cabeza frecuente o muy intenso, migraña, jaqueca, cefalea
  mareos, vértigo, desmayos, convulsiones, epilepsia
  hormigueo, entumecimiento, pérdida de fuerza o sensibilidad en brazos o piernas
  temblores, pérdida de memoria, confusión, dificultad para hablar o tragar
  esclerosis múltiple, Parkinson, neuropatía

dermatologia → piel, cabello y uñas:
  manchas, lunares que cambian, erupciones, sarpullido, urticaria
  picazón generalizada, acné severo, psoriasis, eczema, dermatitis atópica
  caída de cabello, alopecia, hongos en piel o uñas, verrugas, herpes en la piel

ginecologia → salud reproductiva femenina:
  menstruación irregular, dolor menstrual fuerte, ausencia de período, flujo anormal
  dolor pélvico, embarazo, menopausia, síndrome de ovario poliquístico
  endometriosis, quistes ováricos, miomas, anticonceptivos, PAP, colposcopía

pediatria → pacientes menores de 18 años:
  cualquier síntoma en bebés, niños o adolescentes
  fiebre en menores, desarrollo infantil, vacunas, control de niño sano

gastroenterologia → sistema digestivo:
  dolor de estómago, dolor abdominal, diarrea crónica, constipación, estreñimiento
  reflujo, acidez, gastritis, úlceras, náuseas o vómitos frecuentes
  sangre en heces, colon irritable, enfermedad celíaca, Crohn, colitis
  problemas de hígado, vesícula, páncreas, hinchazón o distensión abdominal

endocrinologia → hormonas y metabolismo:
  diabetes, glucosa alta, insulina, tiroides (hipotiroidismo, hipertiroidismo, bocio)
  obesidad, dificultad para bajar de peso a pesar de dieta, síndrome metabólico
  cansancio crónico sin causa aparente, sofocos, sudoración nocturna, cambios de peso inexplicables

psiquiatria → salud mental:
  ansiedad, ataques de pánico, depresión, tristeza persistente, falta de motivación
  insomnio crónico (más de 1 mes), fobias, trastornos obsesivos, adicciones
  cambios de humor extremos, pensamientos intrusivos, angustia, autolesiones

medicina_general → SOLO cuando no encaja claramente en ninguna de las anteriores:
  fiebre sin foco claro, resfríos, gripe, chequeo preventivo general
  síntomas muy inespecíficos sin pista del sistema afectado

REGLA CRÍTICA: Nunca uses medicina_general si el problema es claramente musculoesquelético, cardíaco, neurológico, dermatológico, ginecológico, digestivo, endocrinológico o de salud mental. Siempre preferí la especialidad específica.

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
      // joints & bones
      "rodilla", "menisco", "ligamento", "ligamento cruzado", "cartílago",
      "columna", "lumbar", "cervical", "hernia de disco", "escoliosis",
      "fractura", "esguince", "luxación", "tendinitis", "bursitis",
      "articulación", "cadera", "tobillo", "hombro", "codo", "muñeca",
      "artrosis", "artritis", "osteoporosis", "prótesis de rodilla", "prótesis de cadera",
      // symptoms
      "dolor de espalda", "dolor lumbar", "dolor cervical", "ciática",
      "contractura", "tortícolis", "lesión deportiva", "dolor muscular crónico",
      // procedures
      "me van a operar", "cirugía en la rodilla", "cirugía de columna",
      "artroscopia", "reemplazo de cadera", "rehabilitación traumatológica",
    ],
  },
  {
    specialty: "cardiologia",
    keywords: [
      "dolor de pecho", "presión alta", "hipertensión", "palpitaciones",
      "arritmia", "infarto", "angina de pecho", "colesterol alto",
      "insuficiencia cardíaca", "taquicardia", "bradicardia",
      "fibrilación", "soplo cardíaco", "triglicéridos altos",
    ],
  },
  {
    specialty: "neurologia",
    keywords: [
      "migraña", "jaqueca", "cefalea", "dolor de cabeza fuerte",
      "mareos frecuentes", "vértigo", "convulsión", "epilepsia",
      "hormigueo en manos", "hormigueo en pies", "entumecimiento",
      "pérdida de fuerza", "temblor", "pérdida de memoria",
      "esclerosis múltiple", "parkinson", "neuropatía",
      "dificultad para hablar", "dificultad para caminar",
    ],
  },
  {
    specialty: "dermatologia",
    keywords: [
      "mancha en la piel", "lunar que cambia", "erupción cutánea",
      "sarpullido", "urticaria", "picazón en la piel",
      "acné severo", "psoriasis", "eczema", "dermatitis",
      "hongo en la piel", "hongo en las uñas", "caída de cabello",
      "alopecia", "verrugas", "herpes en la piel",
    ],
  },
  {
    specialty: "gastroenterologia",
    keywords: [
      "dolor de estómago", "dolor abdominal", "diarrea crónica",
      "constipación", "estreñimiento crónico", "reflujo gastroesofágico",
      "acidez estomacal", "gastritis", "úlcera gástrica",
      "náuseas frecuentes", "vómitos crónicos", "sangre en heces",
      "colon irritable", "enfermedad celíaca", "crohn", "colitis",
      "hígado", "vesícula biliar", "cálculos biliares", "páncreas",
      "hinchazón abdominal", "distensión abdominal",
    ],
  },
  {
    specialty: "ginecologia",
    keywords: [
      "menstruación irregular", "dolor menstrual", "ausencia de período",
      "flujo vaginal anormal", "dolor pélvico", "embarazo",
      "menopausia", "síndrome de ovario poliquístico", "ovario poliquístico",
      "endometriosis", "quiste ovárico", "mioma uterino",
      "anticonceptivos", "pap", "colposcopía", "útero", "ovario",
    ],
  },
  {
    specialty: "endocrinologia",
    keywords: [
      "diabetes", "glucosa alta", "azúcar en sangre alta", "insulina",
      "hipotiroidismo", "hipertiroidismo", "tiroides", "bocio",
      "obesidad mórbida", "no puedo bajar de peso", "síndrome metabólico",
      "resistencia a la insulina", "cansancio extremo sin causa",
      "fatiga crónica inexplicable", "sofocos", "sudoración nocturna",
    ],
  },
  {
    specialty: "psiquiatria",
    keywords: [
      "ansiedad crónica", "ataques de pánico", "depresión", "tristeza persistente",
      "insomnio crónico", "no puedo dormir hace meses",
      "fobia", "trastorno obsesivo", "adicción al alcohol", "adicción a drogas",
      "cambios de humor extremos", "pensamientos de hacerme daño",
      "angustia constante", "ganas de llorar sin motivo",
    ],
  },
  {
    specialty: "pediatria",
    keywords: [
      "mi hijo", "mi hija", "el nene", "la nena", "bebé", "recién nacido",
      "tiene 1 año", "tiene 2 años", "tiene 3 años", "tiene 4 años",
      "tiene 5 años", "tiene 6 años", "tiene 7 años", "tiene 8 años",
      "tiene 9 años", "tiene 10 años", "tiene 11 años", "tiene 12 años",
      "tiene 13 años", "tiene 14 años", "tiene 15 años", "tiene 16 años",
      "tiene 17 años", "menor de edad", "niño de", "niña de",
      "fiebre en el bebé", "desarrollo del niño", "vacuna infantil",
    ],
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
