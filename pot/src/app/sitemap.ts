import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://people-of-tomorrow.vercel.app";
  const routes = ["", "/personas", "/mi-vuelo", "/dreamville", "/informacion"];
  return routes.map((r) => ({ url: `${base}${r}`, lastModified: new Date(), changeFrequency: "weekly", priority: r === "" ? 1 : 0.7 }));
}
