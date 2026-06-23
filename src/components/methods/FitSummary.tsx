import { useMemo } from 'react';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { fitLagrange } from '@/lib/methods/lagrange';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { fitNewton } from '@/lib/methods/newton';
import type { FitResult, Method } from '@/lib/methods/types';
import { useCumbresStore } from '@/state/store';
import { formatNumber } from '@/lib/format';
import { KatexEquation } from '@/components/math/KatexEquation';

function computeFit(method: Method, degree: number): FitResult {
  if (method === 'newton') return fitNewton(CUMBRES_POINTS);
  if (method === 'lagrange') return fitLagrange(CUMBRES_POINTS);
  return fitLeastSquares(CUMBRES_POINTS, degree);
}

type CardSpec = { label: string; value: string; hint: string };

/**
 * Bloque resumen del ajuste activo. Muestra el polinomio en LaTeX y un grid
 * de 4 métricas (MSE, MAE, MAPE, R²) con formato regional es-CR. Útil para
 * que el lector contraste numéricamente el método escogido en el playground.
 */
export function FitSummary() {
  const activeMethod = useCumbresStore((s) => s.activeMethod);
  const polynomialDegree = useCumbresStore((s) => s.polynomialDegree);

  const fit = useMemo(
    () => computeFit(activeMethod, polynomialDegree),
    [activeMethod, polynomialDegree],
  );

  const equationLatex = `P(x) = ${fit.latex}`;

  const cards: CardSpec[] = [
    {
      label: 'MSE',
      value: formatNumber(fit.metrics.mse, 2),
      hint: 'Error cuadrático medio',
    },
    {
      label: 'MAE',
      value: formatNumber(fit.metrics.mae, 2),
      hint: 'Error absoluto medio',
    },
    {
      label: 'MAPE',
      value: `${formatNumber(fit.metrics.mape, 2)} %`,
      hint: 'Error absoluto medio porcentual',
    },
    {
      label: 'R²',
      value: formatNumber(fit.metrics.r2, 4),
      hint: 'Coeficiente de determinación',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Polinomio ajustado
        </h4>
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <KatexEquation latex={equationLatex} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-md border border-slate-200 bg-white p-3 text-center shadow-sm"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {c.label}
            </div>
            <div className="mt-1 font-mono text-base font-semibold text-slate-900 sm:text-lg">
              {c.value}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">{c.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FitSummary;
