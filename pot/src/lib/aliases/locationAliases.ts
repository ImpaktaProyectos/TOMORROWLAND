// Alias EDITABLE de localidades: corrige erratas / variantes -> forma canónica.
// Clave normalizada (minúsculas sin tildes).
export const locationAliases: Record<string, string> = {
  masrid: "Madrid",
  madri: "Madrid",
  "puto de sagunto": "Puerto de Sagunto",
  "puerto de sagunto": "Puerto de Sagunto",
  "pto de sagunto": "Puerto de Sagunto",
  "pto. de sagunto": "Puerto de Sagunto",
  "o barco de valdeorras": "O Barco de Valdeorras",
  coruna: "A Coruña",
};
