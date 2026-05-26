import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "patient" | "doctor";
  specialistId?: string;
  createdAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUser(row: Record<string, any>): DbUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as "patient" | "doctor",
    specialistId: row.specialist_id ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}
  `;
  return rows.length > 0 ? toUser(rows[0]) : null;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const rows = await sql`
    SELECT * FROM users WHERE id = ${id}
  `;
  return rows.length > 0 ? toUser(rows[0]) : null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "patient" | "doctor";
  specialistId?: string;
}): Promise<DbUser> {
  const rows = await sql`
    INSERT INTO users (name, email, password_hash, role, specialist_id)
    VALUES (
      ${data.name.trim()},
      ${data.email.toLowerCase().trim()},
      ${data.passwordHash},
      ${data.role ?? "patient"},
      ${data.specialistId ?? null}
    )
    RETURNING *
  `;
  const user = toUser(rows[0]);

  if (user.role === "patient") {
    await sql`
      INSERT INTO patient_profiles (user_id) VALUES (${user.id})
      ON CONFLICT (user_id) DO NOTHING
    `;
  }

  return user;
}
