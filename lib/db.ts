/**
 * In-memory store. Replace with Prisma + PostgreSQL for production.
 * Use a singleton pattern compatible with Next.js hot-reload in dev.
 */
import type { Consultation } from "@/types";

const globalForDb = globalThis as unknown as {
  consultations: Map<string, Consultation> | undefined;
};

const consultations: Map<string, Consultation> =
  globalForDb.consultations ?? new Map();

// Always assign to global so the singleton survives hot-reload in dev
// AND is shared across module re-evaluations in production edge/serverless.
globalForDb.consultations = consultations;

export const db = {
  consultations: {
    create(data: Consultation): Consultation {
      consultations.set(data.id, data);
      return data;
    },
    findById(id: string): Consultation | undefined {
      return consultations.get(id);
    },
    update(id: string, patch: Partial<Consultation>): Consultation | null {
      const existing = consultations.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...patch, updatedAt: new Date() };
      consultations.set(id, updated);
      return updated;
    },
    findAll(): Consultation[] {
      return Array.from(consultations.values());
    },
  },
};
