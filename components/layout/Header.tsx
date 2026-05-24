import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-pulso-600 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            Pulso <span className="text-pulso-600">Salud</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/triage"
            className="ml-2 px-4 py-2 text-sm bg-pulso-600 text-white rounded-xl font-medium hover:bg-pulso-700 transition-colors"
          >
            Consultar ahora
          </Link>
        </nav>
      </div>
    </header>
  );
}
