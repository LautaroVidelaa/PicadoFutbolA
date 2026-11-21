// En qué se puede destacar un compañero (se eligen hasta 2 por valoración)
export const TRAITS = [
  { id: "tecnica", label: "Técnica" },
  { id: "fisico", label: "Físico" },
  { id: "companerismo", label: "Compañerismo" },
  { id: "juego-limpio", label: "Juego limpio" },
  { id: "actitud", label: "Actitud" },
  { id: "puntualidad", label: "Puntualidad" },
] as const;

export const TRAIT_IDS: string[] = TRAITS.map((t) => t.id);
export const MAX_TRAITS = 2;
/** Hasta cuántos días después del partido se puede valorar */
export const RATE_WINDOW_DAYS = 14;
/** Mínimo de valoraciones para mostrar un promedio (así no se adivina quién puso qué) */
export const MIN_RATINGS_SHOWN = 3;
