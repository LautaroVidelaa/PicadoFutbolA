/** Devuelve una ruta interna segura para redirigir después de ingresar.
 *  Solo acepta caminos del propio sitio ("/algo"), nunca otro dominio. */
export function safeNext(raw: FormDataEntryValue | string | null | undefined, fallback = "/inicio"): string {
  const v = typeof raw === "string" ? raw : "";
  if (!v.startsWith("/") || v.startsWith("//") || v.includes("\\") || v.length > 200) return fallback;
  return v;
}
