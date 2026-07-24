import {
  ANNEX_ITEM,
  CHAPTERS,
  useActiveSection,
} from '@/components/layout/TocSidebar';

const HEADER_IDS: ReadonlyArray<string> = [
  ...CHAPTERS.map((c) => c.id),
  ANNEX_ITEM.id,
];

/**
 * Encabezado compacto y pegajoso. Marca ("⚡ Cumbres", sin h1: el h1 vive en
 * "El desafío"), indicador "Capítulo X de 6" sincronizado con el scroll y un
 * acceso directo a la metodología (anexo).
 */
export function Header() {
  const active = useActiveSection(HEADER_IDS);
  const chapterIndex = CHAPTERS.findIndex((c) => c.id === active);
  const chapter = chapterIndex === -1 ? undefined : CHAPTERS[chapterIndex];

  const indicator =
    active === ANNEX_ITEM.id
      ? 'Anexo · Profundiza en el proyecto'
      : chapter
        ? `Capítulo ${chapterIndex + 1} de ${CHAPTERS.length} · ${chapter.label}`
        : `Capítulo 1 de ${CHAPTERS.length} · ${CHAPTERS[0]?.label ?? ''}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <a
          href="#desafio"
          className="text-lg font-bold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">⚡</span> Cumbres
        </a>
        <p
          aria-live="polite"
          className="hidden truncate text-xs font-medium uppercase tracking-wide text-slate-500 sm:block"
        >
          {indicator}
        </p>
        <a
          href="#anexo"
          className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Metodología
        </a>
      </div>
    </header>
  );
}

export default Header;
