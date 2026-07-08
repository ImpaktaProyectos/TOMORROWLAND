import { NextRequest, NextResponse } from "next/server";
import { getById, toPublic, getRelated } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const t = getById(params.id);
  if (!t) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ traveler: toPublic(t), related: getRelated(t.id) });
}
