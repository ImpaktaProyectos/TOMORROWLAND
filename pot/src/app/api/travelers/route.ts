import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryTravelers } from "@/lib/data";

export const dynamic = "force-dynamic";

const schema = z.object({
  search: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  province: z.string().max(80).optional(),
  departure: z.string().max(80).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
  timeTolerance: z.coerce.number().int().min(0).max(240).optional(),
  dreamville: z.string().max(60).optional(),
  sort: z.enum(["name", "earliest", "latest", "date"]).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional(),
  limit: z.coerce.number().int().min(1).max(300).optional(),
});

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = schema.safeParse(Object.fromEntries(sp.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }
  return NextResponse.json(queryTravelers(parsed.data));
}
