import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { KatexEquation } from '@/components/math/KatexEquation';
import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Sección 2 (#metodos): presenta el bloque de técnicas numéricas que el
 * informe pondrá en práctica. Se describen Newton (diferencias divididas),
 * Lagrange (polinomios de base), mínimos cuadrados ordinarios y el fenómeno
 * de Runge, anclando cada uno a sus referentes clásicos.
 */
export function Metodos() {
  return (
    <SectionAnchor id="metodos" accent="metodos">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-metodos">
          Capítulo 2
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Métodos y Técnicas
        </h2>
      </header>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        El catálogo de métodos numéricos para reconstruir una función a partir
        de puntos dispersos se organiza en dos familias complementarias.
        La interpolación obliga al modelo a pasar exactamente por cada
        observación, mientras que la regresión busca un compromiso global que
        minimice una métrica de error (Chapra y Canale, 2015).
      </p>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Polinomio interpolante de Newton
      </h3>
      <p className="mb-3 text-base leading-relaxed text-slate-700">
        La forma de Newton expresa el polinomio interpolante mediante
        diferencias divididas <InlineMath math="f[x_0,\dots,x_k]" />, lo que
        permite agregar nuevos puntos sin recomputar el sistema completo
        (Burden y Faires, 2017).
      </p>
      <KatexEquation
        accent="metodos"
        latex={String.raw`P_n(x) = f[x_0] + \sum_{k=1}^{n} f[x_0,\ldots,x_k] \prod_{j=0}^{k-1} (x - x_j)`}
        caption="Forma de Newton para el polinomio interpolante de grado n."
      />

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Polinomios de Lagrange
      </h3>
      <p className="mb-3 text-base leading-relaxed text-slate-700">
        Lagrange construye explícitamente una base de polinomios cardinales
        <span className="mx-1">
          <InlineMath math="L_k(x)" />
        </span>
        que valen 1 en
        <span className="mx-1">
          <InlineMath math="x_k" />
        </span>
        y 0 en los demás nodos. Es elegante en su formulación, pero costoso si
        la malla cambia (Chapra y Canale, 2015).
      </p>
      <KatexEquation
        accent="metodos"
        latex={String.raw`P_n(x) = \sum_{k=0}^{n} y_k\, L_k(x)`}
        caption="Polinomio de Lagrange como combinación lineal de polinomios base."
      />
      <KatexEquation
        accent="metodos"
        latex={String.raw`L_k(x) = \prod_{\substack{j=0 \\ j \ne k}}^{n} \frac{x - x_j}{x_k - x_j}`}
        caption="Polinomio cardinal de Lagrange asociado al nodo k."
      />

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Mínimos cuadrados
      </h3>
      <p className="mb-3 text-base leading-relaxed text-slate-700">
        Cuando los datos contienen ruido de medición, forzar la interpolación
        amplifica el error. La regresión polinómica de grado <InlineMath math="m" /> resuelve
        el sistema normal
        <span className="mx-1">
          <InlineMath math="(X^{\mathsf T} X)\,\boldsymbol{\beta} = X^{\mathsf T} \mathbf{y}" />
        </span>
        , una ecuación lineal bien estudiada (Burden y Faires, 2017).
      </p>
      <KatexEquation
        accent="metodos"
        latex={String.raw`\min_{\boldsymbol{\beta}} \sum_{i=0}^{N-1} \left(y_i - \sum_{j=0}^{m} \beta_j x_i^{\,j}\right)^2`}
        caption="Función objetivo de mínimos cuadrados ordinarios."
      />
      <KatexEquation
        accent="metodos"
        latex={String.raw`(X^{\mathsf T} X)\, \boldsymbol{\beta} = X^{\mathsf T} \mathbf{y}`}
        caption="Sistema normal: condición de primer orden del problema anterior."
      />

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Fenómeno de Runge
      </h3>
      <p className="text-base leading-relaxed text-slate-700">
        Subir el grado del polinomio interpolante no siempre mejora el ajuste:
        cerca de los extremos del intervalo aparecen oscilaciones de gran
        amplitud, descritas por Carl Runge en 1901, que pueden volver el modelo
        inutilizable para extrapolación (Chapra y Canale, 2015).
      </p>
    </SectionAnchor>
  );
}

export default Metodos;
