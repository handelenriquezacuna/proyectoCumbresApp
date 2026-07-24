import { useMemo } from 'react';
import { DegreeSlider } from '@/components/methods/DegreeSlider';
import { FitSummary } from '@/components/methods/FitSummary';
import { InterpolationChart } from '@/components/methods/InterpolationChart';
import { MethodPicker } from '@/components/methods/MethodPicker';
import { Slider } from '@/components/ui/Slider';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { fitLagrange } from '@/lib/methods/lagrange';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { fitNewton } from '@/lib/methods/newton';
import type { FitResult, Method } from '@/lib/methods/types';
import { fmtTrunc5 } from '@/lib/format';
import { useCumbresStore } from '@/state/store';

function computeFit(method: Method, degree: number): FitResult {
  if (method === 'newton') return fitNewton(CUMBRES_POINTS);
  if (method === 'lagrange') return fitLagrange(CUMBRES_POINTS);
  return fitLeastSquares(CUMBRES_POINTS, degree);
}

function methodLabel(method: Method, degree: number): string {
  switch (method) {
    case 'newton':
      return 'Newton (24 puntos)';
    case 'lagrange':
      return 'Lagrange (24 puntos)';
    case 'ls3':
    case 'ls5':
      return `Mínimos cuadrados grado ${degree}`;
  }
}

function formatHour(value: number): string {
  const h = Math.floor(value);
  const m = Math.round((value - h) * 60)
    .toString()
    .padStart(2, '0');
  return `${h.toString().padStart(2, '0')}:${m}`;
}

function clampToDomain(y: number): number {
  if (!Number.isFinite(y)) return 1100;
  if (y < 1100) return 1100;
  if (y > 1600) return 1600;
  return y;
}

/**
 * Simulador interactivo unificado: método, grado y hora en una sola experiencia. Todos
 * los controles leen y escriben el store de zustand, por lo que la gráfica,
 * la predicción puntual, el resumen del ajuste y los botones de exportación
 * reflejan siempre el mismo estado.
 */
export function MethodPlayground() {
  const activeMethod = useCumbresStore((s) => s.activeMethod);
  const polynomialDegree = useCumbresStore((s) => s.polynomialDegree);
  const sampleX = useCumbresStore((s) => s.sampleX);
  const setSampleX = useCumbresStore((s) => s.setSampleX);

  const fit = useMemo(
    () => computeFit(activeMethod, polynomialDegree),
    [activeMethod, polynomialDegree],
  );
  const prediction = fit.evaluate(sampleX);
  const label = methodLabel(activeMethod, polynomialDegree);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate-600">
        El <strong>método</strong> define la curva ajustada, el{' '}
        <strong>grado</strong> aplica solo a mínimos cuadrados y la{' '}
        <strong>hora</strong> es el punto donde se evalúa la predicción.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <MethodPicker />
        <DegreeSlider />
        <Slider
          label="Hora consultada"
          min={0}
          max={23}
          step={0.25}
          value={sampleX}
          onChange={setSampleX}
          format={formatHour}
        />
      </div>
      <InterpolationChart
        highlightX={sampleX}
        highlightY={clampToDomain(prediction)}
      />
      <div
        aria-live="polite"
        className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
      >
        <p className="font-semibold">Predicción puntual</p>
        <p className="mt-1">
          A las <span className="font-mono">{formatHour(sampleX)}</span>,{' '}
          {label} estima una carga de{' '}
          <span className="font-mono text-base font-bold">
            {fmtTrunc5(prediction)} kW
          </span>
          .
        </p>
        {(activeMethod === 'newton' || activeMethod === 'lagrange') && (
          <p className="mt-2 text-xs text-blue-800">
            Recuerda: con los 24 puntos, la interpolación oscila cerca de las
            horas 0 y 23 (fenómeno de Runge). Cerca de los extremos, esta
            predicción pierde sentido físico.
          </p>
        )}
      </div>
      <FitSummary />
    </div>
  );
}

export default MethodPlayground;
