"use client";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { logout } from "./actions";

export function AdminClient({ data }: { data: any }) {
  const router = useRouter();
  return <AdminDashboard data={data} onLogout={async () => { await logout(); router.refresh(); }} />;
}
