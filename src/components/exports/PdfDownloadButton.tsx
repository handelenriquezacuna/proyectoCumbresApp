import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
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
 * Botón que genera y descarga el reporte PDF del caso Cumbres mediante
 * pdfmake. Recopila el método activo, el grado y las métricas del ajuste
 * visible en el simulador y delega en `downloadCumbresPdf`.
 *
 * El módulo `@/lib/export/pdf` (y con él pdfmake + las fuentes Roboto,
 * ~2 MB minificados) se carga con `import()` dinámico dentro del handler:
 * queda fuera del bundle inicial y solo se descarga la primera vez que el
 * usuario pide el reporte.
 *
 * Mantiene un estado `pending` para evitar re-entradas mientras pdfmake
 * construye el documento (sucede de manera asíncrona porque debe esperar al
 * worker interno de pdfkit).
 */
export function PdfDownloadButton() {
  const activeMethod = useCumbresStore((s) => s.activeMethod);
  const polynomialDegree = useCumbresStore((s) => s.polynomialDegree);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const { downloadCumbresPdf } = await import('@/lib/export/pdf');
      const fit = computeFit(activeMethod, polynomialDegree);
      await downloadCumbresPdf({
        activeMethod,
        metrics: fit.metrics,
        polynomialLatex: fit.latex,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[PdfDownloadButton] no se pudo generar el PDF', err);
      setError(
        'No se pudo generar el PDF. Verifica tu conexión e intenta de nuevo.',
      );
    } finally {
      setPending(false);
    }
  }, [activeMethod, polynomialDegree, pending]);

  return (
    <>
      <Button
        variant="primary"
        onClick={handleClick}
        disabled={pending}
        aria-label="Descargar reporte PDF del caso Cumbres"
      >
        {pending ? 'Generando…' : 'Descargar PDF'}
      </Button>
      {error ? (
        <span role="alert" className="self-center text-sm text-red-600">
          {error}
        </span>
      ) : null}
    </>
  );
}

export default PdfDownloadButton;
