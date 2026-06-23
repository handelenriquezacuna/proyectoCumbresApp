import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { downloadCsv, toCSV } from '@/lib/export/csv';
import { fitLagrange } from '@/lib/methods/lagrange';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { fitNewton } from '@/lib/methods/newton';
import type { FitResult, Method } from '@/lib/methods/types';
import { useCumbresStore } from '@/state/store';

function computeFit(method: Method, degree: number): FitResult {
  if (method === 'newton') return fitNewton(CUMBRES_POINTS);
  if (method === 'lagrange') return fitLagrange(CUMBRES_POINTS);
  return fitLeastSquares(CUMBRES_POINTS, degree);
}

/**
 * Botón que exporta el dataset Cumbres + la predicción del método activo en
 * un CSV listo para Excel. Columnas: `hora`, `kW` (observado),
 * `prediccion_metodo_activo` (valor del polinomio ajustado en esa hora).
 *
 * Toma el método activo y el grado del polinomio del store de zustand para
 * que el archivo refleje exactamente el ajuste visible en el playground.
 */
export function CsvDownloadButton() {
  const activeMethod = useCumbresStore((s) => s.activeMethod);
  const polynomialDegree = useCumbresStore((s) => s.polynomialDegree);

  const handleClick = useCallback(() => {
    const fit = computeFit(activeMethod, polynomialDegree);
    const rows = CUMBRES_POINTS.map((p) => ({
      hora: p.x,
      kW: p.y,
      prediccion_metodo_activo: Number(fit.evaluate(p.x).toFixed(4)),
    }));
    const csv = toCSV(rows, ['hora', 'kW', 'prediccion_metodo_activo']);
    downloadCsv('cumbres-demanda.csv', csv);
  }, [activeMethod, polynomialDegree]);

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      aria-label="Descargar dataset y predicción en CSV"
    >
      Descargar CSV
    </Button>
  );
}

export default CsvDownloadButton;
