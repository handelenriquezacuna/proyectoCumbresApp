export interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = '⚡ Cumbres — Demand Forecasting',
  subtitle = 'Predicción de demanda eléctrica en data centers — MA-108 Métodos Numéricos',
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
        <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">
          {title}
        </h1>
        <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">{subtitle}</p>
      </div>
    </header>
  );
}

export default Header;
