"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-pulso-600 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            Pulso <span className="text-pulso-600">Salud</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <span className="text-sm text-slate-500 px-3 hidden sm:block">
                {user.name}
              </span>
              {user.role === "patient" && (
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Mi panel
                </Link>
              )}
              {user.role === "doctor" && (
                <Link
                  href="/medicos/dashboard"
                  className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Panel médico
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-1 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/triage"
                className="ml-2 px-4 py-2 text-sm bg-pulso-600 text-white rounded-xl font-medium hover:bg-pulso-700 transition-colors"
              >
                Consultar ahora
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
