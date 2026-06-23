import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { formatNumber } from '@/lib/format';

type Datum = { x: number; y: number };

function CumbresTooltip({
  active,
  payload,
}: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as Datum | undefined;
  if (!point) return null;
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-slate-800">
        Hora {String(point.x).padStart(2, '0')}:00
      </div>
      <div className="font-mono text-slate-700">
        {formatNumber(point.y, 0)} kW
      </div>
    </div>
  );
}

/**
 * Recharts LineChart de los 24 puntos crudos del Cumbres Data Center.
 * Muestra una línea suave y un punto por cada observación; el dominio Y se
 * fija a [1100, 1600] para que la curva ocupe la mitad superior del lienzo
 * y se aprecie el pico vespertino.
 */
export function DatasetChart() {
  const data: Datum[] = CUMBRES_POINTS.map((p) => ({ x: p.x, y: p.y }));

  return (
    <div className="h-72 w-full" aria-label="Gráfica de demanda horaria">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 23]}
            ticks={[0, 4, 8, 12, 16, 20, 23]}
            tick={{ fontSize: 12, fill: '#475569' }}
            label={{
              value: 'Hora del día',
              position: 'insideBottom',
              offset: -4,
              style: { fill: '#475569', fontSize: 12 },
            }}
          />
          <YAxis
            domain={[1100, 1600]}
            ticks={[1100, 1200, 1300, 1400, 1500, 1600]}
            tick={{ fontSize: 12, fill: '#475569' }}
            label={{
              value: 'Carga (kW)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#475569', fontSize: 12 },
            }}
          />
          <Tooltip content={(props) => <CumbresTooltip {...props} />} />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3, fill: '#1d4ed8', stroke: '#1d4ed8' }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DatasetChart;
