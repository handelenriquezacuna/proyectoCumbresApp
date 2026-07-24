import { useMemo, useState, type ReactNode } from 'react';
import { CUMBRES_POINTS, DATASET_METADATA } from '@/lib/data/cumbresDataset';
import { fitLagrange } from '@/lib/methods/lagrange';
import { fitNewton } from '@/lib/methods/newton';
import { Slider } from '@/components/ui/Slider';
import { fmtTrunc5 } from '@/lib/format';
import { ExcelSheet, type ExcelRow } from '@/components/excel/ExcelSheet';
import {
  TARGET_HOUR,
  TARGET_TRUTH_KW,
  linearInterpolate,
  neighbors,
  pickNearestN,
  sampleFit,
} from '@/components/walkthrough/helpers';
import { MiniChart } from '@/components/walkthrough/MiniChart';
import { SectionAnchor } from '@/components/layout/SectionAnchor';
import { ERRORES, NEWTON_14_5 } from '@/lib/machote/canonical';

/* -------------------------------------------------------------------------- */
/* Subsección con estructura Pregunta → interacción → resultado → interpretación */
/* -------------------------------------------------------------------------- */

function Subsection({
  id,
  question,
  children,
}: {
  id: string;
  question: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className="mt-10 scroll-mt-24 border-t border-slate-200 pt-8 first:mt-0 first:border-t-0 first:pt-0"
    >
      <h3 className="mb-4 text-xl font-semibold text-slate-900">{question}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3.1 — El problema                                                          */
/* -------------------------------------------------------------------------- */

function SubProblema() {
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));
  return (
    <Subsection id="probamos-problema" question="¿Qué valor buscamos exactamente?">
      <p className="text-base leading-relaxed text-slate-700">
        Son las 14:30 del martes en <strong>{DATASET_METADATA.company}</strong>.
        El operador de turno necesita anticipar la carga eléctrica para
        programar el sistema de enfriamiento durante la próxima media hora,
        pero el SCADA solo registró las mediciones a las 14:00 y 15:00 en
        punto.
      </p>
      <p className="text-base leading-relaxed text-slate-700">
        Tenemos <strong>24 puntos discretos</strong>, uno por hora, y
        necesitamos un valor en{' '}
        <span className="rounded bg-yellow-100 px-1 font-mono font-semibold text-yellow-900">
          t = 14.5
        </span>
        . ¿Qué hacemos?
      </p>
      <MiniChart
        observed={observed}
        fits={[]}
        highlightX={TARGET_HOUR}
        highlightY={TARGET_TRUTH_KW}
        ariaLabel="Gráfica con las 24 mediciones observadas de carga en kilovatios y un punto amarillo en la hora 14.5, el instante sin medición que se desea estimar"
      />
      <p className="text-sm italic text-slate-500">
        El punto amarillo marca el instante que queremos estimar. No tenemos
        medición ahí — todo lo que hay son los 24 círculos rojos.
      </p>
    </Subsection>
  );
}

/* -------------------------------------------------------------------------- */
/* 3.2 — Línea recta                                                          */
/* -------------------------------------------------------------------------- */

function SubLineaRecta() {
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));
  const { left, right } = neighbors(CUMBRES_POINTS, TARGET_HOUR) ?? {
    left: CUMBRES_POINTS[14]!,
    right: CUMBRES_POINTS[15]!,
  };
  const estimate = linearInterpolate(left, right, TARGET_HOUR);
  const lineSeries = [
    { x: left.x, y: left.y },
    { x: right.x, y: right.y },
  ];
  const errorPct = Math.abs((estimate - TARGET_TRUTH_KW) / TARGET_TRUTH_KW) * 100;

  return (
    <Subsection id="probamos-lineal" question="¿Basta con una línea recta?">
      <p className="text-base leading-relaxed text-slate-700">
        La solución más sencilla sería conectar las mediciones de las 14:00 y
        las 15:00 con una línea recta. Entre las{' '}
        <span className="font-mono">
          {left.x}:00 ({left.y} kW)
        </span>{' '}
        y las{' '}
        <span className="font-mono">
          {right.x}:00 ({right.y} kW)
        </span>
        , ¿qué valor toma a la mitad?
      </p>
      <MiniChart
        observed={observed}
        fits={[{ name: 'Interpolación lineal', color: '#0ea5e9', data: lineSeries }]}
        highlightX={TARGET_HOUR}
        highlightY={estimate}
        ariaLabel="Gráfica que compara las mediciones observadas en kilovatios con la recta estimada entre las 14:00 y las 15:00; el punto amarillo marca la estimación a las 14:30"
      />
      <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        <p className="font-semibold">Resultado lineal a las 14:30</p>
        <p className="mt-1">
          Estimación: <span className="font-mono">{fmtTrunc5(estimate)}</span> kW · Error
          aproximado vs. verdad sintética:{' '}
          <span className="font-mono">{fmtTrunc5(errorPct)}%</span>
        </p>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        Funciona, pero tiene una limitación: asume que entre cada hora la
        carga cambia linealmente. En la realidad los centros de datos tienen
        rampas suaves con curvatura. Necesitamos algo que respete la{' '}
        <em>forma</em> de la curva, no solo los extremos.
      </p>
    </Subsection>
  );
}

/* -------------------------------------------------------------------------- */
/* 3.3 — Newton con N puntos                                                  */
/* -------------------------------------------------------------------------- */

function SubNewton() {
  const [nPoints, setNPoints] = useState(5);
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));

  const selected = useMemo(
    () => pickNearestN(CUMBRES_POINTS, TARGET_HOUR, nPoints),
    [nPoints],
  );

  const fit = useMemo(() => fitNewton(selected), [selected]);
  const [xMin, xMax] = useMemo<[number, number]>(() => {
    const first = selected[0]?.x ?? 0;
    const last = selected[selected.length - 1]?.x ?? 23;
    return [Math.max(0, first - 0.5), Math.min(23, last + 0.5)];
  }, [selected]);

  const fitSeries = useMemo(
    () => sampleFit(fit.evaluate, xMin, xMax, 120, [1100, 1600]),
    [fit, xMin, xMax],
  );

  const estimate = fit.evaluate(TARGET_HOUR);

  return (
    <Subsection
      id="probamos-newton"
      question="¿Y si el polinomio pasa por varios vecinos?"
    >
      <p className="text-base leading-relaxed text-slate-700">
        Newton construye un polinomio que pasa exactamente por <em>todos</em>{' '}
        los puntos que le demos. Mientras más puntos, mayor grado y mayor
        flexibilidad para seguir la curva. Mueve el control y observa cómo
        cambia el ajuste:
      </p>
      <Slider
        label="Número de puntos vecinos a usar"
        min={2}
        max={9}
        step={1}
        value={nPoints}
        onChange={setNPoints}
        format={(v) => `${v} puntos`}
      />
      <MiniChart
        observed={observed}
        fits={[
          {
            name: `Newton — grado ${selected.length - 1}`,
            color: '#7c3aed',
            data: fitSeries.map((d) => ({ x: d.x, y: d.y })),
          },
        ]}
        highlightX={TARGET_HOUR}
        highlightY={estimate}
        ariaLabel="Gráfica que compara las mediciones observadas en kilovatios con la curva estimada por Newton usando los puntos vecinos elegidos; el punto amarillo marca la estimación a las 14:30"
      />
      <div className="rounded-md border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
        <p className="font-semibold">Estimación a las 14:30</p>
        <p className="mt-1">
          Con {nPoints} puntos vecinos: <span className="font-mono">{fmtTrunc5(estimate)}</span> kW ·
          Polinomio de grado <span className="font-mono">{selected.length - 1}</span>
        </p>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        Con <strong>5 nodos vecinos</strong> (las horas 12 a 16), la
        estimación es{' '}
        <span className="font-mono font-semibold">
          {fmtTrunc5(NEWTON_14_5.image)} kW
        </span>{' '}
        — el mismo valor de la hoja de cálculo del curso. Newton usa{' '}
        <strong>diferencias divididas</strong>: si más adelante agregamos un
        punto, solo computamos una columna nueva — no rehacemos todo. Eso lo
        hace eficiente para extender el ajuste de forma incremental.
      </p>
    </Subsection>
  );
}

/* -------------------------------------------------------------------------- */
/* 3.4 — Lagrange = Newton                                                    */
/* -------------------------------------------------------------------------- */

function SubLagrange() {
  const n = 5;
  const selected = pickNearestN(CUMBRES_POINTS, TARGET_HOUR, n);
  const newton = fitNewton(selected);
  const lagrange = fitLagrange(selected);

  const xs = [13.0, 13.25, 13.5, 13.75, 14.0, 14.25, 14.5, 14.75, 15.0, 15.25, 15.5];
  const rows = xs.map((x) => ({
    x,
    newton: newton.evaluate(x),
    lagrange: lagrange.evaluate(x),
    diff: Math.abs(newton.evaluate(x) - lagrange.evaluate(x)),
  }));

  const lagrangeSheet: ReadonlyArray<ExcelRow> = [
    [
      { value: 'Hora', kind: 'header' },
      { value: 'Newton (kW)', kind: 'header' },
      { value: 'Lagrange (kW)', kind: 'header' },
      { value: '|diferencia|', kind: 'header' },
    ],
    ...rows.map(
      (r): ExcelRow => [
        { value: r.x, kind: 'input' },
        { value: r.newton },
        { value: r.lagrange },
        { value: r.diff < 1e-9 ? '< 1e-9' : r.diff.toExponential(2) },
      ],
    ),
  ];

  const newtonSeries = sampleFit(newton.evaluate, 12, 17, 80, [1100, 1600]);
  const lagrangeSeries = sampleFit(lagrange.evaluate, 12, 17, 80, [1100, 1600]);
  const nvl = ERRORES.newtonVsLagrange;

  return (
    <Subsection
      id="probamos-lagrange"
      question="¿Lagrange da un resultado distinto?"
    >
      <p className="text-base leading-relaxed text-slate-700">
        Lagrange resuelve el mismo problema con otra ecuación: combina los
        valores observados con polinomios "cardinales" <code>L_k(x)</code> que
        valen 1 en su nodo y 0 en los demás.
      </p>
      <p className="text-base leading-relaxed text-slate-700">
        El <strong>teorema de unicidad del polinomio interpolante</strong>{' '}
        garantiza que ambos métodos producen <em>exactamente</em> el mismo
        polinomio. Observa la evidencia numérica con 5 puntos:
      </p>
      <ExcelSheet
        rows={lagrangeSheet}
        ariaLabel="Comparación numérica Newton vs Lagrange"
      />
      <MiniChart
        observed={CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }))}
        fits={[
          { name: 'Newton', color: '#7c3aed', data: newtonSeries.map((d) => ({ x: d.x, y: d.y })) },
          {
            name: 'Lagrange',
            color: '#ec4899',
            dashed: true,
            data: lagrangeSeries.map((d) => ({ x: d.x, y: d.y })),
          },
        ]}
        highlightX={TARGET_HOUR}
        highlightY={newton.evaluate(TARGET_HOUR)}
        ariaLabel="Gráfica que compara las curvas estimadas por Newton y Lagrange, superpuestas por ser el mismo polinomio, con las mediciones observadas en kilovatios"
      />
      <p className="text-sm leading-relaxed text-slate-600">
        Las dos curvas se superponen perfectamente. En la hoja de cálculo del
        curso, con valores truncados a 5 decimales, Newton entrega{' '}
        <span className="font-mono">{fmtTrunc5(nvl.newton)}</span> kW y
        Lagrange <span className="font-mono">{fmtTrunc5(nvl.lagrange)}</span>{' '}
        kW: una diferencia de{' '}
        <span className="font-mono">{nvl.absoluteDifference}</span> kW
        atribuible solo al redondeo. Elegimos entre ambos por{' '}
        <em>conveniencia operativa</em>, no por precisión.
      </p>
    </Subsection>
  );
}

/* -------------------------------------------------------------------------- */
/* Sección                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Capítulo 3 (#probamos): la historia prueba las primeras soluciones en
 * scroll continuo. Cada subsección sigue la estructura Pregunta →
 * interacción → resultado → interpretación, reutilizando la lógica y los
 * gráficos del antiguo recorrido guiado (pasos 1 a 4 del wizard).
 */
export function Probamos() {
  return (
    <SectionAnchor id="probamos" accent="metodos" deferOffscreen>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-metodos">
          Capítulo 3 de 6
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Probamos los métodos
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-700">
          De la solución más simple a la más elaborada: cada intento responde
          una pregunta y deja planteada la siguiente.
        </p>
      </header>

      <SubProblema />
      <SubLineaRecta />
      <SubNewton />
      <SubLagrange />
    </SectionAnchor>
  );
}

export default Probamos;
