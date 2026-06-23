import { useMemo } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { fitLagrange } from '@/lib/methods/lagrange';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { fitNewton } from '@/lib/methods/newton';
import type { FitResult, Method } from '@/lib/methods/types';
import { useCumbresStore } from '@/state/store';
import { formatNumber } from '@/lib/format';

const SAMPLES = 200;
const Y_MIN = 1100;
const Y_MAX = 1600;

function clampY(y: number): number {
  if (!Number.isFinite(y)) return Number.NaN;
  if (y < Y_MIN) return Y_MIN;
  if (y > Y_MAX) return Y_MAX;
  return y;
}

function computeFit(method: Method, degree: number): FitResult {
  if (method === 'newton') return fitNewton(CUMBRES_POINTS);
  if (method === 'lagrange') return fitLagrange(CUMBRES_POINTS);
  return fitLeastSquares(CUMBRES_POINTS, degree);
}

function methodLabel(method: Method, degree: number): string {
  switch (method) {
    case 'newton':
      return 'Newton';
    case 'lagrange':
      return 'Lagrange';
    case 'ls3':
    case 'ls5':
      return `Mínimos cuadrados (n = ${degree})`;
  }
}

type FitDatum = { x: number; fitted: number; rawFitted: number };
type ScatterDatum = { x: number; y: number };

function FitTooltip({
  active,
  payload,
}: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  // Recharts emite múltiples entradas (fitted + scatter) en el mismo x.
  // Buscamos un payload con x definido.
  const first = payload[0];
  if (!first) return null;
  const datum = first.payload as Partial<FitDatum & ScatterDatum>;
  const x = datum.x ?? 0;
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-slate-800">
        Hora {formatNumber(x, 2)}
      </div>
      {datum.rawFitted !== undefined && (
        <div className="text-slate-700">
          Ajuste: <span className="font-mono">{formatNumber(datum.rawFitted, 1)}</span> kW
        </div>
      )}
      {datum.y !== undefined && (
        <div className="text-slate-700">
          Observado: <span className="font-mono">{formatNumber(datum.y, 0)}</span> kW
        </div>
      )}
    </div>
  );
}

/**
 * Gráfica comparativa entre los 24 puntos observados (scatter punteado) y
 * el polinomio ajustado, muestreado en 200 puntos en x ∈ [0, 23]. El eje Y
 * se recorta a [1100, 1600] para que las oscilaciones de Runge (en Newton y
 * Lagrange con 24 puntos) no rompan el lienzo.
 */
export function InterpolationChart() {
  const activeMethod = useCumbresStore((s) => s.activeMethod);
  const polynomialDegree = useCumbresStore((s) => s.polynomialDegree);

  const fit = useMemo(
    () => computeFit(activeMethod, polynomialDegree),
    [activeMethod, polynomialDegree],
  );

  const fittedData = useMemo<FitDatum[]>(() => {
    const data: FitDatum[] = new Array(SAMPLES);
    const last = SAMPLES - 1;
    for (let i = 0; i < SAMPLES; i++) {
      const x = (i * 23) / last;
      const raw = fit.evaluate(x);
      data[i] = { x, fitted: clampY(raw), rawFitted: raw };
    }
    return data;
  }, [fit]);

  const observed: ScatterDatum[] = useMemo(
    () => CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y })),
    [],
  );

  const seriesLabel = methodLabel(activeMethod, polynomialDegree);

  return (
    <div
      className="h-80 w-full"
      aria-label={`Curva ajustada — ${seriesLabel}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 23]}
            ticks={[0, 4, 8, 12, 16, 20, 23]}
            tick={{ fontSize: 12, fill: '#475569' }}
            label={{
              value: 'Hora del día',
              position: 'insideBottom',
              offset: -4,
              style: { fill: '#475569', fontSize: 12 },
            }}
            allowDuplicatedCategory={false}
          />
          <YAxis
            domain={[Y_MIN, Y_MAX]}
            ticks={[1100, 1200, 1300, 1400, 1500, 1600]}
            tick={{ fontSize: 12, fill: '#475569' }}
            label={{
              value: 'Carga (kW)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#475569', fontSize: 12 },
            }}
          />
          <Tooltip content={(props) => <FitTooltip {...props} />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            data={fittedData}
            type="monotone"
            dataKey="fitted"
            name={seriesLabel}
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Scatter
            data={observed}
            dataKey="y"
            name="Puntos observados"
            fill="#dc2626"
            line={{ stroke: '#dc2626', strokeDasharray: '3 3', strokeWidth: 1 }}
            shape="circle"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default InterpolationChart;
