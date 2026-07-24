import { useMemo, useState } from 'react';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { fitNewton } from '@/lib/methods/newton';
import { Slider } from '@/components/ui/Slider';
import { fmtTrunc5, formatNumber } from '@/lib/format';
import {
  TARGET_HOUR,
  pickNearestN,
  sampleFit,
} from '@/components/walkthrough/helpers';
import { MiniChart } from '@/components/walkthrough/MiniChart';
import { SectionAnchor } from '@/components/layout/SectionAnchor';

/* -------------------------------------------------------------------------- */
/* 4.1 — Runge: 5 puntos vs 24 puntos                                         */
/* -------------------------------------------------------------------------- */

function RungeExperiment() {
  const [useAll, setUseAll] = useState(false);
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));

  const fit5 = useMemo(
    () => fitNewton(pickNearestN(CUMBRES_POINTS, TARGET_HOUR, 5)),
    [],
  );
  const fit24 = useMemo(() => fitNewton(CUMBRES_POINTS), []);

  const series5 = useMemo(
    () => sampleFit(fit5.evaluate, 11.5, 16.5, 120, [1100, 1600]),
    [fit5],
  );
  const series24 = useMemo(
    () => sampleFit(fit24.evaluate, 0, 23, 400, [1100, 1600]),
    [fit24],
  );
  const peakOscillation = Math.max(...series24.map((d) => d.raw));
  const valleyOscillation = Math.min(...series24.map((d) => d.raw));

  const toggleButton = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        // min-h-10 asegura un objetivo táctil ≥40px en móvil; en sm+ vuelve
        // al alto compacto original.
        'inline-flex min-h-10 items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:min-h-0 ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ' +
        (active
          ? 'bg-amber-600 text-white shadow-sm'
          : 'bg-white text-slate-700 hover:bg-amber-100')
      }
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-4 sm:p-5">
      <p className="text-base leading-relaxed text-slate-700">
        Si Newton funciona bien con 5 puntos, debería funcionar mejor con los
        24, ¿no? Compara ambos ajustes y observa los extremos del gráfico:
      </p>
      <div
        className="mt-3 inline-flex gap-1 rounded-lg border border-amber-300 bg-amber-100/70 p-1"
        role="group"
        aria-label="Cantidad de puntos usados por Newton"
      >
        {toggleButton('5 puntos vecinos', !useAll, () => setUseAll(false))}
        {toggleButton('Los 24 puntos', useAll, () => setUseAll(true))}
      </div>
      <div className="mt-3">
        <MiniChart
          observed={observed}
          ariaLabel={
            useAll
              ? 'Gráfica que compara las mediciones observadas en kilovatios con la curva estimada por Newton sobre los 24 puntos, que oscila en los extremos del día'
              : 'Gráfica que compara las mediciones observadas en kilovatios con la curva estimada por Newton sobre 5 puntos vecinos, suave alrededor de las 14:30'
          }
          fits={
            useAll
              ? [
                  {
                    name: 'Newton — grado 23',
                    color: '#dc2626',
                    data: series24.map((d) => ({ x: d.x, y: d.y })),
                  },
                ]
              : [
                  {
                    name: 'Newton — 5 puntos (grado 4)',
                    color: '#7c3aed',
                    data: series5.map((d) => ({ x: d.x, y: d.y })),
                  },
                ]
          }
        />
      </div>
      {useAll ? (
        <div
          role="alert"
          className="mt-3 rounded-md border-l-4 border-amber-600 bg-amber-100 px-4 py-3 text-sm text-amber-900"
        >
          <p className="font-semibold">
            El polinomio comenzó a oscilar: esto se conoce como fenómeno de
            Runge.
          </p>
          <p className="mt-1 leading-relaxed">
            Cerca de los extremos del día, el polinomio de grado 23 oscila
            entre{' '}
            <span className="font-mono">{formatNumber(valleyOscillation, 0)}</span>{' '}
            kW y{' '}
            <span className="font-mono">{formatNumber(peakOscillation, 0)}</span>{' '}
            kW — valores sin sentido físico: la carga real nunca sale del
            rango 1240–1500 kW. El gráfico está recortado a [1100, 1600] para
            que siga siendo legible.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Con 5 puntos vecinos la curva es suave y estable alrededor de las
          14:30. Ahora prueba con los 24 puntos.
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Regla práctica: <strong>nunca uses más de 5–7 nodos</strong> para
        interpolación equiespaciada. Si necesitamos reconstruir la curva
        completa del día, hace falta otra herramienta.
      </p>
      <a href="#minimos-cuadrados" className="mt-4 inline-block">
        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
          Buscar una alternativa más estable ↓
        </span>
      </a>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4.2 — Mínimos cuadrados como solución                                      */
/* -------------------------------------------------------------------------- */

function LeastSquaresRescue() {
  const [degree, setDegree] = useState(3);
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));
  const fit = useMemo(() => fitLeastSquares(CUMBRES_POINTS, degree), [degree]);
  const series = useMemo(
    () => sampleFit(fit.evaluate, 0, 23, 200, [1100, 1600]),
    [fit],
  );

  return (
    <div id="minimos-cuadrados" className="mt-10 scroll-mt-24">
      <h3 className="mb-4 text-xl font-semibold text-slate-900">
        ¿Existe una curva que use los 24 puntos sin romperse?
      </h3>
      <div className="space-y-4">
        <p className="text-base leading-relaxed text-slate-700">
          Sí: mínimos cuadrados <strong>no exige</strong> pasar por todos los
          puntos. Busca el polinomio del grado que indiquemos que{' '}
          <em>minimiza la suma de errores cuadráticos</em>. La curva resulta
          suave, robusta al ruido, y refleja la tendencia global.
        </p>
        <Slider
          label="Grado del polinomio MMC"
          min={1}
          max={5}
          step={1}
          value={degree}
          onChange={setDegree}
          format={(v) => `grado ${v}`}
        />
        <MiniChart
          observed={observed}
          fits={[
            {
              name: `MMC grado ${degree}`,
              color: '#10b981',
              data: series.map((d) => ({ x: d.x, y: d.y })),
            },
          ]}
          highlightX={TARGET_HOUR}
          highlightY={fit.evaluate(TARGET_HOUR)}
          ariaLabel={`Gráfica que compara las mediciones observadas en kilovatios con la curva estimada por mínimos cuadrados de grado ${degree}; el punto amarillo marca la estimación a las 14:30`}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['mse', 'mae', 'mape', 'r2'] as const).map((k) => (
            <div
              key={k}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
            >
              <div className="font-semibold uppercase tracking-wide">{k}</div>
              <div className="mt-1 font-mono text-sm">
                {fmtTrunc5(fit.metrics[k])}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          A más grado, mejor ajuste — pero con rendimientos decrecientes. Para
          este conjunto de datos, <strong>grado 3</strong> ya captura la forma diurna;
          los grados 4 y 5 mejoran R² marginalmente.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sección                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Capítulo 4 (#descubrimos): el momento de tensión de la historia. La
 * intuición "más puntos = mejor predicción" se rompe con el fenómeno de
 * Runge (paso 5 del antiguo wizard + la advertencia de la vieja sección de
 * implementación), y mínimos cuadrados entra como la alternativa estable
 * (paso 6 del wizard).
 */
export function Descubrimos() {
  return (
    <SectionAnchor id="descubrimos" accent="implementacion" deferOffscreen>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-implementacion">
          Capítulo 4 de 6
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Lo que descubrimos
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-700">
          ¿Más puntos producen siempre una mejor predicción? Este experimento
          responde esa pregunta — y cambia el rumbo del proyecto.
        </p>
      </header>

      <RungeExperiment />
      <LeastSquaresRescue />
    </SectionAnchor>
  );
}

export default Descubrimos;
