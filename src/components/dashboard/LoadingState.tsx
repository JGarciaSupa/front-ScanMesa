import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col h-[400px] items-center justify-center gap-4 animate-pulse">
      <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      <p className="text-slate-400 font-medium">Cargando estadísticas...</p>
    </div>
  );
}
