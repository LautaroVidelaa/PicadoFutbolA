"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import { setGuestPhotoAction } from "@/app/actions/guests";
import { shrinkImage } from "@/lib/shrinkImage";

// "Foto" para un jugador sin cuenta: elige una imagen, se achica en el navegador y se guarda
export default function GuestPhotoButton({ playerId, name, hasPhoto }: { playerId: string; name: string; hasPhoto: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return setError("Elegí una imagen PNG, JPG o WEBP.");
    try {
      const data = await shrinkImage(file);
      start(async () => {
        const r = await setGuestPhotoAction(playerId, data);
        if (r.error) setError(r.error);
        else router.refresh();
      });
    } catch {
      setError("No pudimos leer esa imagen.");
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} hidden />
      <Button type="button" size="small" color="inherit" disabled={pending} sx={{ textDecoration: "underline" }} onClick={() => ref.current?.click()} aria-label={`${hasPhoto ? "Cambiar" : "Poner"} la foto de ${name}`}>
        {pending ? "Subiendo..." : hasPhoto ? "Cambiar foto" : "Poner foto"}
      </Button>
      {error && <span role="alert" style={{ fontSize: "0.8rem", color: "var(--c-bad-text)" }}>{error}</span>}
    </>
  );
}
