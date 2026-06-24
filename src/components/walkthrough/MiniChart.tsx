import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber } from '@/lib/format';

export type Series = {
  name: string;
  color: string;
  data: Array<{ x: number; y: number }>;
  dashed?: boolean;
};

export interface MiniChartProps {
  observed: Array<{ x: number; y: number }>;
  fits: Series[];
  /** Hora destacada con un marcador vertical (ej: 14.5). */
  highlightX?: number;
  /** Valor estimado en highlightX para alguno de los métodos (anota un punto). */
  highlightY?: number;
  /** Rango del eje Y (recortado para Runge). Default [1100, 1600]. */
  yDomain?: [number, number];
  /** Altura en clases Tailwind. Default 'h-64'. */
  heightClass?: string;
  /** Mostrar puntos observados como scatter rojo. */
  showObserved?: boolean;
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const first = payload[0];
  if (!first) return null;
  const x = (first.payload as { x?: number }).x ?? 0;
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-slate-800">Hora {formatNumber(x, 2)}</div>
      {payload.map((p) => (
        <div key={String(p.name)} className="text-slate-700">
          <span style={{ color: typeof p.color === 'string' ? p.color : undefined }}>
            {String(p.name)}:
          </span>{' '}
          <span className="font-mono">{formatNumber(Number(p.value), 1)}</span> kW
        </div>
      ))}
    </div>
  );
}

/**
 * Gráfico compacto para el walkthrough. Soporta múltiples series de curvas
 * superpuestas + scatter observado + un punto destacado. Eje X es horas (0-23)
 * por defecto pero acepta cualquier rango via auto-fit.
 */
export function MiniChart({
  observed,
  fits,
  highlightX,
  highlightY,
  yDomain = [1100, 1600],
  heightClass = 'h-64',
  showObserved = true,
}: MiniChartProps) {
  return (
    <div className={`w-full ${heightClass}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 23]}
            ticks={[0, 4, 8, 12, 16, 20, 23]}
            tick={{ fontSize: 11, fill: '#475569' }}
            label={{
              value: 'Hora',
              position: 'insideBottom',
              offset: -4,
              style: { fill: '#475569', fontSize: 11 },
            }}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11, fill: '#475569' }}
            label={{
              value: 'kW',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#475569', fontSize: 11 },
            }}
          />
          <Tooltip content={(props) => <ChartTooltip {...props} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {fits.map((s) => (
            <Line
              key={s.name}
              data={s.data}
              type="monotone"
              dataKey="y"
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '4 4' : undefined}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          {showObserved && (
            <Scatter
              data={observed}
              dataKey="y"
              name="Observado"
              fill="#dc2626"
              line={{ stroke: '#dc2626', strokeDasharray: '3 3', strokeWidth: 1 }}
              shape="circle"
            />
          )}
          {highlightX !== undefined && highlightY !== undefined && (
            <ReferenceDot
              x={highlightX}
              y={highlightY}
              r={6}
              fill="#facc15"
              stroke="#854d0e"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MiniChart;
