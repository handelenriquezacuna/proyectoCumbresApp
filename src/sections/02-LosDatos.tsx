import { Card } from '@/components/ui/Card';
import { DatasetChart } from '@/components/data/DatasetChart';
import { DatasetTable } from '@/components/data/DatasetTable';
import { KatexEquation } from '@/components/math/KatexEquation';
import { SectionAnchor } from '@/components/layout/SectionAnchor';

const FICHA: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Instalación', value: 'Data center Tier III ficticio' },
  { label: 'Ubicación', value: 'Belén, Heredia' },
  { label: 'Información disponible', value: '24 mediciones horarias' },
  { label: 'Objetivo', value: 'Estimar la demanda entre horas no medidas' },
];

/**
 * Capítulo 2 (#datos): presenta la evidencia del caso. Una ficha con los
 * cuatro datos clave, la curva del día con la anotación de las 14:30 y la
 * tabla completa del dataset. El contexto energético académico (PUE,
 * calibración, referencias) queda dentro de un acordeón para quien quiera
 * profundizar sin interrumpir la historia.
 */
export function LosDatos() {
  return (
    <SectionAnchor id="datos" accent="caso">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-caso">
          Capítulo 2 de 6
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Los datos
        </h2>
      </header>

      <p className="mb-6 text-base leading-relaxed text-slate-700">
        Antes de estimar nada, observa la información con la que contamos.
        Esta es la ficha del caso:
      </p>

      <dl className="mb-6 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2">
        {FICHA.map((row) => (
          <div key={row.label} className="bg-white px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <Card title="Perfil de carga (24 h)">
        <DatasetChart
          referenceX={14.5}
          referenceLabelLines={[
            'Aquí conocemos las 14:00 y las 15:00,',
            'pero no el valor intermedio',
          ]}
        />
        <p className="mt-2 text-sm italic text-slate-500">
          La línea ámbar marca las 14:30: el instante que el equipo de
          operación necesita conocer y para el que no existe medición.
        </p>
      </Card>

      <div className="mt-6">
        <Card title="Tabla de demanda horaria">
          <DatasetTable />
        </Card>
      </div>

      <details className="group mt-6 rounded-lg border border-slate-200 bg-slate-50">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden="true"
            className="mr-2 inline-block transition-transform group-open:rotate-90"
          >
            ▸
          </span>
          Conocer el contexto energético
        </summary>
        <div className="border-t border-slate-200 px-4 py-4">
          <p className="mb-4 text-base leading-relaxed text-slate-700">
            Cumbres Data Center S.A. es una instalación ficticia Tier III
            ubicada en Belén, Heredia, calibrada con los promedios del Global
            Data Center Survey de Uptime Institute (2024) para sitios de su
            categoría en América Latina. Con 1500 kW de pico vespertino,
            1240 kW de base nocturna y un PUE de 1.55, la instalación
            reproduce el perfil térmico descrito por Avelar et al. (2012)
            para data centers de gama media en clima tropical de altura.
          </p>

          <p className="mb-4 text-base leading-relaxed text-slate-700">
            El indicador de eficiencia energética PUE (Power Usage
            Effectiveness) propuesto por Belady et al. (2008) resume la
            relación entre la potencia total entregada al sitio y la potencia
            consumida por la carga de TI:
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

          <p className="mt-4 text-base leading-relaxed text-slate-700">
            El dataset de trabajo contiene 24 observaciones horarias (h, kW)
            correspondientes a un martes laboral típico, presentadas arriba en
            formato listo para el análisis numérico.
          </p>
        </div>
      </details>
    </SectionAnchor>
  );
}

export default LosDatos;
