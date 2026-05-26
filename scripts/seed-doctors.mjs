import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_sJAb94kNnPwo@ep-tiny-leaf-acoyetf4.sa-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

const DOCTORS = [
  { id: "sp-001", name: "Dra. Laura Fernández",   email: "laura.fernandez@pulsosalud.com" },
  { id: "sp-002", name: "Dr. Martín Gómez",        email: "martin.gomez@pulsosalud.com" },
  { id: "sp-003", name: "Dra. Sofía Reyes",        email: "sofia.reyes@pulsosalud.com" },
  { id: "sp-004", name: "Dr. Pablo Díaz",          email: "pablo.diaz@pulsosalud.com" },
  { id: "sp-005", name: "Dra. Valeria Torres",     email: "valeria.torres@pulsosalud.com" },
  { id: "sp-006", name: "Dra. Cecilia Mora",       email: "cecilia.mora@pulsosalud.com" },
  { id: "sp-007", name: "Dr. Rodrigo Ibáñez",     email: "rodrigo.ibanez@pulsosalud.com" },
  { id: "sp-008", name: "Dra. Ana Blanco",         email: "ana.blanco@pulsosalud.com" },
  { id: "sp-009", name: "Dr. Ignacio Paz",         email: "ignacio.paz@pulsosalud.com" },
  { id: "sp-010", name: "Dra. Jimena Castro",      email: "jimena.castro@pulsosalud.com" },
];

const DEFAULT_PASSWORD = "pulso2025";

async function seed() {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const doc of DOCTORS) {
    const existing = await sql`SELECT id FROM users WHERE email = ${doc.email}`;
    if (existing.length > 0) {
      console.log(`⏭  ${doc.name} ya existe`);
      continue;
    }
    await sql`
      INSERT INTO users (name, email, password_hash, role, specialist_id)
      VALUES (${doc.name}, ${doc.email}, ${hash}, 'doctor', ${doc.id})
    `;
    console.log(`✓  ${doc.name} → ${doc.email}`);
  }

  console.log(`\n✅ Seed completo. Contraseña por defecto: ${DEFAULT_PASSWORD}`);
  console.log("Acordate de cambiarla en producción.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
