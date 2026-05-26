"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-", "No sé"];

const CHRONIC_CONDITIONS = [
  "Diabetes", "Hipertensión", "Asma", "Hipotiroidismo",
  "Artritis", "Enfermedad cardíaca", "Depresión/Ansiedad",
];

const COMMON_ALLERGIES = ["Penicilina", "Ibuprofeno", "Aspirina", "Látex", "Mariscos"];

const FAMILY_CONDITIONS = [
  "Infarto / Enfermedad cardíaca", "Diabetes tipo 2", "Cáncer",
  "Hipertensión", "Accidente cerebrovascular", "Enfermedad renal",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodType, setBloodType] = useState("");

  // Step 2
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState("");

  // Step 3
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleSave = async () => {
    setSaving(true);
    const allConditions = otherCondition.trim()
      ? [...conditions, otherCondition.trim()]
      : conditions;
    const allAllergies = otherAllergy.trim()
      ? [...allergies, otherAllergy.trim()]
      : allergies;

    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        basicInfo: {
          age: age ? parseInt(age) : undefined,
          biologicalSex: sex || undefined,
          heightCm: height ? parseInt(height) : undefined,
          weightKg: weight ? parseInt(weight) : undefined,
          bloodType: bloodType || undefined,
        },
        activeConditions: allConditions.map((name) => ({ name })),
        currentMedications: medications.trim()
          ? medications.split(",").map((m) => m.trim()).filter(Boolean)
          : [],
        allergies: allAllergies,
        familyHistory: familyHistory.map((condition) => ({ condition, relative: "familiar directo" })),
      }),
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Paso {step} de 3</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Completar después →
            </button>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full">
            <div
              className="h-1.5 bg-pulso-600 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1 — Datos básicos */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Datos básicos</h2>
            <p className="text-sm text-slate-500 mb-6">Nos ayudan a personalizar tu atención</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Edad</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pulso-500"
                    placeholder="32" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo biológico</label>
                  <select value={sex} onChange={(e) => setSex(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pulso-500 bg-white">
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Altura (cm)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pulso-500"
                    placeholder="178" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Peso (kg)</label>
                  <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pulso-500"
                    placeholder="75" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Grupo sanguíneo</label>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_TYPES.map((bt) => (
                    <button key={bt} onClick={() => setBloodType(bt === bloodType ? "" : bt)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        bloodType === bt
                          ? "bg-pulso-600 text-white border-pulso-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-pulso-300"
                      }`}>
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)}
              className="mt-6 w-full py-2.5 bg-pulso-600 text-white rounded-xl font-medium text-sm hover:bg-pulso-700 transition-colors">
              Continuar
            </button>
          </div>
        )}

        {/* Step 2 — Antecedentes */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Antecedentes médicos</h2>
            <p className="text-sm text-slate-500 mb-6">Enfermedades, medicación y alergias</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Tenés alguna enfermedad crónica? <span className="text-slate-400 font-normal">(podés elegir varias)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CHRONIC_CONDITIONS.map((c) => (
                    <button key={c} onClick={() => toggle(conditions, setConditions, c)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        conditions.includes(c)
                          ? "bg-pulso-600 text-white border-pulso-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-pulso-300"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
                <input value={otherCondition} onChange={(e) => setOtherCondition(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pulso-500"
                  placeholder="Otra enfermedad..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Medicación habitual <span className="text-slate-400 font-normal">(separada por comas)</span>
                </label>
                <input value={medications} onChange={(e) => setMedications(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pulso-500"
                  placeholder="Ej: Enalapril 5mg, Metformina 500mg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alergias conocidas</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGIES.map((a) => (
                    <button key={a} onClick={() => toggle(allergies, setAllergies, a)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        allergies.includes(a)
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-white text-slate-600 border-slate-200 hover:border-red-300"
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
                <input value={otherAllergy} onChange={(e) => setOtherAllergy(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pulso-500"
                  placeholder="Otra alergia..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">
                Atrás
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 py-2.5 bg-pulso-600 text-white rounded-xl font-medium text-sm hover:bg-pulso-700 transition-colors">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Antecedentes familiares */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Antecedentes familiares</h2>
            <p className="text-sm text-slate-500 mb-6">Condiciones en familiares directos (padres, hermanos)</p>
            <div className="flex flex-wrap gap-2">
              {FAMILY_CONDITIONS.map((c) => (
                <button key={c} onClick={() => toggle(familyHistory, setFamilyHistory, c)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    familyHistory.includes(c)
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">
                Atrás
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-pulso-600 text-white rounded-xl font-medium text-sm hover:bg-pulso-700 transition-colors disabled:opacity-60">
                {saving ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
