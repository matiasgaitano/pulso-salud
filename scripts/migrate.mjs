import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_sJAb94kNnPwo@ep-tiny-leaf-acoyetf4.sa-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'patient',
      date_of_birth DATE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ users");

  await sql`
    CREATE TABLE IF NOT EXISTS patient_profiles (
      user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      active_conditions   JSONB NOT NULL DEFAULT '[]',
      allergies           JSONB NOT NULL DEFAULT '[]',
      current_medications JSONB NOT NULL DEFAULT '[]',
      pending_follow_ups  JSONB NOT NULL DEFAULT '[]',
      health_patterns     JSONB NOT NULL DEFAULT '[]',
      health_summary      TEXT,
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ patient_profiles");

  await sql`
    CREATE TABLE IF NOT EXISTS consultations (
      id                  UUID PRIMARY KEY,
      patient_id          UUID REFERENCES users(id),
      patient_name        TEXT NOT NULL,
      patient_email       TEXT NOT NULL,
      messages            JSONB NOT NULL DEFAULT '[]',
      clinical_record     JSONB,
      assigned_specialist JSONB,
      status              TEXT NOT NULL DEFAULT 'triage',
      payment_status      TEXT NOT NULL DEFAULT 'pending',
      payment_id          TEXT,
      daily_room_url      TEXT,
      daily_room_name     TEXT,
      scheduled_at        TIMESTAMPTZ,
      post_consultation   JSONB,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ consultations");

  await sql`
    CREATE INDEX IF NOT EXISTS idx_consultations_patient_id
      ON consultations(patient_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_consultations_patient_email
      ON consultations(patient_email)
  `;
  console.log("✓ indexes");

  console.log("\n✅ All migrations complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
