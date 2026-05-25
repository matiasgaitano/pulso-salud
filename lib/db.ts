import { neon } from "@neondatabase/serverless";
import type {
  Consultation,
  ClinicalRecord,
  Specialist,
  ConsultationStatus,
  PaymentStatus,
  Message,
} from "@/types";

const sql = neon(process.env.DATABASE_URL!);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toConsultation(row: Record<string, any>): Consultation {
  return {
    id: row.id,
    patientName: row.patient_name,
    patientEmail: row.patient_email,
    messages: (row.messages as Message[]) ?? [],
    clinicalRecord: row.clinical_record as ClinicalRecord | undefined,
    assignedSpecialist: row.assigned_specialist as Specialist | undefined,
    status: row.status as ConsultationStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentId: row.payment_id ?? undefined,
    dailyRoomUrl: row.daily_room_url ?? undefined,
    dailyRoomName: row.daily_room_name ?? undefined,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const db = {
  consultations: {
    async create(data: Consultation): Promise<Consultation> {
      const rows = await sql`
        INSERT INTO consultations (
          id, patient_name, patient_email, messages,
          status, payment_status, created_at, updated_at
        ) VALUES (
          ${data.id}, ${data.patientName}, ${data.patientEmail},
          ${JSON.stringify(data.messages)},
          ${data.status}, ${data.paymentStatus},
          NOW(), NOW()
        )
        RETURNING *
      `;
      return toConsultation(rows[0]);
    },

    async findById(id: string): Promise<Consultation | null> {
      const rows = await sql`
        SELECT * FROM consultations WHERE id = ${id}
      `;
      return rows.length > 0 ? toConsultation(rows[0]) : null;
    },

    async update(
      id: string,
      patch: Partial<Consultation>
    ): Promise<Consultation | null> {
      const existing = await sql`
        SELECT id FROM consultations WHERE id = ${id}
      `;
      if (existing.length === 0) return null;

      const setClauses: string[] = ["updated_at = NOW()"];
      const values: unknown[] = [];
      let idx = 1;

      if (patch.messages !== undefined) {
        setClauses.push(`messages = $${idx++}`);
        values.push(JSON.stringify(patch.messages));
      }
      if (patch.clinicalRecord !== undefined) {
        setClauses.push(`clinical_record = $${idx++}`);
        values.push(JSON.stringify(patch.clinicalRecord));
      }
      if (patch.assignedSpecialist !== undefined) {
        setClauses.push(`assigned_specialist = $${idx++}`);
        values.push(JSON.stringify(patch.assignedSpecialist));
      }
      if (patch.status !== undefined) {
        setClauses.push(`status = $${idx++}`);
        values.push(patch.status);
      }
      if (patch.paymentStatus !== undefined) {
        setClauses.push(`payment_status = $${idx++}`);
        values.push(patch.paymentStatus);
      }
      if (patch.paymentId !== undefined) {
        setClauses.push(`payment_id = $${idx++}`);
        values.push(patch.paymentId);
      }
      if (patch.dailyRoomUrl !== undefined) {
        setClauses.push(`daily_room_url = $${idx++}`);
        values.push(patch.dailyRoomUrl);
      }
      if (patch.dailyRoomName !== undefined) {
        setClauses.push(`daily_room_name = $${idx++}`);
        values.push(patch.dailyRoomName);
      }
      if (patch.scheduledAt !== undefined) {
        setClauses.push(`scheduled_at = $${idx++}`);
        values.push(patch.scheduledAt);
      }

      values.push(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = await (sql as any)(
        `UPDATE consultations SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
        values
      );
      return rows.length > 0 ? toConsultation(rows[0]) : null;
    },

    async findAll(): Promise<Consultation[]> {
      const rows = await sql`
        SELECT * FROM consultations ORDER BY created_at DESC
      `;
      return rows.map(toConsultation);
    },

    async findByPatientEmail(email: string): Promise<Consultation[]> {
      const rows = await sql`
        SELECT * FROM consultations
        WHERE patient_email = ${email}
        ORDER BY created_at DESC
      `;
      return rows.map(toConsultation);
    },
  },
};
