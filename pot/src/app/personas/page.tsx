import { getOptions } from "@/lib/data";
import { PersonasClient } from "@/components/PersonasClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Directorio de personas" };

export default function PersonasPage() {
  const options = getOptions();
}
