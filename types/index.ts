export type Urgency = "low" | "medium" | "high" | "emergency";

export type Specialty =
  | "cardiologia"
  | "neurologia"
  | "dermatologia"
  | "traumatologia"
  | "ginecologia"
  | "pediatria"
  | "gastroenterologia"
  | "endocrinologia"
  | "psiquiatria"
  | "medicina_general";

export type ConsultationStatus =
  | "triage"
  | "pending_payment"
  | "paid"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ClinicalRecord {
  chiefComplaint: string;       // Motivo de consulta
  symptoms: string[];
  duration: string;
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  urgency: Urgency;
  recommendedSpecialty: Specialty;
  triageSummary: string;
  generatedAt: Date;
}

export interface Specialist {
  id: string;
  name: string;
  specialty: Specialty;
  credentials: string;
  bio: string;
  rating: number;
  reviewCount: number;
  priceARS: number;
  availableSlots: string[];   // ISO date strings
  avatarUrl: string;
}

export interface Consultation {
  id: string;
  patientName: string;
  patientEmail: string;
  messages: Message[];
  clinicalRecord?: ClinicalRecord;
  assignedSpecialist?: Specialist;
  status: ConsultationStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  dailyRoomUrl?: string;
  dailyRoomName?: string;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConsultationInput {
  patientName: string;
  patientEmail: string;
}

export interface TriageRequest {
  consultationId: string;
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
}

export interface TriageCompletedPayload {
  clinicalRecord: ClinicalRecord;
  suggestedSpecialists: Specialist[];
}
