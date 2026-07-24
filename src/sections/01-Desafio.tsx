import { Button } from '@/components/ui/Button';

const QUICK_FACTS: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Datos disponibles', value: '24 mediciones horarias' },
  { label: 'Valor que buscamos', value: 'demanda a las 14:30' },
  { label: 'Decisión final', value: 'elegir el método más apropiado' },
];

/**
 * Capítulo 1 (#desafio): apertura de la historia. Plantea la pregunta que
 * guía todo el sitio — cuánta energía necesitará Cumbres a las 14:30 — y
 * ofrece dos caminos: resolver el caso (historia principal) o ir directo a
 * la metodología y las referencias (anexo académico). Contiene el único h1
 * de la página.
 */
export function Desafio() {
  return (
    <section
      id="desafio"
      className="scroll-mt-24 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-16 text-white sm:py-24"
      aria-labelledby="desafio-title"
    >
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-300 sm:text-sm">
          Universidad Fidélitas · MA-108 Métodos Numéricos · Grupo 3
        </p>
        <h1
          id="desafio-title"
          className="mb-6 text-3xl font-bold leading-tight sm:text-5xl md:text-6xl"
        >
          ¿Cuánta energía necesitará Cumbres a las 14:30?
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
          Cumbres es un centro de datos Tier III ubicado ficticiamente en Belén,
          Heredia. Durante un día se registró su demanda eléctrica una vez por
          hora, pero el equipo de operación necesita conocer la carga estimada
          a las 14:30 para planificar los recursos de enfriamiento. El problema
          es sencillo de plantear, pero no tanto de resolver: entre las 14:00 y
          las 15:00 no existe una medición directa.
        </p>
        <ul className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {QUICK_FACTS.map((fact) => (
            <li
              key={fact.label}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-slate-100 sm:text-sm"
            >
              <span className="font-semibold text-blue-200">{fact.label}:</span>{' '}
              {fact.value}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#datos"
            aria-label="Ir al capítulo Los datos para resolver el caso"
            className="inline-block"
          >
            <Button variant="primary" className="px-5 py-3 text-base">
              Resolver el caso ↓
            </Button>
          </a>
          <a
            href="#anexo"
            aria-label="Ir al anexo con la metodología y las referencias"
            className="inline-block"
          >
            <Button
              variant="ghost"
              className="border-slate-300 bg-white/10 px-5 py-3 text-base text-white hover:bg-white/20"
            >
              Ver metodología y referencias →
            </Button>
          </a>
        </div>
        <p className="mt-10 text-xs text-slate-400">
          Caso académico ficticio construido con datos calibrados a partir de
          literatura del sector.
        </p>
      </div>
    </section>
  );
}

export default Desafio;
