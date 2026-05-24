"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function TriagePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: name, patientEmail: email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al iniciar la consulta");
      }

      const consultation = await res.json();
      router.push(`/consultation/${consultation.id}/chat`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Iniciá tu consulta
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Primero necesitamos algunos datos básicos para crear tu ficha.
        </p>
      </div>

      <Card>
        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              placeholder="María González"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pulso-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="maria@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pulso-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Comenzar triage
          </Button>

          <p className="text-xs text-slate-400 text-center">
            Tus datos son confidenciales y no se comparten sin tu consentimiento.
          </p>
        </form>
      </Card>
    </div>
  );
}
