"use client";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Lock } from "lucide-react";
import { login } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="focusable min-h-[48px] w-full rounded-xl bg-cobalt py-3 font-medium text-white disabled:opacity-50">
      {pending ? "Comprobando…" : "Entrar"}
    </button>
  );
}

export function AdminLogin() {
  const [state, action] = useFormState(login, {} as any);
  const router = useRouter();
  useEffect(() => { if (state?.ok) router.refresh(); }, [state, router]);
  return (
    <div className="mx-auto max-w-sm pt-16">
      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-2 text-gold"><Lock size={18} aria-hidden /><h1 className="display text-xl text-ivory">Panel de revisión</h1></div>
        <form action={action} className="space-y-3">
          <input type="password" name="password" placeholder="Contraseña" aria-label="Contraseña"
            className="focusable min-h-[48px] w-full rounded-xl border border-gold/25 bg-night-2 px-4 py-3 text-ivory" />
          {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
          <Submit />
        </form>
      </div>
    </div>
  );
}
