import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface BasicInfo {
  age?: number;
  biologicalSex?: "male" | "female" | "other";
  heightCm?: number;
  weightKg?: number;
  bloodType?: string;
}

export interface FamilyHistoryItem {
  condition: string;
  relative: string; // "padre" | "madre" | "hermano" | etc.
}

export interface HealthCondition {
  name: string;
  since?: string;
  source?: string;
}

export interface HealthPattern {
  type: "recurring" | "chronic" | "seasonal";
  area: string;
  count: number;
  lastSeen?: string;
}

export interface PendingFollowUp {
  reason: string;
  specialty?: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
}

export interface HealthRecommendation {
  id: string;
  type: "prevention" | "follow_up" | "lifestyle" | "warning";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  reason: string;
  specialty?: string;
  dueDate?: string;
  dismissed: boolean;
  createdAt: string;
}

export interface PatientProfile {
  userId: string;
  basicInfo: BasicInfo;
  activeConditions: HealthCondition[];
  allergies: string[];
  currentMedications: string[];
  familyHistory: FamilyHistoryItem[];
  healthPatterns: HealthPattern[];
  pendingFollowUps: PendingFollowUp[];
  recommendations: HealthRecommendation[];
  healthSummary?: string;
  updatedAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProfile(row: Record<string, any>): PatientProfile {
  return {
    userId: row.user_id,
    basicInfo: row.basic_info ?? {},
    activeConditions: row.active_conditions ?? [],
    allergies: row.allergies ?? [],
    currentMedications: row.current_medications ?? [],
    familyHistory: row.family_history ?? [],
    healthPatterns: row.health_patterns ?? [],
    pendingFollowUps: row.pending_follow_ups ?? [],
    recommendations: row.recommendations ?? [],
    healthSummary: row.health_summary ?? undefined,
    updatedAt: new Date(row.updated_at),
  };
}

export async function getProfileByUserId(userId: string): Promise<PatientProfile | null> {
  const rows = await sql`
    SELECT * FROM patient_profiles WHERE user_id = ${userId}
  `;
  return rows.length > 0 ? toProfile(rows[0]) : null;
}

export async function getProfileByEmail(email: string): Promise<PatientProfile | null> {
  const rows = await sql`
    SELECT p.* FROM patient_profiles p
    JOIN users u ON p.user_id = u.id
    WHERE u.email = ${email.toLowerCase().trim()}
  `;
  return rows.length > 0 ? toProfile(rows[0]) : null;
}

export async function upsertProfile(
  userId: string,
  patch: Partial<Omit<PatientProfile, "userId" | "updatedAt">>
): Promise<PatientProfile> {
  const rows = await sql`
    INSERT INTO patient_profiles (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
  `;
  void rows;

  const setClauses: string[] = ["updated_at = NOW()"];
  const values: unknown[] = [];
  let idx = 1;

  if (patch.basicInfo !== undefined) {
    setClauses.push(`basic_info = $${idx++}`);
    values.push(JSON.stringify(patch.basicInfo));
  }
  if (patch.activeConditions !== undefined) {
    setClauses.push(`active_conditions = $${idx++}`);
    values.push(JSON.stringify(patch.activeConditions));
  }
  if (patch.allergies !== undefined) {
    setClauses.push(`allergies = $${idx++}`);
    values.push(JSON.stringify(patch.allergies));
  }
  if (patch.currentMedications !== undefined) {
    setClauses.push(`current_medications = $${idx++}`);
    values.push(JSON.stringify(patch.currentMedications));
  }
  if (patch.familyHistory !== undefined) {
    setClauses.push(`family_history = $${idx++}`);
    values.push(JSON.stringify(patch.familyHistory));
  }
  if (patch.healthPatterns !== undefined) {
    setClauses.push(`health_patterns = $${idx++}`);
    values.push(JSON.stringify(patch.healthPatterns));
  }
  if (patch.pendingFollowUps !== undefined) {
    setClauses.push(`pending_follow_ups = $${idx++}`);
    values.push(JSON.stringify(patch.pendingFollowUps));
  }
  if (patch.recommendations !== undefined) {
    setClauses.push(`recommendations = $${idx++}`);
    values.push(JSON.stringify(patch.recommendations));
  }
  if (patch.healthSummary !== undefined) {
    setClauses.push(`health_summary = $${idx++}`);
    values.push(patch.healthSummary);
  }

  values.push(userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (sql as any)(
    `UPDATE patient_profiles SET ${setClauses.join(", ")} WHERE user_id = $${idx} RETURNING *`,
    values
  );
  return toProfile(updated[0]);
}
