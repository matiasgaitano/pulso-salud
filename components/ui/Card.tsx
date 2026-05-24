import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: Props) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${
        padding ? "p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
