"use server";
import { cookies } from "next/headers";

export async function login(_prev: unknown, formData: FormData) {
  const pass = String(formData.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "ADMIN_PASSWORD no está configurada en el servidor." };
  if (pass !== expected) return { error: "Contraseña incorrecta." };
  cookies().set("admin_auth", expected, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/admin", maxAge: 60 * 60 * 8,
  });
  return { ok: true };
}

export async function logout() {
  cookies().delete("admin_auth");
  return { ok: true };
}
