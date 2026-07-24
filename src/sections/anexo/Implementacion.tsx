import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Anexo (#implementacion): describe el flujo de trabajo numérico
 * (Excel, GeoGebra, código TypeScript) y recuerda el riesgo de Runge con
 * polinomios de alto grado. La tabla comparativa de métricas (MSE, MAE,
 * MAPE, R²) vive en el capítulo "La decisión" (#decision) y aquí solo se
 * referencia para no duplicarla.
 */
export function Implementacion() {
  return (
    <SectionAnchor id="implementacion" accent="implementacion">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-implementacion">
          Anexo
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Implementación Numérica
        </h2>
      </header>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        La implementación del modelo se apoya en tres herramientas
        complementarias. Excel resulta práctico para la organización inicial de
        los datos y el cálculo de diferencias divididas; GeoGebra ofrece una
        visualización rápida de los polinomios candidatos; y la aplicación
        TypeScript que acompaña a este informe automatiza el cómputo en doble
        precisión y verifica los resultados contra suites de pruebas
        unitarias (Mora Flores, 2022).
      </p>

      <div
        role="alert"
        aria-label="Advertencia sobre el fenómeno de Runge"
        className="mb-4 rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900"
      >
        <p className="font-semibold">Atención: fenómeno de Runge</p>
        <p className="mt-1 leading-relaxed">
          La interpolación polinómica sobre los 24 puntos del conjunto de datos produce
          oscilaciones extremas cerca de las horas 0 y 23. En esta aplicación,
          los polinomios de Newton y Lagrange de grado 23 oscilan entre
          aproximadamente −59 000 y +66 000 kW en los extremos, lo cual
          carece de sentido físico. Se recomienda usar mínimos cuadrados de grado
          3 a 6 para fines de pronóstico.
        </p>
      </div>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        La validación del ajuste se efectúa con cuatro métricas estándar de la
        literatura de pronóstico de demanda: el error cuadrático medio (MSE)
        penaliza desviaciones grandes; el error absoluto medio (MAE) ofrece
        una lectura intuitiva en kW; el porcentaje absoluto medio (MAPE) es
        adimensional y permite comparar entre métodos; y el coeficiente de
        determinación R² mide la proporción de varianza explicada. Un buen
        modelo combina MAPE bajo (idealmente menor a 3 %) con R² cercano a 1.
      </p>

      <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        La tabla comparativa completa de métricas y las curvas superpuestas de
        los cuatro métodos se presentan en el capítulo{' '}
        <a
          className="font-semibold text-blue-700 underline underline-offset-2"
          href="#decision"
        >
          La decisión
        </a>
        .
      </p>
    </SectionAnchor>
  );
}

export default Implementacion;
