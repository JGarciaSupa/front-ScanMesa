interface DashboardHeaderProps {
  userName: string | undefined;
  currentDate: string;
}

export function DashboardHeader({ userName, currentDate }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {userName ? `¡Hola, ${userName}! 👋` : 'Resumen de Hoy'}
        </h2>
        <p className="text-sm font-medium text-slate-500 capitalize mt-1">
          {currentDate}
        </p>
      </div>
    </div>
  );
}
