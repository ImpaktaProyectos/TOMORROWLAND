import { describe, it, expect } from "vitest";
import { getAllTravelers } from "../lib/data";

describe("contacto WhatsApp", () => {
  it("persona válida -> redirección a wa.me", async () => {
    const { GET } = await import("../app/contact/[id]/route");
    const person = getAllTravelers().find((t) => t.phoneValid)!;
    const req: any = { headers: { get: () => "1.2.3.4" }, nextUrl: {} };
    const res = await GET(req, { params: { id: person.id } });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("wa.me/");
  });

  it("persona sin teléfono -> 404", async () => {
    const { GET } = await import("../app/contact/[id]/route");
    const person = getAllTravelers().find((t) => !t.phoneValid)!;
    const req: any = { headers: { get: () => "1.2.3.4" }, nextUrl: {} };
    const res = await GET(req, { params: { id: person.id } });
    expect(res.status).toBe(404);
  });
});
