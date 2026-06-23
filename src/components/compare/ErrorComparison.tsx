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
import { formatNumber } from '@/lib/format';

type Variant = {
  key: Method;
  label: string;
  color: string;
  fit: FitResult;
};

const SAMPLES = 200;
const Y_MIN = 1100;
const Y_MAX = 1600;

function clampY(y: number): number {
  if (!Number.isFinite(y)) return Number.NaN;
  if (y < Y_MIN) return Y_MIN;
  if (y > Y_MAX) return Y_MAX;
  return y;
}

type SampleRow = {
  x: number;
  newton: number;
  lagrange: number;
  ls3: number;
  ls5: number;
};

type ScatterDatum = { x: number; y: number };

function buildVariants(): Variant[] {
  return [
    {
      key: 'newton',
      label: 'Newton',
      color: '#2563eb',
      fit: fitNewton(CUMBRES_POINTS),
    },
    {
      key: 'lagrange',
      label: 'Lagrange',
      color: '#9333ea',
      fit: fitLagrange(CUMBRES_POINTS),
    },
    {
      key: 'ls3',
      label: 'Mínimos cuadrados (n = 3)',
      color: '#16a34a',
      fit: fitLeastSquares(CUMBRES_POINTS, 3),
    },
    {
      key: 'ls5',
      label: 'Mínimos cuadrados (n = 5)',
      color: '#ea580c',
      fit: fitLeastSquares(CUMBRES_POINTS, 5),
    },
  ];
}

function CompareTooltip({
  active,
  payload,
  label,
}: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const x = typeof label === 'number' ? label : Number(label ?? 0);
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-slate-800">
        Hora {formatNumber(x, 2)}
      </div>
      {payload.map((p) => {
        const value =
          typeof p.value === 'number'
            ? formatNumber(p.value, 0)
            : String(p.value ?? '');
        return (
          <div key={String(p.dataKey)} className="flex justify-between gap-3">
            <span style={{ color: typeof p.color === 'string' ? p.color : undefined }}>
              {p.name ?? String(p.dataKey)}
            </span>
            <span className="font-mono text-slate-700">{value} kW</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Tabla y gráfico comparativos para los cuatro métodos numéricos. Todos los
 * ajustes se calculan una sola vez sobre los 24 puntos del Cumbres Data
 * Center; la fila con menor MSE se resalta en color verde para señalar el
 * mejor desempeño global.
 */
export function ErrorComparison() {
  const variants = useMemo(() => buildVariants(), []);

  const minMseKey = useMemo<Method>(() => {
    let bestIdx = 0;
    let bestMse = Number.POSITIVE_INFINITY;
    for (let i = 0; i < variants.length; i++) {
      const m = variants[i]!.fit.metrics.mse;
      if (Number.isFinite(m) && m < bestMse) {
        bestMse = m;
        bestIdx = i;
      }
    }
    return variants[bestIdx]!.key;
  }, [variants]);

  const sampleRows = useMemo<SampleRow[]>(() => {
    const rows: SampleRow[] = new Array(SAMPLES);
    const last = SAMPLES - 1;
    const [vNewton, vLagrange, vLs3, vLs5] = variants;
    for (let i = 0; i < SAMPLES; i++) {
      const x = (i * 23) / last;
      rows[i] = {
        x,
        newton: clampY(vNewton!.fit.evaluate(x)),
        lagrange: clampY(vLagrange!.fit.evaluate(x)),
        ls3: clampY(vLs3!.fit.evaluate(x)),
        ls5: clampY(vLs5!.fit.evaluate(x)),
      };
    }
    return rows;
  }, [variants]);

  const observed: ScatterDatum[] = useMemo(
    () => CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y })),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <div
        className="overflow-x-auto rounded-md border border-slate-200"
        role="region"
        aria-label="Tabla comparativa de métricas de error"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                Método
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                MSE
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                MAE
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                MAPE (%)
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                R²
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => {
              const isBest = v.key === minMseKey;
              const rowClass = isBest
                ? 'border-t border-emerald-200 bg-emerald-50 font-semibold text-emerald-900'
                : 'border-t border-slate-100 odd:bg-white even:bg-slate-50';
              return (
                <tr key={v.key} className={rowClass}>
                  <td className="px-3 py-2">
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                      style={{ backgroundColor: v.color }}
                      aria-hidden="true"
                    />
                    {v.label}
                    {isBest && (
                      <span className="ml-2 rounded bg-emerald-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-emerald-900">
                        mejor MSE
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatNumber(v.fit.metrics.mse, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatNumber(v.fit.metrics.mae, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatNumber(v.fit.metrics.mape, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatNumber(v.fit.metrics.r2, 4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="h-96 w-full" aria-label="Curvas ajustadas comparadas">
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
            <Tooltip content={(props) => <CompareTooltip {...props} />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              data={sampleRows}
              type="monotone"
              dataKey="newton"
              name="Newton"
              stroke={variants[0]!.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              data={sampleRows}
              type="monotone"
              dataKey="lagrange"
              name="Lagrange"
              stroke={variants[1]!.color}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              data={sampleRows}
              type="monotone"
              dataKey="ls3"
              name="MMC grado 3"
              stroke={variants[2]!.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              data={sampleRows}
              type="monotone"
              dataKey="ls5"
              name="MMC grado 5"
              stroke={variants[3]!.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Scatter
              data={observed}
              dataKey="y"
              name="Puntos observados"
              fill="#dc2626"
              shape="circle"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ErrorComparison;
