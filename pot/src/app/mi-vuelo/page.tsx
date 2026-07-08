import { getOptions } from "@/lib/data";
import { MiVueloClient } from "@/components/MiVueloClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Encuentra tu vuelo" };

export default function MiVueloPage() {
  const options = getOptions();
}
