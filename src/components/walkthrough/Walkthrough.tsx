import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CUMBRES_POINTS, DATASET_METADATA } from '@/lib/data/cumbresDataset';
import { fitLagrange } from '@/lib/methods/lagrange';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { fitNewton } from '@/lib/methods/newton';
import type { Point } from '@/lib/methods/types';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { formatNumber } from '@/lib/format';
import { linearInterpolate, neighbors, pickNearestN, sampleFit } from './helpers';
import { MiniChart } from './MiniChart';

/* -------------------------------------------------------------------------- */
/* Datos compartidos                                                          */
/* -------------------------------------------------------------------------- */

/** Hora ficticia para la cual el operador necesita estimar la carga. */
const TARGET_HOUR = 14.5;
/** "Verdad de campo" sintética para 14:30: media de las observaciones a 14 y 15. */
const TARGET_TRUTH_KW = (CUMBRES_POINTS[14]!.y + CUMBRES_POINTS[15]!.y) / 2; // 1497.5

/* -------------------------------------------------------------------------- */
/* Paso 1 — El problema                                                       */
/* -------------------------------------------------------------------------- */

function StepProblem() {
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));
  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        Son las 14:30 del martes en{' '}
        <strong>{DATASET_METADATA.company}</strong>. El operador de turno
        necesita anticipar la carga eléctrica para programar el sistema de
        enfriamiento durante la próxima media hora. Pero el SCADA solo
        registró las mediciones a las 14:00 y 15:00 en punto.
      </p>
      <p className="text-base leading-relaxed text-slate-700">
        Tenemos <strong>24 puntos discretos</strong>, uno por hora. El operador
        necesita un valor en{' '}
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
      />
      <p className="text-sm italic text-slate-500">
        El punto amarillo marca el instante que queremos estimar. No tenemos
        medición ahí — todo lo que hay son los 24 círculos rojos.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 2 — Interpolación lineal                                              */
/* -------------------------------------------------------------------------- */

function StepLinear() {
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
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        Lo primero que se nos ocurre: conectar los dos vecinos con una recta.
        Entre las{' '}
        <span className="font-mono">{left.x}:00 ({left.y} kW)</span> y las{' '}
        <span className="font-mono">{right.x}:00 ({right.y} kW)</span>, ¿qué
        valor toma a la mitad?
      </p>
      <MiniChart
        observed={observed}
        fits={[{ name: 'Interpolación lineal', color: '#0ea5e9', data: lineSeries }]}
        highlightX={TARGET_HOUR}
        highlightY={estimate}
      />
      <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        <p className="font-semibold">Resultado lineal a las 14:30</p>
        <p className="mt-1">
          Estimación: <span className="font-mono">{formatNumber(estimate, 1)}</span> kW · Error
          aproximado vs. verdad sintética:{' '}
          <span className="font-mono">{formatNumber(errorPct, 2)}%</span>
        </p>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        Funciona, pero asume que entre cada hora la carga cambia linealmente.
        En la realidad los data centers tienen rampas suaves con curvatura.
        Necesitamos algo que respete la <em>forma</em> de la curva, no solo
        los extremos.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 3 — Newton con N puntos                                               */
/* -------------------------------------------------------------------------- */

function StepNewton() {
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
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        Newton construye un polinomio que pasa exactamente por <em>todos</em>{' '}
        los puntos que le demos. Mientras más puntos, mayor grado, mayor
        flexibilidad para seguir la curva.
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
      />
      <div className="rounded-md border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
        <p className="font-semibold">Estimación a las 14:30</p>
        <p className="mt-1">
          Con {nPoints} puntos vecinos: <span className="font-mono">{formatNumber(estimate, 1)}</span> kW ·
          Polinomio de grado <span className="font-mono">{selected.length - 1}</span>
        </p>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        Newton usa <strong>diferencias divididas</strong>: si más adelante
        agregamos un punto, solo computamos una columna nueva — no rehacemos
        todo. Es lo que lo hace eficiente para extender el ajuste de forma
        incremental.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 4 — Lagrange = Newton                                                 */
/* -------------------------------------------------------------------------- */

function StepLagrange() {
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

  const newtonSeries = sampleFit(newton.evaluate, 12, 17, 80, [1100, 1600]);
  const lagrangeSeries = sampleFit(lagrange.evaluate, 12, 17, 80, [1100, 1600]);

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        Lagrange resuelve el mismo problema con otra ecuación: combina los
        valores observados con polinomios "cardinales" <code>L_k(x)</code> que
        valen 1 en su nodo y 0 en los demás.
      </p>
      <p className="text-base leading-relaxed text-slate-700">
        El <strong>teorema de unicidad del polinomio interpolante</strong>{' '}
        garantiza que ambos métodos producen <em>exactamente</em> el mismo
        polinomio. Veamos la evidencia numérica con 5 puntos:
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-700">
              <th className="px-3 py-2">Hora</th>
              <th className="px-3 py-2 text-right">Newton (kW)</th>
              <th className="px-3 py-2 text-right">Lagrange (kW)</th>
              <th className="px-3 py-2 text-right">|diferencia|</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r) => (
              <tr key={r.x} className="border-b border-slate-100">
                <td className="px-3 py-1.5">{formatNumber(r.x, 2)}</td>
                <td className="px-3 py-1.5 text-right">{formatNumber(r.newton, 4)}</td>
                <td className="px-3 py-1.5 text-right">{formatNumber(r.lagrange, 4)}</td>
                <td className="px-3 py-1.5 text-right text-emerald-700">
                  {r.diff < 1e-9 ? '< 1e-9' : r.diff.toExponential(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      />
      <p className="text-sm leading-relaxed text-slate-600">
        Las dos curvas se superponen perfectamente. La diferencia se debe solo
        a errores de redondeo de punto flotante (orden 10⁻⁹). Elegimos entre
        ambas por <em>conveniencia operativa</em>, no por precisión.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 5 — Runge                                                             */
/* -------------------------------------------------------------------------- */

function StepRunge() {
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));
  const fit = useMemo(() => fitNewton(CUMBRES_POINTS), []);
  const fitSeries = useMemo(
    () => sampleFit(fit.evaluate, 0, 23, 400, [1100, 1600]),
    [fit],
  );
  const fitSeriesRaw = useMemo(() => sampleFit(fit.evaluate, 22, 23, 80), [fit]);
  const peakOscillation = Math.max(...fitSeriesRaw.map((d) => d.raw));

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        Si Newton es bueno con 5 puntos, debería ser mejor con los 24, ¿no?{' '}
        <strong>No.</strong> Cuando los nodos están equiespaciados y subimos el
        grado, el polinomio oscila salvajemente cerca de los extremos del
        intervalo.
      </p>
      <MiniChart
        observed={observed}
        fits={[
          {
            name: 'Newton — grado 23',
            color: '#dc2626',
            data: fitSeries.map((d) => ({ x: d.x, y: d.y })),
          },
        ]}
      />
      <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
        <p className="font-semibold">⚠️ Fenómeno de Runge</p>
        <p className="mt-1">
          Entre las 22 y 23 horas, el polinomio de grado 23 alcanza{' '}
          <span className="font-mono">{formatNumber(peakOscillation, 0)}</span> kW —
          un valor físicamente imposible (la carga nunca pasa de 1500 kW). El
          gráfico está recortado a [1100, 1600] para que el lienzo siga siendo
          legible.
        </p>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        Regla práctica: <strong>nunca uses más de 5–7 nodos</strong> para
        interpolación equiespaciada. Si necesitás reconstruir la curva
        completa, hace falta otra herramienta.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 6 — Mínimos cuadrados                                                 */
/* -------------------------------------------------------------------------- */

function StepLeastSquares() {
  const [degree, setDegree] = useState(3);
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));
  const fit = useMemo(() => fitLeastSquares(CUMBRES_POINTS, degree), [degree]);
  const series = useMemo(
    () => sampleFit(fit.evaluate, 0, 23, 200, [1100, 1600]),
    [fit],
  );

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        Mínimos cuadrados <strong>no exige</strong> pasar por todos los puntos.
        Busca el polinomio del grado que indiquemos que <em>minimiza la suma
        de errores cuadráticos</em>. La curva resulta suave, robusta al ruido,
        y refleja la tendencia global.
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
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['mse', 'mae', 'mape', 'r2'] as const).map((k) => (
          <div
            key={k}
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
          >
            <div className="font-semibold uppercase tracking-wide">{k}</div>
            <div className="mt-1 font-mono text-sm">
              {formatNumber(fit.metrics[k], k === 'r2' ? 4 : 2)}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        A más grado, mejor ajuste — pero con rendimientos decrecientes. Para
        este dataset, <strong>grado 3</strong> ya captura la forma diurna; los
        grados 4 y 5 mejoran R² marginalmente.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 7 — Comparación                                                       */
/* -------------------------------------------------------------------------- */

function StepCompare() {
  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));
  const seven = useMemo(() => pickNearestN(CUMBRES_POINTS, TARGET_HOUR, 7), []);
  const newton7 = useMemo(() => fitNewton(seven), [seven]);
  const lagrange7 = useMemo(() => fitLagrange(seven), [seven]);
  const ls3 = useMemo(() => fitLeastSquares(CUMBRES_POINTS, 3), []);
  const ls5 = useMemo(() => fitLeastSquares(CUMBRES_POINTS, 5), []);

  const rows = [
    { name: 'Newton (7 pts)', fit: newton7, color: '#7c3aed', range: [11, 18] as [number, number] },
    { name: 'Lagrange (7 pts)', fit: lagrange7, color: '#ec4899', range: [11, 18] as [number, number] },
    { name: 'MMC grado 3', fit: ls3, color: '#10b981', range: [0, 23] as [number, number] },
    { name: 'MMC grado 5', fit: ls5, color: '#f59e0b', range: [0, 23] as [number, number] },
  ];

  const minMse = Math.min(...rows.map((r) => r.fit.metrics.mse));

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        Cuatro candidatos, todos evaluados contra los 24 puntos observados.
        ¿Cuál tiene mejor desempeño global?
      </p>
      <MiniChart
        observed={observed}
        fits={rows.map((r) => ({
          name: r.name,
          color: r.color,
          data: sampleFit(r.fit.evaluate, r.range[0], r.range[1], 200, [1100, 1600]).map((d) => ({
            x: d.x,
            y: d.y,
          })),
        }))}
        heightClass="h-72"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-700">
              <th className="px-3 py-2">Método</th>
              <th className="px-3 py-2 text-right">MSE</th>
              <th className="px-3 py-2 text-right">MAE</th>
              <th className="px-3 py-2 text-right">MAPE (%)</th>
              <th className="px-3 py-2 text-right">R²</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isBest = r.fit.metrics.mse === minMse;
              return (
                <tr
                  key={r.name}
                  className={`border-b border-slate-100 ${
                    isBest ? 'bg-emerald-50 font-semibold text-emerald-900' : ''
                  }`}
                >
                  <td className="px-3 py-1.5">
                    {r.name} {isBest && <span className="ml-1 text-emerald-600">★</span>}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono">
                    {formatNumber(r.fit.metrics.mse, 2)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono">
                    {formatNumber(r.fit.metrics.mae, 2)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono">
                    {formatNumber(r.fit.metrics.mape, 3)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono">
                    {formatNumber(r.fit.metrics.r2, 4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        Newton y Lagrange con 7 puntos centrados en 14:30 son <em>perfectos
        localmente</em>: MSE = 0 porque pasan por los 7 nodos exactos. Pero
        solo cubren una ventana corta. MMC grado 5 sacrifica algo de precisión
        local a cambio de <strong>cubrir las 24 horas</strong> con R² superior
        a 0.99.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 8 — Tu predicción                                                     */
/* -------------------------------------------------------------------------- */

function StepPredict() {
  const [hour, setHour] = useState(14.5);
  const [methodKey, setMethodKey] = useState<'newton5' | 'newton7' | 'ls3' | 'ls5'>('newton5');

  const observed = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));

  const result = useMemo<{ value: number; label: string; range: [number, number]; pts?: Point[] }>(() => {
    if (methodKey === 'newton5') {
      const pts = pickNearestN(CUMBRES_POINTS, hour, 5);
      const fit = fitNewton(pts);
      return {
        value: fit.evaluate(hour),
        label: 'Newton — 5 puntos vecinos',
        range: [Math.max(0, hour - 3), Math.min(23, hour + 3)] as [number, number],
        pts,
      };
    }
    if (methodKey === 'newton7') {
      const pts = pickNearestN(CUMBRES_POINTS, hour, 7);
      const fit = fitNewton(pts);
      return {
        value: fit.evaluate(hour),
        label: 'Newton — 7 puntos vecinos',
        range: [Math.max(0, hour - 4), Math.min(23, hour + 4)] as [number, number],
        pts,
      };
    }
    const degree = methodKey === 'ls3' ? 3 : 5;
    const fit = fitLeastSquares(CUMBRES_POINTS, degree);
    return {
      value: fit.evaluate(hour),
      label: `Mínimos cuadrados — grado ${degree}`,
      range: [0, 23],
    };
  }, [hour, methodKey]);

  const series = useMemo(() => {
    const fit = (() => {
      if (methodKey === 'newton5') return fitNewton(pickNearestN(CUMBRES_POINTS, hour, 5));
      if (methodKey === 'newton7') return fitNewton(pickNearestN(CUMBRES_POINTS, hour, 7));
      if (methodKey === 'ls3') return fitLeastSquares(CUMBRES_POINTS, 3);
      return fitLeastSquares(CUMBRES_POINTS, 5);
    })();
    return sampleFit(fit.evaluate, result.range[0], result.range[1], 160, [1100, 1600]);
  }, [hour, methodKey, result.range]);

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        Pone vos a la prueba el método: elegí una hora cualquiera y una
        técnica. El sistema computará la estimación al vuelo.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider
          label="Hora consultada"
          min={0}
          max={23}
          step={0.25}
          value={hour}
          onChange={setHour}
          format={(v) => {
            const h = Math.floor(v);
            const m = Math.round((v - h) * 60)
              .toString()
              .padStart(2, '0');
            return `${h.toString().padStart(2, '0')}:${m}`;
          }}
        />
        <Select
          label="Método"
          value={methodKey}
          onChange={(e) => setMethodKey(e.target.value as typeof methodKey)}
          options={[
            { value: 'newton5', label: 'Newton — 5 puntos vecinos' },
            { value: 'newton7', label: 'Newton — 7 puntos vecinos' },
            { value: 'ls3', label: 'Mínimos cuadrados grado 3' },
            { value: 'ls5', label: 'Mínimos cuadrados grado 5' },
          ]}
        />
      </div>
      <MiniChart
        observed={observed}
        fits={[
          {
            name: result.label,
            color: '#1d4ed8',
            data: series.map((d) => ({ x: d.x, y: d.y })),
          },
        ]}
        highlightX={hour}
        highlightY={result.value}
      />
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-semibold">Predicción operativa</p>
        <p className="mt-1">
          A las{' '}
          <span className="font-mono">
            {Math.floor(hour).toString().padStart(2, '0')}:
            {Math.round((hour - Math.floor(hour)) * 60)
              .toString()
              .padStart(2, '0')}
          </span>
          , {result.label} estima una carga de{' '}
          <span className="font-mono text-base font-bold">
            {formatNumber(result.value, 1)} kW
          </span>
          .
        </p>
        {result.pts && (
          <p className="mt-2 text-xs text-blue-800">
            Puntos usados: {result.pts.map((p) => `(${p.x}, ${p.y})`).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 9 — Veredicto                                                         */
/* -------------------------------------------------------------------------- */

function StepVerdict() {
  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-slate-700">
        El proyecto académico responde a la pregunta:{' '}
        <em>
          ¿de qué manera Newton, Lagrange y mínimos cuadrados pueden utilizarse
          para predecir la demanda eléctrica en intervalos intermedios no
          medidos, y cuál ofrece mejor aproximación?
        </em>
      </p>
      <Card title="🧭 Recomendación operativa">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
          <li>
            <strong>Para una consulta puntual entre dos horas conocidas</strong>{' '}
            (ej. "carga estimada a las 14:30 para programar el HVAC en los
            próximos 30 minutos"): <span className="font-semibold text-violet-700">
            Newton o Lagrange con 5–7 puntos vecinos</span>. Ambos dan el mismo
            resultado y son baratos computacionalmente.
          </li>
          <li>
            <strong>Para reconstruir la curva completa del día</strong>{' '}
            (ej. dashboard de planificación, integración con BMS):{' '}
            <span className="font-semibold text-emerald-700">Mínimos cuadrados
            grado 3 a 5</span>. Capta la forma con R² &gt; 0.99 y produce un
            modelo evaluable en cualquier x ∈ [0, 23] sin sobreajuste.
          </li>
          <li>
            <strong>Para predicción fuera del rango muestreado</strong>{' '}
            (extrapolación, hora siguiente al último dato):{' '}
            <span className="font-semibold text-rose-700">
              ninguno es confiable
            </span>
            . Hay que combinar el ajuste con un modelo predictivo serie de
            tiempo (ARIMA, LSTM) — fuera del alcance de este curso, pero
            apuntado en la sección "Perspectivas Futuras".
          </li>
          <li>
            <strong>Nunca</strong>{' '}
            <span className="font-semibold text-rose-700">
              Newton/Lagrange con los 24 puntos completos
            </span>
            : el fenómeno de Runge vuelve la predicción inservible cerca de los
            extremos.
          </li>
        </ul>
      </Card>
      <p className="text-base leading-relaxed text-slate-700">
        En Cumbres Data Center S.A., una integración pragmática combinaría
        ambos enfoques: <strong>MMC grado 5</strong> como modelo base para la
        consola de operación, con <strong>Newton sobre 5 puntos vecinos</strong>{' '}
        cuando se solicita una estimación puntual de alta precisión en una
        ventana corta.
      </p>
      <p className="text-sm italic text-slate-500">
        Para fijar conceptos, te invitamos al{' '}
        <a className="font-semibold text-blue-700 underline" href="#quiz">
          Quiz de autoevaluación →
        </a>
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Steps definition                                                            */
/* -------------------------------------------------------------------------- */

type StepDef = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  Render: () => ReactNode;
};

const STEPS: ReadonlyArray<StepDef> = [
  {
    id: 'problem',
    emoji: '🔌',
    title: 'El problema',
    subtitle: 'El operador necesita un valor que no fue medido',
    Render: () => <StepProblem />,
  },
  {
    id: 'linear',
    emoji: '📏',
    title: 'Primer intento: línea recta',
    subtitle: 'Interpolación lineal entre dos vecinos',
    Render: () => <StepLinear />,
  },
  {
    id: 'newton',
    emoji: '🧮',
    title: 'Newton con N puntos vecinos',
    subtitle: 'Diferencias divididas y polinomios de grado creciente',
    Render: () => <StepNewton />,
  },
  {
    id: 'lagrange',
    emoji: '🔁',
    title: 'Lagrange: el primo de Newton',
    subtitle: 'Misma respuesta, otro camino',
    Render: () => <StepLagrange />,
  },
  {
    id: 'runge',
    emoji: '⚠️',
    title: 'La trampa: fenómeno de Runge',
    subtitle: 'Por qué no usar los 24 puntos en interpolación',
    Render: () => <StepRunge />,
  },
  {
    id: 'leastsq',
    emoji: '📈',
    title: 'Mínimos cuadrados al rescate',
    subtitle: 'Ajuste suave sin pasar por todos los puntos',
    Render: () => <StepLeastSquares />,
  },
  {
    id: 'compare',
    emoji: '⚖️',
    title: '¿Cuál gana?',
    subtitle: 'Comparativa cuantitativa MSE / MAE / MAPE / R²',
    Render: () => <StepCompare />,
  },
  {
    id: 'predict',
    emoji: '🧪',
    title: 'Tu turno: probá una predicción',
    subtitle: 'Elegí hora y método, mirá el resultado',
    Render: () => <StepPredict />,
  },
  {
    id: 'verdict',
    emoji: '🎯',
    title: 'Veredicto operativo',
    subtitle: 'Qué método elegir según el contexto',
    Render: () => <StepVerdict />,
  },
];

/* -------------------------------------------------------------------------- */
/* Walkthrough container                                                       */
/* -------------------------------------------------------------------------- */

export function Walkthrough() {
  const [stepIdx, setStepIdx] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const previousIdxRef = useRef<number>(0);

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, idx));
    setStepIdx(clamped);
  };

  // Scroll suave hacia el encabezado del wizard cuando cambia el paso, salvo
  // en el render inicial (para no robarle el scroll al usuario que recién
  // aterriza en la sección).
  useEffect(() => {
    if (previousIdxRef.current === stepIdx) return;
    previousIdxRef.current = stepIdx;
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [stepIdx]);

  const step = STEPS[stepIdx]!;
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Cabecera con progreso */}
      <div
        ref={headerRef}
        className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:px-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Recorrido guiado · paso {stepIdx + 1} de {STEPS.length}
          </p>
          <button
            type="button"
            onClick={() => goTo(0)}
            className="text-xs text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Volver al inicio
          </button>
        </div>
        <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
          <span aria-hidden="true" className="mr-2">
            {step.emoji}
          </span>
          {step.title}
        </h3>
        <p className="text-sm text-slate-600">{step.subtitle}</p>
        {/* Dots */}
        <div
          className="mt-1 flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Pasos del recorrido"
        >
          {STEPS.map((s, idx) => {
            const isCurrent = idx === stepIdx;
            const isVisited = idx < stepIdx;
            const cls = isCurrent
              ? 'h-2 w-6 rounded-full bg-blue-600'
              : isVisited
                ? 'h-2 w-2 rounded-full bg-blue-300'
                : 'h-2 w-2 rounded-full bg-slate-200';
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Paso ${idx + 1}: ${s.title}`}
                onClick={() => goTo(idx)}
                className={`${cls} transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
              />
            );
          })}
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="px-5 py-6 sm:px-6">{step.Render()}</div>

      {/* Navegación */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
        <Button variant="ghost" disabled={isFirst} onClick={() => goTo(stepIdx - 1)}>
          ← Atrás
        </Button>
        <span className="hidden text-xs text-slate-500 sm:inline">
          {step.title}
        </span>
        {isLast ? (
          <Button onClick={() => (window.location.hash = '#quiz')}>
            Ir al quiz →
          </Button>
        ) : (
          <Button onClick={() => goTo(stepIdx + 1)}>Siguiente →</Button>
        )}
      </div>
    </div>
  );
}

export default Walkthrough;
