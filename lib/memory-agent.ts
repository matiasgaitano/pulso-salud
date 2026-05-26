import { anthropic } from "@/lib/anthropic";
import { getProfileByEmail, upsertProfile } from "@/lib/profile";
import { db } from "@/lib/db";
import type { ClinicalRecord } from "@/types";
import { v4 as uuidv4 } from "uuid";

const MEMORY_AGENT_PROMPT = `Sos el agente de salud de Pulso Salud. Tu tarea es analizar el contexto completo de un paciente y:
1. Actualizar su perfil de salud con la información de la nueva consulta
2. Detectar patrones y tendencias en su historial
3. Generar recomendaciones preventivas personalizadas y específicas

REGLAS:
- Usá toda la información disponible: datos básicos, antecedentes, historial de consultas, antecedentes familiares
- Las recomendaciones deben ser CONCRETAS y ACCIONABLES, no genéricas
- Priorizá la prevención sobre la cura
- Si hay antecedentes familiares relevantes, úsalos para personalizar las recomendaciones
- Detectá patrones: si hay consultas repetidas por la misma área, es una señal importante
- Considerá la edad, sexo y perfil de riesgo del paciente

TIPOS DE RECOMENDACIÓN:
- "prevention": controles preventivos anuales o según frecuencia recomendada
- "follow_up": seguimiento de algo detectado en una consulta
- "lifestyle": cambios de hábitos que el paciente puede hacer
- "warning": señal de alerta que requiere atención pronta

Respondé SOLO con JSON válido, sin texto adicional:
{
  "activeConditions": [{ "name": string, "since": string, "source": string }],
  "allergies": [string],
  "currentMedications": [string],
  "healthPatterns": [{ "type": "recurring"|"chronic"|"seasonal", "area": string, "count": number, "lastSeen": string }],
  "pendingFollowUps": [{ "reason": string, "specialty": string, "dueDate": string, "priority": "high"|"medium"|"low" }],
  "recommendations": [{
    "id": string,
    "type": "prevention"|"follow_up"|"lifestyle"|"warning",
    "priority": "high"|"medium"|"low",
    "title": string,
    "description": string,
    "reason": string,
    "specialty": string,
    "dueDate": string,
    "dismissed": false,
    "createdAt": string
  }],
  "healthSummary": string
}`;

export async function runMemoryAgent(
  patientEmail: string,
  newClinicalRecord: ClinicalRecord
): Promise<void> {
  try {
    const profile = await getProfileByEmail(patientEmail);
    const allConsultations = await db.consultations.findByPatientEmail(patientEmail);

    const consultationHistory = allConsultations
      .filter((c) => c.clinicalRecord)
      .map((c) => ({
        date: new Date(c.createdAt).toLocaleDateString("es-AR"),
        specialty: c.clinicalRecord!.recommendedSpecialty,
        chiefComplaint: c.clinicalRecord!.chiefComplaint,
        symptoms: c.clinicalRecord!.symptoms,
        summary: c.clinicalRecord!.triageSummary,
        urgency: c.clinicalRecord!.urgency,
      }));

    const patientContext = `
DATOS BÁSICOS DEL PACIENTE:
${profile?.basicInfo ? JSON.stringify(profile.basicInfo, null, 2) : "Sin datos básicos registrados"}

CONDICIONES ACTIVAS CONOCIDAS:
${profile?.activeConditions?.length ? JSON.stringify(profile.activeConditions, null, 2) : "Ninguna registrada"}

ALERGIAS:
${profile?.allergies?.length ? profile.allergies.join(", ") : "Ninguna registrada"}

MEDICACIÓN HABITUAL:
${profile?.currentMedications?.length ? profile.currentMedications.join(", ") : "Ninguna registrada"}

ANTECEDENTES FAMILIARES:
${profile?.familyHistory?.length ? JSON.stringify(profile.familyHistory, null, 2) : "Sin datos"}

PATRONES DE SALUD DETECTADOS PREVIAMENTE:
${profile?.healthPatterns?.length ? JSON.stringify(profile.healthPatterns, null, 2) : "Ninguno"}

HISTORIAL DE CONSULTAS (${consultationHistory.length} consultas):
${JSON.stringify(consultationHistory, null, 2)}

NUEVA CONSULTA A PROCESAR:
Motivo: ${newClinicalRecord.chiefComplaint}
Síntomas: ${newClinicalRecord.symptoms.join(", ")}
Duración: ${newClinicalRecord.duration}
Antecedentes mencionados: ${newClinicalRecord.medicalHistory.join(", ") || "Ninguno"}
Alergias mencionadas: ${newClinicalRecord.allergies.join(", ") || "Ninguna"}
Medicación mencionada: ${newClinicalRecord.currentMedications.join(", ") || "Ninguna"}
Urgencia: ${newClinicalRecord.urgency}
Especialidad recomendada: ${newClinicalRecord.recommendedSpecialty}
Resumen clínico: ${newClinicalRecord.triageSummary}
Fecha: ${new Date().toLocaleDateString("es-AR")}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: MEMORY_AGENT_PROMPT,
      messages: [{ role: "user", content: patientContext }],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    // Extract JSON (handle markdown code blocks if present)
    const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) ?? raw.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : raw;
    const updated = JSON.parse(jsonStr);

    // Add IDs to recommendations that don't have them
    if (Array.isArray(updated.recommendations)) {
      updated.recommendations = updated.recommendations.map(
        (r: { id?: string; createdAt?: string }) => ({
          ...r,
          id: r.id || uuidv4(),
          createdAt: r.createdAt || new Date().toISOString(),
          dismissed: false,
        })
      );
    }

    // Look up userId by email to upsert
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id FROM users WHERE email = ${patientEmail.toLowerCase()}`;
    if (rows.length === 0) return;

    await upsertProfile(rows[0].id as string, {
      activeConditions: updated.activeConditions ?? profile?.activeConditions ?? [],
      allergies: updated.allergies ?? profile?.allergies ?? [],
      currentMedications: updated.currentMedications ?? profile?.currentMedications ?? [],
      healthPatterns: updated.healthPatterns ?? profile?.healthPatterns ?? [],
      pendingFollowUps: updated.pendingFollowUps ?? profile?.pendingFollowUps ?? [],
      recommendations: updated.recommendations ?? profile?.recommendations ?? [],
      healthSummary: updated.healthSummary ?? profile?.healthSummary,
    });
  } catch (err) {
    // Memory agent failure must never break the triage flow
    console.error("[memory-agent] error:", err);
  }
}
