import { cookies } from "next/headers";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminClient } from "./AdminClient";
import adminData from "../../../reports/admin-data.json";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel de revisión", robots: { index: false, follow: false } };

export default function AdminPage() {
  const authed = cookies().get("admin_auth")?.value;
  const ok = authed && process.env.ADMIN_PASSWORD && authed === process.env.ADMIN_PASSWORD;
  if (!ok) return <AdminLogin />;
  return <AdminClient data={adminData} />;
}
