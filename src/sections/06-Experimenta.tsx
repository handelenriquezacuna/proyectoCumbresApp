import { Card } from '@/components/ui/Card';
import { CsvDownloadButton } from '@/components/exports/CsvDownloadButton';
import { PdfDownloadButton } from '@/components/exports/PdfDownloadButton';
import { MethodPlayground } from '@/components/methods/MethodPlayground';
import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Capítulo 6 (#experimenta): cierre interactivo de la historia. Unifica el
 * antiguo playground del caso y el paso "Tu turno" del recorrido guiado en
 * una sola experiencia con método, grado y hora, más la exportación del
 * resultado en CSV y PDF.
 */
export function Experimenta() {
  return (
    <SectionAnchor id="experimenta" accent="plan">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Capítulo 6 de 6
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Ahora construye tu propia predicción
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-700">
          Elige un método, ajusta el grado y consulta cualquier hora del día:
          la curva, la predicción y las métricas se recalculan al instante.
        </p>
      </header>

      <Card>
        <MethodPlayground />
      </Card>

      <div className="mt-6 flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700">
          Exporta los datos y el reporte ejecutivo del método activo para
          adjuntar al informe del curso.
        </p>
        <div className="flex flex-wrap gap-2">
          <CsvDownloadButton />
          <PdfDownloadButton />
        </div>
      </div>
    </SectionAnchor>
  );
}

export default Experimenta;
