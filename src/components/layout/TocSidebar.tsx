import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  label: string;
}

/** Los seis capítulos de la historia principal, en orden de lectura. */
export const CHAPTERS: ReadonlyArray<TocItem> = [
  { id: 'desafio', label: 'El desafío' },
  { id: 'datos', label: 'Los datos' },
  { id: 'probamos', label: 'Probamos los métodos' },
  { id: 'descubrimos', label: 'Lo que descubrimos' },
  { id: 'decision', label: 'La decisión' },
  { id: 'experimenta', label: 'Experimenta' },
];

/** Entrada secundaria hacia el anexo académico. */
export const ANNEX_ITEM: TocItem = { id: 'anexo', label: 'Profundiza' };

export const DEFAULT_TOC: ReadonlyArray<TocItem> = CHAPTERS;

/**
 * Tracks which section anchor is currently in view. Returns the active id
 * (empty string when none). Uses IntersectionObserver so it stays cheap.
 */
export function useActiveSection(
  ids: ReadonlyArray<string>,
  rootMargin = '-40% 0px -55% 0px',
): string {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') return;

    const elements: HTMLElement[] = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el instanceof HTMLElement) elements.push(el);
    }
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const first = visible[0];
        if (first && first.target instanceof HTMLElement) {
          setActive(first.target.id);
        }
      },
      { rootMargin, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return active;
}

/** Progreso de lectura del documento completo, entre 0 y 1. */
function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;

    const update = (): void => {
      frame = 0;
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? window.scrollY / total : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
    };

    const onScroll = (): void => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}

export interface TocSidebarProps {
  items?: ReadonlyArray<TocItem>;
  className?: string;
  ariaLabel?: string;
}

/**
 * Navegación de la historia. En escritorio: lista vertical con los seis
 * capítulos numerados y la entrada secundaria "Profundiza" (anexo). En
 * móvil: barra fija inferior con progreso de lectura, indicador
 * "Capítulo X de 6" y botones Anterior/Siguiente.
 */
export function TocSidebar({
  items = DEFAULT_TOC,
  className,
  ariaLabel = 'Capítulos de la historia',
}: TocSidebarProps) {
  const ordered: ReadonlyArray<TocItem> = [...items, ANNEX_ITEM];
  const ids = ordered.map((i) => i.id);
  const active = useActiveSection(ids);
  const progress = useReadingProgress();

  const activeIndex = ordered.findIndex((i) => i.id === active);
  const currentIndex = activeIndex === -1 ? 0 : activeIndex;
  const prev = currentIndex > 0 ? ordered[currentIndex - 1] : undefined;
  const next =
    currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : undefined;
  const isAnnexActive = ordered[currentIndex]?.id === ANNEX_ITEM.id;
  const indicator = isAnnexActive
    ? 'Anexo'
    : `Capítulo ${currentIndex + 1} de ${items.length}`;

  const desktopClasses = ['hidden w-full text-sm lg:block', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Escritorio: lista de capítulos + anexo */}
      <nav className={desktopClasses} aria-label={ariaLabel}>
        <ul className="flex flex-col gap-1">
          {items.map((item, idx) => {
            const isActive = item.id === active;
            const linkClasses = [
              'flex items-baseline gap-2 rounded-md px-3 py-1.5 transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              isActive
                ? 'bg-blue-50 font-semibold text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ');
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={linkClasses}
                >
                  <span
                    aria-hidden="true"
                    className={
                      'font-mono text-xs ' +
                      (isActive ? 'text-blue-500' : 'text-slate-400')
                    }
                  >
                    {idx + 1}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 border-t border-slate-200 pt-3">
          <a
            href={`#${ANNEX_ITEM.id}`}
            aria-current={active === ANNEX_ITEM.id ? 'location' : undefined}
            className={[
              'block rounded-md px-3 py-1.5 text-xs uppercase tracking-wide transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              active === ANNEX_ITEM.id
                ? 'bg-blue-50 font-semibold text-blue-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
            ].join(' ')}
          >
            {ANNEX_ITEM.label} ↓
          </a>
        </div>
      </nav>

      {/* Móvil: barra fija inferior con progreso y paginación */}
      <nav
        aria-label="Progreso de lectura"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
      >
        <div
          className="h-1 w-full bg-slate-200"
          role="progressbar"
          aria-label="Progreso de lectura"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full bg-blue-600 transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2">
          {prev ? (
            <a
              href={`#${prev.id}`}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              ← Anterior
            </a>
          ) : (
            <span className="px-3 py-1.5 text-sm text-slate-300">← Anterior</span>
          )}
          <span className="truncate text-xs font-semibold uppercase tracking-wide text-slate-600">
            {indicator}
          </span>
          {next ? (
            <a
              href={`#${next.id}`}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Siguiente →
            </a>
          ) : (
            <span className="px-3 py-1.5 text-sm text-slate-300">Siguiente →</span>
          )}
        </div>
      </nav>
    </>
  );
}

export default TocSidebar;
