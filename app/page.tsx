import Link from "next/link";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  {
    icon: "🧠",
    title: "Triage con IA",
    desc: "Un asistente médico te hace las preguntas correctas y arma tu ficha clínica automáticamente.",
  },
  {
    icon: "👩‍⚕️",
    title: "Especialistas verificados",
    desc: "Te asignamos al especialista adecuado según tus síntomas, con credenciales validadas.",
  },
  {
    icon: "📹",
    title: "Videollamada integrada",
    desc: "La consulta ocurre dentro de la plataforma. Sin apps extras, desde cualquier dispositivo.",
  },
  {
    icon: "🔒",
    title: "Pago seguro",
    desc: "Procesamos el pago con MercadoPago. Solo pagás cuando confirmás tu especialista.",
  },
];

const SPECIALTIES = [
  "Cardiología",
  "Neurología",
  "Dermatología",
  "Traumatología",
  "Ginecología",
  "Pediatría",
  "Gastroenterología",
  "Endocrinología",
  "Psiquiatría",
  "Medicina General",
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-pulso-50 text-pulso-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-pulso-500 animate-pulse" />
            Especialistas disponibles hoy
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto">
            Segunda opinión médica{" "}
            <span className="text-pulso-600">desde donde estés</span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Chateá con nuestra IA de triage, obtené tu ficha clínica y consultá
            con un especialista verificado por videollamada.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/triage">
              <Button size="lg">
                Empezar consulta gratis
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              Ver especialistas
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            El triage es gratuito. Pagás solo cuando confirmás la videoconsulta.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties */}
      <section className="bg-white border-y border-slate-100 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Especialidades disponibles
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {SPECIALTIES.map((s) => (
              <span
                key={s}
                className="px-4 py-2 bg-pulso-50 text-pulso-700 text-sm font-medium rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-pulso-600 rounded-3xl px-8 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            ¿Tenés dudas sobre tu diagnóstico?
          </h2>
          <p className="text-pulso-100 mb-7 max-w-md mx-auto">
            Un especialista verificado puede revisar tu caso en menos de 24hs.
          </p>
          <Link href="/triage">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-pulso-700 hover:bg-pulso-50"
            >
              Comenzar ahora — es gratis
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
