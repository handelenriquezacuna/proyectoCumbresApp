import { Card } from '@/components/ui/Card';
import { ErrorComparison } from '@/components/compare/ErrorComparison';
import { SectionAnchor } from '@/components/layout/SectionAnchor';
import { TableScrollHint } from '@/components/ui/TableScrollHint';

type DecisionRow = {
  need: string;
  recommendation: string;
  tone: 'ok' | 'warn';
};

const DECISION_ROWS: ReadonlyArray<DecisionRow> = [
  {
    need: 'Estimar un punto entre horas conocidas',
    recommendation: 'Newton o Lagrange con 5–7 puntos vecinos',
    tone: 'ok',
  },
  {
    need: 'Representar la curva completa del día',
    recommendation: 'Mínimos cuadrados de grado moderado',
    tone: 'ok',
  },
  {
    need: 'Predecir más allá de los datos disponibles',
    recommendation: 'Ninguno de estos métodos por sí solo',
    tone: 'warn',
  },
  {
    need: 'Usar los 24 puntos en Newton o Lagrange',
    recommendation: 'No recomendado',
    tone: 'warn',
  },
];

/**
 * Capítulo 5 (#decision): la conclusión humana de la historia. Primero la
 * tabla Necesidad → Recomendación, luego la evidencia cuantitativa
 * (ErrorComparison completo) y el veredicto operativo del antiguo paso 9
 * del recorrido guiado.
 */
export function Decision() {
  return (
    <SectionAnchor id="decision" accent="conclusiones" deferOffscreen>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-conclusiones">
          Capítulo 5 de 6
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          La decisión
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-700">
          Después de probar cada método y ver dónde se rompe, la respuesta
          depende de qué se necesita en cada momento:
        </p>
      </header>

      <div className="mb-8">
      <TableScrollHint />
      <div
        className="overflow-x-auto rounded-lg border border-slate-200"
        role="region"
        aria-label="Tabla de decisión: necesidad y método recomendado"
      >
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th scope="col" className="px-4 py-3">
                Necesidad
              </th>
              <th scope="col" className="px-4 py-3">
                Recomendación
              </th>
            </tr>
          </thead>
          <tbody>
            {DECISION_ROWS.map((row) => (
              <tr key={row.need} className="border-t border-slate-200 bg-white">
                <td className="px-4 py-3 text-slate-700">{row.need}</td>
                <td
                  className={
                    'px-4 py-3 font-medium ' +
                    (row.tone === 'ok' ? 'text-emerald-700' : 'text-rose-700')
                  }
                >
                  {row.tone === 'ok' ? '✓ ' : '✗ '}
                  {row.recommendation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        Los números respaldan la tabla. Las cuatro métricas estándar de la
        literatura de pronóstico — MSE, MAE, MAPE y R² — evaluadas sobre los
        24 puntos observados:
      </p>

      <Card title="Comparación de métodos con los datos de Cumbres">
        <ErrorComparison />
      </Card>

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">
          Veredicto operativo
        </h3>
        <p className="text-base leading-relaxed text-slate-700">
          El proyecto académico responde a la pregunta:{' '}
          <em>
            ¿de qué manera Newton, Lagrange y mínimos cuadrados pueden
            utilizarse para predecir la demanda eléctrica en intervalos
            intermedios no medidos, y cuál ofrece mejor aproximación?
          </em>
        </p>
        <p className="text-base leading-relaxed text-slate-700">
          En Cumbres Data Center S.A., una integración pragmática combinaría
          ambos enfoques: <strong>MMC grado 5</strong> como modelo base para
          la consola de operación, con{' '}
          <strong>Newton sobre 5 puntos vecinos</strong> cuando se solicita
          una estimación puntual de alta precisión en una ventana corta.
          Extrapolar fuera del rango medido queda fuera del alcance de estos
          métodos y exigiría modelos de serie de tiempo (ver el anexo
          "Perspectivas futuras").
        </p>
        <p className="text-sm italic text-slate-500">
          Para fijar conceptos, te invitamos a la{' '}
          <a className="font-semibold text-blue-700 underline" href="#quiz">
            autoevaluación del anexo →
          </a>
        </p>
      </div>
    </SectionAnchor>
  );
}

export default Decision;
