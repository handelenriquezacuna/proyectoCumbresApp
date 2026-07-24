import { useEffect, useState, type ReactNode, type SyntheticEvent } from 'react';
import { SectionAnchor } from '@/components/layout/SectionAnchor';
import { Aplicaciones } from '@/sections/anexo/Aplicaciones';
import { Conceptos } from '@/sections/anexo/Conceptos';
import { Conclusiones } from '@/sections/anexo/Conclusiones';
import { Futuro } from '@/sections/anexo/Futuro';
import { HojaCalculo } from '@/sections/anexo/HojaCalculo';
import { Implementacion } from '@/sections/anexo/Implementacion';
import { Metodos } from '@/sections/anexo/Metodos';
import { QuizSection } from '@/sections/anexo/Quiz';

type AnnexItem = {
  /** id del ancla histórica que vive dentro del contenido (#conceptos, …). */
  id: string;
  title: string;
  description: string;
  render: () => ReactNode;
};

/** Material académico completo; cada entrada conserva su id histórico. */
const ANNEX_ITEMS: ReadonlyArray<AnnexItem> = [
  {
    id: 'conceptos',
    title: 'Conceptos fundamentales',
    description: 'Demanda vs. energía, series discretas y por qué importa predecir.',
    render: () => <Conceptos />,
  },
  {
    id: 'metodos',
    title: 'Métodos y técnicas',
    description: 'Newton, Lagrange, mínimos cuadrados y Runge con sus ecuaciones.',
    render: () => <Metodos />,
  },
  {
    id: 'aplicaciones',
    title: 'Aplicaciones en data centers',
    description: 'Pronóstico horario, HVAC, tarifa T-MT y detección de picos.',
    render: () => <Aplicaciones />,
  },
  {
    id: 'implementacion',
    title: 'Implementación numérica',
    description: 'Flujo Excel + GeoGebra + TypeScript y las métricas de validación.',
    render: () => <Implementacion />,
  },
  {
    id: 'hoja',
    title: 'Hoja de cálculo',
    description: 'El machote de Excel del curso replicado celda por celda.',
    render: () => <HojaCalculo />,
  },
  {
    id: 'futuro',
    title: 'Perspectivas futuras',
    description: 'LSTM, BMS en tiempo real, cargas de IA y sostenibilidad.',
    render: () => <Futuro />,
  },
  {
    id: 'conclusiones',
    title: 'Conclusiones académicas',
    description: 'Las tres conclusiones formales del informe.',
    render: () => <Conclusiones />,
  },
  {
    id: 'quiz',
    title: 'Autoevaluación',
    description: 'Cinco preguntas rápidas para comprobar lo aprendido.',
    render: () => <QuizSection />,
  },
];

const cardDomId = (id: string): string => `anexo-card-${id}`;

/**
 * Sección final (#anexo): "Profundiza en el proyecto". Reúne todo el
 * material académico en tarjetas <details> colapsadas por defecto
 * (progressive disclosure). Los ids históricos (#conceptos, #hoja, #quiz,
 * etc.) siguen existiendo dentro de cada tarjeta: al navegar a uno de esos
 * anclajes, la tarjeta correspondiente se abre y se desplaza a la vista.
 */
export function Anexo() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const openFromHash = (): void => {
      const hash = window.location.hash.replace('#', '');
      if (!ANNEX_ITEMS.some((item) => item.id === hash)) return;
      setOpenMap((prev) => ({ ...prev, [hash]: true }));
      // El contenido se monta al abrir; esperamos un frame antes de
      // desplazar la tarjeta (siempre montada) a la vista.
      window.setTimeout(() => {
        document
          .getElementById(cardDomId(hash))
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  const handleToggle =
    (id: string) =>
    (e: SyntheticEvent<HTMLDetailsElement>): void => {
      const isOpen = e.currentTarget.open;
      setOpenMap((prev) => (prev[id] === isOpen ? prev : { ...prev, [id]: isOpen }));
    };

  return (
    <SectionAnchor id="anexo" accent="hoja">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-hoja">
          Anexo académico
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Profundiza en el proyecto
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-700">
          Todo el material académico del informe — conceptos, ecuaciones,
          hoja de cálculo, conclusiones y autoevaluación — está aquí,
          completo. Expande el bloque que quieras revisar.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {ANNEX_ITEMS.map((item) => {
          const isOpen = openMap[item.id] === true;
          return (
            <details
              key={item.id}
              id={cardDomId(item.id)}
              open={isOpen}
              onToggle={handleToggle(item.id)}
              className="group scroll-mt-24 rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-block text-slate-400 transition-transform group-open:rotate-90"
                >
                  ▸
                </span>
                <span>
                  <span className="block text-base font-semibold text-slate-900">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-500">
                    {item.description}
                  </span>
                </span>
              </summary>
              <div className="border-t border-slate-200 px-4 pb-4 sm:px-6">
                {isOpen && item.render()}
              </div>
            </details>
          );
        })}
      </div>
    </SectionAnchor>
  );
}

export default Anexo;
