import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  label: string;
}

export const DEFAULT_TOC: ReadonlyArray<TocItem> = [
  { id: 'conceptos', label: 'Conceptos' },
  { id: 'metodos', label: 'Métodos' },
  { id: 'aplicaciones', label: 'Aplicaciones' },
  { id: 'caso', label: 'Caso Cumbres' },
  { id: 'implementacion', label: 'Implementación' },
  { id: 'futuro', label: 'Futuro' },
  { id: 'conclusiones', label: 'Conclusiones' },
  { id: 'prueba', label: 'Pruébalo tú mismo' },
  { id: 'quiz', label: 'Quiz' },
];

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

export interface TocSidebarProps {
  items?: ReadonlyArray<TocItem>;
  className?: string;
  ariaLabel?: string;
}

export function TocSidebar({
  items = DEFAULT_TOC,
  className,
  ariaLabel = 'Índice de secciones',
}: TocSidebarProps) {
  const ids = items.map((i) => i.id);
  const active = useActiveSection(ids);

  const classes = [
    'w-full text-sm',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={classes} aria-label={ariaLabel}>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = item.id === active;
          const linkClasses = [
            'block rounded-md px-3 py-1.5 transition-colors',
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
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default TocSidebar;
