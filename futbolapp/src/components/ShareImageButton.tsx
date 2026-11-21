"use client";

import { useState } from "react";
import Button from "@mui/material/Button";

// Comparte la imagen del partido: en el celular abre el menú de compartir (WhatsApp, Instagram...);
// en la computadora la descarga.
export default function ShareImageButton({ code, title, label = "Compartir imagen" }: { code: string; title: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onClick() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/p/${code}/imagen`);
      if (!res.ok) throw new Error("img");
      const blob = await res.blob();
      const file = new File([blob], "picado.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "picado.png";
        a.click();
        URL.revokeObjectURL(url);
        setMsg("Imagen descargada.");
      }
    } catch (e) {
      // Si la persona cierra el menú de compartir no es un error
      if (!(e instanceof DOMException && e.name === "AbortError")) setMsg("No pudimos generar la imagen. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outlined" color="inherit" onClick={onClick} disabled={busy}>{busy ? "Preparando..." : label}</Button>
      {msg && <span role="status" style={{ fontSize: "0.85rem", alignSelf: "center" }}>{msg}</span>}
    </>
  );
}
