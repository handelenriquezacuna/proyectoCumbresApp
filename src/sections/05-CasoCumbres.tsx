import { Card } from '@/components/ui/Card';
import { DatasetChart } from '@/components/data/DatasetChart';
import { DatasetTable } from '@/components/data/DatasetTable';
import { CsvDownloadButton } from '@/components/exports/CsvDownloadButton';
import { PdfDownloadButton } from '@/components/exports/PdfDownloadButton';
import { KatexEquation } from '@/components/math/KatexEquation';
import { MethodPlayground } from '@/components/methods/MethodPlayground';
import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Sección 4 (#caso): el corazón del informe. Describe la empresa ficticia
 * Cumbres Data Center S.A., presenta el dataset (tabla + gráfica) y entrega el
 * playground interactivo donde el lector aplica los métodos numéricos sobre
 * los 24 puntos horarios.
 */
export function CasoCumbres() {
  return (
    <SectionAnchor id="caso" accent="caso">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-caso">
          Capítulo 4
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Caso Cumbres
        </h2>
      </header>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        Cumbres Data Center S.A. es una instalación ficticia Tier III ubicada
        en Belén, Heredia, calibrada con los promedios del Global Data Center
        Survey de Uptime Institute (2024) para sitios de su categoría en
        América Latina. Con 1500 kW de pico vespertino, 1240 kW de base
        nocturna y un PUE de 1.55, la instalación reproduce el perfil térmico
        descrito por Avelar et al. (2012) para data centers de gama media en
        clima tropical de altura.
      </p>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        El indicador de eficiencia energética PUE (Power Usage Effectiveness)
        propuesto por Belady et al. (2008) resume la relación entre la potencia
        total entregada al sitio y la potencia consumida por la carga de TI:
      </p>

      <KatexEquation
        accent="caso"
        latex={String.raw`\mathrm{PUE} = \frac{E_{\text{total}}}{E_{\text{TI}}}`}
        caption="Energía total del sitio dividida entre energía consumida por la carga de TI."
      />
      <KatexEquation
        accent="caso"
        latex={String.raw`\mathrm{PUE}_{\text{Cumbres}} = \frac{E_{\text{total}}}{E_{\text{TI}}} = 1.55`}
        caption="Valor de calibración del caso Cumbres (Uptime Institute, 2024)."
      />

      <p className="mb-6 mt-4 text-base leading-relaxed text-slate-700">
        El dataset de trabajo contiene 24 observaciones horarias (h, kW)
        correspondientes a un martes laboral típico. La tabla y la gráfica
        siguientes lo presentan en formato listo para el análisis numérico.
      </p>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card title="Tabla de demanda horaria">
          <DatasetTable />
        </Card>
        <Card title="Perfil de carga (24 h)">
          <DatasetChart />
        </Card>
      </div>

      <h3 className="mb-2 mt-6 text-xl font-semibold text-slate-900">
        Playground interactivo
      </h3>
      <p className="mb-4 text-base leading-relaxed text-slate-700">
        El siguiente componente permite seleccionar un método numérico (Newton,
        Lagrange o mínimos cuadrados de grado variable) y observar en tiempo
        real la curva ajustada sobre la nube de puntos del Cumbres Data Center.
        Las métricas de error se recalculan automáticamente para apoyar el
        análisis comparativo (Uptime Institute, 2024).
      </p>

      <Card>
        <MethodPlayground />
      </Card>

      <div className="mt-6 flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700">
          Exportá los datos y el reporte ejecutivo del método activo para
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

export default CasoCumbres;
