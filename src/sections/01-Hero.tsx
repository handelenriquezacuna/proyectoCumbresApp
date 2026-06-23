import { Button } from '@/components/ui/Button';

/**
 * Sección de apertura del informe. Presenta la identidad del proyecto, el curso
 * y el grupo responsable, y ofrece un CTA que ancla a la primera sección
 * temática ("#conceptos"). El hook narrativo sintetiza la motivación del
 * estudio en dos enunciados.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="scroll-mt-24 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-16 text-white sm:py-24"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-300 sm:text-sm">
          Universidad Fidélitas · MA-108 Métodos Numéricos · Grupo 3
        </p>
        <h1
          id="hero-title"
          className="mb-4 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
        >
          <span aria-hidden="true">⚡</span> Proyecto Cumbres
        </h1>
        <p className="mb-8 text-lg text-slate-200 sm:text-xl md:text-2xl">
          Predicción de demanda eléctrica en data centers
        </p>
        <p className="mx-auto mb-10 max-w-2xl text-sm text-slate-300 sm:text-base">
          El consumo energético de un data center Tier III sigue patrones
          horarios estables que pueden modelarse con métodos numéricos
          clásicos (Uptime Institute, 2024). Este informe interactivo recorre
          los fundamentos, aplica cuatro técnicas al caso Cumbres y compara
          sus errores sobre datos calibrados con la literatura del sector.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#conceptos"
            aria-label="Ir a la sección Conceptos Fundamentales"
            className="inline-block"
          >
            <Button variant="primary" className="px-5 py-3 text-base">
              Comenzar el recorrido ↓
            </Button>
          </a>
          <a href="#caso" aria-label="Ir al Caso Cumbres" className="inline-block">
            <Button
              variant="ghost"
              className="border-slate-300 bg-white/10 px-5 py-3 text-base text-white hover:bg-white/20"
            >
              Ver caso Cumbres →
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
