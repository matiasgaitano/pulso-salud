import { NextRequest, NextResponse } from "next/server";
import { getSpecialistsBySpecialty, getAllSpecialists } from "@/lib/specialists";
import type { Specialty } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialty = searchParams.get("specialty") as Specialty | null;

  const specialists = specialty
    ? getSpecialistsBySpecialty(specialty)
    : getAllSpecialists();

  return NextResponse.json(specialists);
}
