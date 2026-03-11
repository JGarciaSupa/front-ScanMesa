"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScannerState = "idle" | "scanning" | "error";

export function QrScanner() {
  const router = useRouter();
  const [state, setState] = useState<ScannerState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleScan(results: { rawValue: string }[]) {
    const raw = results?.[0]?.rawValue;
    if (!raw) return;

    try {
      const url = new URL(raw);
      // Acepta URLs relativas al mismo origen o absolutas que contengan /qr/
      const match = url.pathname.match(/^\/qr\/(.+)$/);
      if (match) {
        router.push(`/qr/${match[1]}`);
        return;
      }
    } catch {
      // Si no es una URL completa, intenta como ruta relativa
      const match = raw.match(/\/qr\/(.+)/);
      if (match) {
        router.push(`/qr/${match[1]}`);
        return;
      }
    }

    setErrorMsg("El código QR no corresponde a una mesa válida.");
    setState("error");
  }

  function handleError(err: unknown) {
    const msg =
      err instanceof Error ? err.message : "No se pudo acceder a la cámara.";
    setErrorMsg(msg);
    setState("error");
  }

  if (state === "idle") {
    return (
      <Button
        className="w-full gap-2"
        onClick={() => setState("scanning")}
      >
        <Camera className="w-4 h-4" />
        Abrir cámara para escanear
      </Button>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2.5">
          <CameraOff className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive leading-relaxed">{errorMsg}</p>
        </div>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => { setErrorMsg(""); setState("scanning"); }}
        >
          <Camera className="w-4 h-4" />
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  // state === "scanning"
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border bg-muted aspect-square w-full">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{ facingMode: "environment" }}

          styles={{
            container: { width: "100%", height: "100%" },
            video: { width: "100%", height: "100%", objectFit: "cover" },
          }}
        />
        {/* Loading overlay mientras arranca la cámara */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none [&:has(+video)]:hidden">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setState("idle")}
      >
        <CameraOff className="w-4 h-4" />
        Cancelar
      </Button>
    </div>
  );
}
