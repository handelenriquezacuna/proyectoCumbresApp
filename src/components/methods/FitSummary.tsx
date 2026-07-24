import { useMemo } from 'react';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { fitLagrange } from '@/lib/methods/lagrange';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { fitNewton } from '@/lib/methods/newton';
import type { FitResult, Method } from '@/lib/methods/types';
import { useCumbresStore } from '@/state/store';
import { fmtTrunc5 } from '@/lib/format';
import { KatexEquation } from '@/components/math/KatexEquation';
import {
  EXCEL_COL_HEADER_CLASS,
  EXCEL_FONT,
  EXCEL_ROW_HEADER_CLASS,
  colLetter,
  excelCellClass,
} from '@/components/excel/ExcelSheet';

function computeFit(method: Method, degree: number): FitResult {
  if (method === 'newton') return fitNewton(CUMBRES_POINTS);
  if (method === 'lagrange') return fitLagrange(CUMBRES_POINTS);
  return fitLeastSquares(CUMBRES_POINTS, degree);
}

type CardSpec = { label: string; value: string; hint: string };

/**
 * Bloque resumen del ajuste activo. Muestra el polinomio en LaTeX y una
 * mini-tabla estilo Excel (letras de columna, números de fila, gridlines)
 * con las 4 métricas (MSE, MAE, MAPE, R²) truncadas a 5 decimales como en
 * el machote. Útil para que el lector contraste numéricamente el método
 * escogido en el playground.
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
      value: fmtTrunc5(fit.metrics.mse),
      hint: 'Error cuadrático medio',
    },
    {
      label: 'MAE',
      value: fmtTrunc5(fit.metrics.mae),
      hint: 'Error absoluto medio',
    },
    {
      label: 'MAPE',
      value: `${fmtTrunc5(fit.metrics.mape)} %`,
      hint: 'Error absoluto medio porcentual',
    },
    {
      label: 'R²',
      value: fmtTrunc5(fit.metrics.r2),
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
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Métricas del ajuste
        </h4>
        <div
          className="overflow-x-auto rounded-md border border-slate-300 bg-white"
          role="region"
          aria-label="Métricas del ajuste activo"
        >
          <table
            className="w-full min-w-[24rem] border-separate border-spacing-0 text-sm"
            style={EXCEL_FONT}
          >
            <thead>
              {/* Letras de columna estilo Excel */}
              <tr>
                <th scope="col" className={`w-10 ${EXCEL_ROW_HEADER_CLASS}`} aria-label="Fila" />
                {cards.map((c, i) => (
                  <th key={c.label} scope="col" className={EXCEL_COL_HEADER_CLASS}>
                    {colLetter(i)}
                  </th>
                ))}
              </tr>
              {/* Fila 1: nombres de métrica */}
              <tr>
                <th scope="row" className={EXCEL_ROW_HEADER_CLASS}>
                  1
                </th>
                {cards.map((c) => (
                  <th
                    key={c.label}
                    scope="col"
                    title={c.hint}
                    className={excelCellClass('header', 'text-center')}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Fila 2: valores calculados */}
              <tr>
                <th scope="row" className={EXCEL_ROW_HEADER_CLASS}>
                  2
                </th>
                {cards.map((c) => (
                  <td
                    key={c.label}
                    title={c.hint}
                    className={excelCellClass('computed', 'text-right tabular-nums')}
                  >
                    {c.value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          {cards.map((c) => `${c.label}: ${c.hint}`).join(' · ')}
        </p>
      </div>
    </div>
  );
}

export default FitSummary;
