import type { Specialist, Specialty } from "@/types";

const SPECIALISTS: Specialist[] = [
  // CARDIOLOGÍA
  {
    id: "sp-001",
    name: "Dra. Laura Fernández",
    specialty: "cardiologia",
    credentials: "MN 98234 — Hospital Italiano de Buenos Aires",
    bio: "Especialista en cardiología clínica con 15 años de experiencia en diagnóstico y prevención cardiovascular.",
    rating: 4.9, reviewCount: 312, priceARS: 18000,
    availableSlots: generateSlots(3), avatarUrl: "",
  },
  {
    id: "sp-011",
    name: "Dr. Roberto Salas",
    specialty: "cardiologia",
    credentials: "MN 84521 — Fundación Favaloro",
    bio: "Cardiólogo intervencionista especializado en cardiopatía isquémica e insuficiencia cardíaca.",
    rating: 4.8, reviewCount: 241, priceARS: 20000,
    availableSlots: generateSlots(2), avatarUrl: "",
  },
  {
    id: "sp-012",
    name: "Dra. Mónica Herrera",
    specialty: "cardiologia",
    credentials: "MN 91087 — CEMIC",
    bio: "Cardióloga clínica con subespecialidad en arritmias y electrocardiografía avanzada.",
    rating: 4.7, reviewCount: 178, priceARS: 17000,
    availableSlots: generateSlots(4), avatarUrl: "",
  },

  // NEUROLOGÍA
  {
    id: "sp-002",
    name: "Dr. Martín Gómez",
    specialty: "neurologia",
    credentials: "MN 76543 — Hospital Garrahan",
    bio: "Neurólogo especializado en cefaleas, epilepsia y trastornos del movimiento.",
    rating: 4.8, reviewCount: 198, priceARS: 20000,
    availableSlots: generateSlots(4), avatarUrl: "",
  },
  {
    id: "sp-013",
    name: "Dra. Patricia Vidal",
    specialty: "neurologia",
    credentials: "MN 88932 — FLENI",
    bio: "Neuróloga con experiencia en esclerosis múltiple, demencias y neurología vascular.",
    rating: 4.9, reviewCount: 267, priceARS: 22000,
    availableSlots: generateSlots(3), avatarUrl: "",
  },
  {
    id: "sp-014",
    name: "Dr. Sebastián Ríos",
    specialty: "neurologia",
    credentials: "MN 102345 — Hospital Ramos Mejía",
    bio: "Neurólogo clínico especializado en cefaleas crónicas y mareos vestibulares.",
    rating: 4.6, reviewCount: 134, priceARS: 18000,
    availableSlots: generateSlots(5), avatarUrl: "",
  },

  // DERMATOLOGÍA
  {
    id: "sp-003",
    name: "Dra. Sofía Reyes",
    specialty: "dermatologia",
    credentials: "MN 112045 — Clínica Santa Isabel",
    bio: "Dermatóloga clínica y estética con enfoque en dermatología oncológica preventiva.",
    rating: 4.9, reviewCount: 421, priceARS: 15000,
    availableSlots: generateSlots(2), avatarUrl: "",
  },
  {
    id: "sp-015",
    name: "Dr. Gustavo Peralta",
    specialty: "dermatologia",
    credentials: "MN 79654 — Hospital Británico",
    bio: "Dermatólogo especializado en psoriasis, dermatitis atópica y enfermedades autoinmunes de la piel.",
    rating: 4.7, reviewCount: 189, priceARS: 14000,
    availableSlots: generateSlots(4), avatarUrl: "",
  },
  {
    id: "sp-016",
    name: "Dra. Natalia Cruz",
    specialty: "dermatologia",
    credentials: "MN 118763 — Centro Médico Palermo",
    bio: "Dermatóloga con enfoque en acné, alopecia y dermatología estética no invasiva.",
    rating: 4.8, reviewCount: 298, priceARS: 13000,
    availableSlots: generateSlots(6), avatarUrl: "",
  },

  // TRAUMATOLOGÍA
  {
    id: "sp-004",
    name: "Dr. Pablo Díaz",
    specialty: "traumatologia",
    credentials: "MN 87621 — FLENI",
    bio: "Traumatólogo ortopedista con 12 años en cirugía artroscópica y traumatología del deporte.",
    rating: 4.7, reviewCount: 156, priceARS: 22000,
    availableSlots: generateSlots(3), avatarUrl: "",
  },
  {
    id: "sp-017",
    name: "Dra. Andrea Molina",
    specialty: "traumatologia",
    credentials: "MN 93456 — Hospital Austral",
    bio: "Traumatóloga especializada en columna vertebral, hernias de disco y dolor lumbar crónico.",
    rating: 4.8, reviewCount: 203, priceARS: 21000,
    availableSlots: generateSlots(3), avatarUrl: "",
  },
  {
    id: "sp-018",
    name: "Dr. Lucas Ferreyra",
    specialty: "traumatologia",
    credentials: "MN 105678 — Sanatorio Otamendi",
    bio: "Traumatólogo con subespecialidad en rodilla, tobillo y rehabilitación postquirúrgica.",
    rating: 4.6, reviewCount: 121, priceARS: 19000,
    availableSlots: generateSlots(4), avatarUrl: "",
  },

  // GINECOLOGÍA
  {
    id: "sp-005",
    name: "Dra. Valeria Torres",
    specialty: "ginecologia",
    credentials: "MN 93410 — Hospital Alemán",
    bio: "Ginecóloga y obstetra especializada en salud reproductiva y ginecología endocrina.",
    rating: 4.9, reviewCount: 287, priceARS: 17000,
    availableSlots: generateSlots(5), avatarUrl: "",
  },
  {
    id: "sp-019",
    name: "Dra. Marcela Soto",
    specialty: "ginecologia",
    credentials: "MN 81234 — Hospital Italiano",
    bio: "Ginecóloga con experiencia en endometriosis, síndrome de ovario poliquístico y menopausia.",
    rating: 4.8, reviewCount: 312, priceARS: 16000,
    availableSlots: generateSlots(4), avatarUrl: "",
  },
  {
    id: "sp-020",
    name: "Dra. Carolina Núñez",
    specialty: "ginecologia",
    credentials: "MN 107890 — Centro de Salud Belgrano",
    bio: "Ginecóloga general con enfoque en salud de la mujer a todas las edades.",
    rating: 4.7, reviewCount: 198, priceARS: 15000,
    availableSlots: generateSlots(6), avatarUrl: "",
  },

  // PEDIATRÍA
  {
    id: "sp-006",
    name: "Dra. Cecilia Mora",
    specialty: "pediatria",
    credentials: "MN 65890 — Hospital de Niños Ricardo Gutiérrez",
    bio: "Pediatra con subespecialidad en nutrición infantil y desarrollo psicomotor.",
    rating: 4.9, reviewCount: 534, priceARS: 14000,
    availableSlots: generateSlots(6), avatarUrl: "",
  },
  {
    id: "sp-021",
    name: "Dr. Nicolás Aguirre",
    specialty: "pediatria",
    credentials: "MN 88123 — Hospital Garrahan",
    bio: "Pediatra clínico con experiencia en enfermedades respiratorias y alergias infantiles.",
    rating: 4.8, reviewCount: 423, priceARS: 13000,
    availableSlots: generateSlots(5), avatarUrl: "",
  },
  {
    id: "sp-022",
    name: "Dra. Florencia Bernal",
    specialty: "pediatria",
    credentials: "MN 115432 — Clínica del Niño",
    bio: "Pediatra especializada en lactancia materna, alimentación complementaria y crianza respetuosa.",
    rating: 4.9, reviewCount: 389, priceARS: 12000,
    availableSlots: generateSlots(7), avatarUrl: "",
  },

  // GASTROENTEROLOGÍA
  {
    id: "sp-007",
    name: "Dr. Rodrigo Ibáñez",
    specialty: "gastroenterologia",
    credentials: "MN 101234 — Centro Médico Rossi",
    bio: "Gastroenterólogo con experiencia en enfermedades inflamatorias intestinales y hepatología.",
    rating: 4.7, reviewCount: 143, priceARS: 19000,
    availableSlots: generateSlots(3), avatarUrl: "",
  },
  {
    id: "sp-023",
    name: "Dra. Alejandra Font",
    specialty: "gastroenterologia",
    credentials: "MN 87456 — Hospital Udaondo",
    bio: "Gastroenteróloga especializada en colon irritable, enfermedad celíaca y microbiota intestinal.",
    rating: 4.8, reviewCount: 176, priceARS: 18000,
    availableSlots: generateSlots(4), avatarUrl: "",
  },

  // ENDOCRINOLOGÍA
  {
    id: "sp-008",
    name: "Dra. Ana Blanco",
    specialty: "endocrinologia",
    credentials: "MN 88765 — CEMIC",
    bio: "Endocrinóloga especializada en diabetes, tiroides y metabolismo.",
    rating: 4.8, reviewCount: 209, priceARS: 18000,
    availableSlots: generateSlots(4), avatarUrl: "",
  },
  {
    id: "sp-024",
    name: "Dr. Hernán Quiroga",
    specialty: "endocrinologia",
    credentials: "MN 94321 — Hospital Ramos Mejía",
    bio: "Endocrinólogo con subespecialidad en obesidad, resistencia a la insulina y síndrome metabólico.",
    rating: 4.7, reviewCount: 165, priceARS: 17000,
    availableSlots: generateSlots(3), avatarUrl: "",
  },

  // PSIQUIATRÍA
  {
    id: "sp-009",
    name: "Dr. Ignacio Paz",
    specialty: "psiquiatria",
    credentials: "MN 79023 — Fundación Favaloro",
    bio: "Psiquiatra con formación en TCC y psiquiatría de enlace.",
    rating: 4.8, reviewCount: 178, priceARS: 16000,
    availableSlots: generateSlots(5), avatarUrl: "",
  },
  {
    id: "sp-025",
    name: "Dra. Verónica Salinas",
    specialty: "psiquiatria",
    credentials: "MN 103456 — Hospital Moyano",
    bio: "Psiquiatra especializada en ansiedad, depresión y trastornos del sueño en adultos.",
    rating: 4.9, reviewCount: 234, priceARS: 15000,
    availableSlots: generateSlots(4), avatarUrl: "",
  },
  {
    id: "sp-026",
    name: "Dr. Tomás Varela",
    specialty: "psiquiatria",
    credentials: "MN 111234 — Centro Integral de Salud Mental",
    bio: "Psiquiatra con enfoque en terapia cognitivo-conductual y tratamiento de adicciones.",
    rating: 4.7, reviewCount: 156, priceARS: 14000,
    availableSlots: generateSlots(5), avatarUrl: "",
  },

  // MEDICINA GENERAL
  {
    id: "sp-010",
    name: "Dra. Jimena Castro",
    specialty: "medicina_general",
    credentials: "MN 120456 — Centro de Salud Palermo",
    bio: "Médica clínica generalista con enfoque en medicina preventiva y atención primaria.",
    rating: 4.8, reviewCount: 391, priceARS: 12000,
    availableSlots: generateSlots(8), avatarUrl: "",
  },
  {
    id: "sp-027",
    name: "Dr. Ezequiel Ramos",
    specialty: "medicina_general",
    credentials: "MN 98765 — Centro Médico Belgrano",
    bio: "Médico clínico con énfasis en medicina interna, chequeos ejecutivos y enfermedades crónicas.",
    rating: 4.7, reviewCount: 287, priceARS: 11000,
    availableSlots: generateSlots(7), avatarUrl: "",
  },
  {
    id: "sp-028",
    name: "Dra. Silvana Ortega",
    specialty: "medicina_general",
    credentials: "MN 115678 — Sanatorio Los Arcos",
    bio: "Médica generalista con foco en salud integral, medicina preventiva y segundo nivel de atención.",
    rating: 4.8, reviewCount: 312, priceARS: 12000,
    availableSlots: generateSlots(6), avatarUrl: "",
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
