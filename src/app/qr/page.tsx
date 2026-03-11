import dynamic from "next/dynamic";
import { QrCode, ScanLine, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// El scanner usa APIs del navegador → solo client-side
const QrScanner = dynamic(
  () => import("./QrScanner").then((m) => m.QrScanner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-10 rounded-md bg-muted animate-pulse" />
    ),
  }
);

export default function QRPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <Badge variant="outline" className="gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Sin mesa asignada
          </Badge>

          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary">
            <QrCode className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Escanea el código QR
            </h1>
            <p className="text-sm text-muted-foreground">
              Para ver el menú necesitas escanear el QR de tu mesa.
            </p>
          </div>
        </CardHeader>

        <CardContent className="pb-2 space-y-4">
          <Separator />

          {/* Pasos */}
          <ol className="space-y-3">
            {[
              "Abre la cámara de tu teléfono",
              "Apunta al código QR de tu mesa",
              "Toca el enlace que aparece en pantalla",
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>

          <Separator />

          {/* Escáner integrado */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              O escanea directamente desde aquí
            </p>
            <QrScanner />
          </div>
        </CardContent>

        <CardFooter className="flex items-center gap-2 mt-2">
          <ScanLine className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Cada código QR está vinculado a una mesa específica.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
