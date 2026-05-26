import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Pulso Salud — Segundas opiniones médicas",
  description:
    "Consultá con especialistas verificados desde cualquier lugar. Triage con IA, videollamada y pago seguro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-100 bg-white py-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Pulso Salud. Este servicio no reemplaza
              la atención médica de urgencias. Ante una emergencia llamá al{" "}
              <strong className="text-slate-500">911</strong>.
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
