import type { Specialist, Specialty } from "@/types";

const SPECIALISTS: Specialist[] = [
  {
    id: "sp-001",
    name: "Dra. Laura Fernández",
    specialty: "cardiologia",
    credentials: "MN 98234 — Hospital Italiano de Buenos Aires",
    bio: "Especialista en cardiología clínica con 15 años de experiencia en diagnóstico y prevención cardiovascular.",
    rating: 4.9,
    reviewCount: 312,
    priceARS: 18000,
    availableSlots: generateSlots(3),
    avatarUrl: "",
  },
  {
    id: "sp-002",
    name: "Dr. Martín Gómez",
    specialty: "neurologia",
    credentials: "MN 76543 — Hospital Garrahan",
    bio: "Neurólogo especializado en cefaleas, epilepsia y trastornos del movimiento.",
    rating: 4.8,
    reviewCount: 198,
    priceARS: 20000,
    availableSlots: generateSlots(4),
    avatarUrl: "",
  },
  {
    id: "sp-003",
    name: "Dra. Sofía Reyes",
    specialty: "dermatologia",
    credentials: "MN 112045 — Clínica Santa Isabel",
    bio: "Dermatóloga clínica y estética con enfoque en dermatología oncológica preventiva.",
    rating: 4.9,
    reviewCount: 421,
    priceARS: 15000,
    availableSlots: generateSlots(2),
    avatarUrl: "",
  },
  {
    id: "sp-004",
    name: "Dr. Pablo Díaz",
    specialty: "traumatologia",
    credentials: "MN 87621 — FLENI",
    bio: "Traumatólogo ortopedista con 12 años en cirugía artroscópica y traumatología del deporte.",
    rating: 4.7,
    reviewCount: 156,
    priceARS: 22000,
    availableSlots: generateSlots(3),
    avatarUrl: "",
  },
  {
    id: "sp-005",
    name: "Dra. Valeria Torres",
    specialty: "ginecologia",
    credentials: "MN 93410 — Hospital Alemán",
    bio: "Ginecóloga y obstetra especializada en salud reproductiva y ginecología endocrina.",
    rating: 4.9,
    reviewCount: 287,
    priceARS: 17000,
    availableSlots: generateSlots(5),
    avatarUrl: "",
  },
  {
    id: "sp-006",
    name: "Dra. Cecilia Mora",
    specialty: "pediatria",
    credentials: "MN 65890 — Hospital de Niños Ricardo Gutiérrez",
    bio: "Pediatra con subespecialidad en nutrición infantil y desarrollo psicomotor.",
    rating: 4.9,
    reviewCount: 534,
    priceARS: 14000,
    availableSlots: generateSlots(6),
    avatarUrl: "",
  },
  {
    id: "sp-007",
    name: "Dr. Rodrigo Ibáñez",
    specialty: "gastroenterologia",
    credentials: "MN 101234 — Centro Médico Rossi",
    bio: "Gastroenterólogo con experiencia en enfermedades inflamatorias intestinales y hepatología.",
    rating: 4.7,
    reviewCount: 143,
    priceARS: 19000,
    availableSlots: generateSlots(3),
    avatarUrl: "",
  },
  {
    id: "sp-008",
    name: "Dra. Ana Blanco",
    specialty: "endocrinologia",
    credentials: "MN 88765 — CEMIC",
    bio: "Endocrinóloga especializada en diabetes, tiroides y metabolismo.",
    rating: 4.8,
    reviewCount: 209,
    priceARS: 18000,
    availableSlots: generateSlots(4),
    avatarUrl: "",
  },
  {
    id: "sp-009",
    name: "Dr. Ignacio Paz",
    specialty: "psiquiatria",
    credentials: "MN 79023 — Fundación Favaloro",
    bio: "Psiquiatra con formación en TCC y psiquiatría de enlace.",
    rating: 4.8,
    reviewCount: 178,
    priceARS: 16000,
    availableSlots: generateSlots(5),
    avatarUrl: "",
  },
  {
    id: "sp-010",
    name: "Dra. Jimena Castro",
    specialty: "medicina_general",
    credentials: "MN 120456 — Centro de Salud Palermo",
    bio: "Médica clínica generalista con enfoque en medicina preventiva y atención primaria.",
    rating: 4.8,
    reviewCount: 391,
    priceARS: 12000,
    availableSlots: generateSlots(8),
    avatarUrl: "",
  },
];

function generateSlots(count: number): string[] {
  const slots: string[] = [];
  const base = new Date();
  base.setHours(9, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i + 1);
    d.setHours(9 + (i % 4) * 2);
    slots.push(d.toISOString());
  }
  return slots;
}

export function getSpecialistsBySpecialty(specialty: Specialty): Specialist[] {
  return SPECIALISTS.filter((s) => s.specialty === specialty);
}

export function getSpecialistById(id: string): Specialist | undefined {
  return SPECIALISTS.find((s) => s.id === id);
}

export function getAllSpecialists(): Specialist[] {
  return SPECIALISTS;
}
