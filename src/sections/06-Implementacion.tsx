import { Card } from '@/components/ui/Card';
import { ErrorComparison } from '@/components/compare/ErrorComparison';
import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Sección 5 (#implementacion): describe el flujo de trabajo numérico
 * (Excel, GeoGebra, código TypeScript), recuerda el riesgo de Runge con
 * polinomios de alto grado y presenta la tabla comparativa de métricas
 * (MSE, MAE, MAPE, R²).
 */
export function Implementacion() {
  return (
    <SectionAnchor id="implementacion" accent="implementacion">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-implementacion">
          Capítulo 5
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
          La interpolación polinómica sobre los 24 puntos del dataset produce
          oscilaciones extremas cerca de las horas 0 y 23. En esta aplicación,
          los polinomios de Newton y Lagrange de grado 23 muestran amplitudes
          superiores a 10<sup>6</sup> kW en los extremos, lo cual carece de
          sentido físico. Se recomienda usar mínimos cuadrados de grado
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

      <Card title="Comparación de métodos en el dataset Cumbres">
        <ErrorComparison />
      </Card>
    </SectionAnchor>
  );
}

export default Implementacion;
