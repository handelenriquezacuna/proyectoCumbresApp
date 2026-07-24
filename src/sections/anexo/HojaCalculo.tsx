import type { ReactNode } from 'react';
import { ExcelSheet } from '@/components/excel/ExcelSheet';
import { SectionAnchor } from '@/components/layout/SectionAnchor';
import { KatexEquation } from '@/components/math/KatexEquation';
import { Tabs } from '@/components/ui/Tabs';
import { fmtTrunc5 } from '@/lib/format';
import {
  ERRORES,
  LAGRANGE_14_5,
  MMC_GRADO_3,
  MMC_GRADO_5,
  NEWTON_14_5,
  NEWTON_7_5,
  type FitMetrics,
  type LeastSquaresFit,
} from '@/lib/machote/canonical';
import {
  MMC_SYSTEM_START_ROW,
  buildErroresGrid,
  buildLagrangeGrid,
  buildMmcSumsGrid,
  buildMmcSystemGrid,
  buildNewtonGrid,
  buildNewtonVsLagrangeGrid,
} from '@/lib/machote/grids';

/* Las grillas se arman una sola vez a nivel de módulo: los datos canónicos
 * son estáticos y no se recalcula nada en runtime. */
const NEWTON_GRID_14_5 = buildNewtonGrid(NEWTON_14_5);
const NEWTON_GRID_7_5 = buildNewtonGrid(NEWTON_7_5);
const LAGRANGE_GRID = buildLagrangeGrid(LAGRANGE_14_5);
const MMC3_SUMS = buildMmcSumsGrid(MMC_GRADO_3);
const MMC3_SYSTEM = buildMmcSystemGrid(MMC_GRADO_3);
const MMC5_SUMS = buildMmcSumsGrid(MMC_GRADO_5);
const MMC5_SYSTEM = buildMmcSystemGrid(MMC_GRADO_5);
const ERRORES_MMC3 = buildErroresGrid(ERRORES.mmc3);
const ERRORES_MMC5 = buildErroresGrid(ERRORES.mmc5);
const NEWTON_VS_LAGRANGE = buildNewtonVsLagrangeGrid(ERRORES.newtonVsLagrange);

const COEF_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

/** Modelo general del MMC con letras del machote: y = a + b x + c x^2 + ... */
function modelLatex(degree: number): string {
  const terms: string[] = [];
  for (let k = 0; k <= degree; k += 1) {
    const letter = COEF_LETTERS[k] ?? `a_{${k}}`;
    if (k === 0) terms.push(letter);
    else if (k === 1) terms.push(`${letter}\\,x`);
    else terms.push(`${letter}\\,x^{${k}}`);
  }
  return `y = ${terms.join(' + ')}`;
}

/** Polinomio resultante con los coeficientes truncados (TRUNC 5). */
function polyLatex(coefs: readonly number[]): string {
  const parts: string[] = [];
  coefs.forEach((c, i) => {
    const abs = fmtTrunc5(Math.abs(c));
    const x = i === 0 ? '' : i === 1 ? '\\,x' : `\\,x^{${i}}`;
    const term = `${abs}${x}`;
    if (parts.length === 0) parts.push(c < 0 ? `-${term}` : term);
    else parts.push(c < 0 ? `- ${term}` : `+ ${term}`);
  });
  return `y \\approx ${parts.join(' ')}`;
}

/**
 * Tarjeta "¿Cómo leer estas hojas?": guía de entrada para quien nunca ha
 * visto el machote. Solo texto; no toca datos ni cálculos.
 */
function ComoLeerCard() {
  return (
    <div className="mb-6 rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">¿Cómo leer estas hojas?</h3>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
        <li>
          Colores: las celdas <span className="font-semibold text-blue-700">azules</span> son datos
          medidos del caso Cumbres (la convención contable de Excel), las{' '}
          <span className="font-semibold text-slate-900">negras</span> son celdas calculadas y las{' '}
          <span className="rounded bg-yellow-100 px-1 font-semibold text-slate-900">amarillas</span>{' '}
          son resultados finales.
        </li>
        <li>
          Cada celda calculada aplica{' '}
          <code className="rounded bg-slate-200 px-1 text-[0.8rem]">TRUNC(...,5)</code> — truncar a
          5 decimales, la regla del machote del curso — y la celda siguiente usa el valor ya
          truncado, igual que en Excel.
        </li>
        <li>
          Hacé clic en cualquier celda calculada para ver su fórmula en la barra <em>fx</em>, como
          en Excel.
        </li>
      </ol>
    </div>
  );
}

/**
 * Bloque de dos preguntas que abre cada tab: "¿Qué estoy viendo?" y
 * "¿Por qué se hace así?", en lenguaje llano para lectores sin contexto.
 */
function GuiaTab({ queVeo, porQue }: { queVeo: ReactNode; porQue: ReactNode }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <h4 className="mb-1.5 text-sm font-semibold text-slate-800">¿Qué estoy viendo?</h4>
        <div className="space-y-1.5 text-sm leading-relaxed text-slate-600">{queVeo}</div>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <h4 className="mb-1.5 text-sm font-semibold text-slate-800">¿Por qué se hace así?</h4>
        <div className="space-y-1.5 text-sm leading-relaxed text-slate-600">{porQue}</div>
      </div>
    </div>
  );
}

function Metricas({ metrics }: { metrics: FitMetrics }) {
  const items: ReadonlyArray<{ label: string; value: string; detail: string }> = [
    {
      label: 'ECM',
      value: fmtTrunc5(metrics.mse),
      detail: 'error cuadrático medio: castiga fuerte los errores grandes',
    },
    {
      label: 'EAM',
      value: fmtTrunc5(metrics.mae),
      detail: 'el error promedio, en kW',
    },
    {
      label: 'MAPE',
      value: `${fmtTrunc5(metrics.mape)} %`,
      detail: 'ese error promedio, en porcentaje',
    },
    {
      label: 'R²',
      value: fmtTrunc5(metrics.r2),
      detail: 'cuánta variación de los datos explica el modelo (1 = perfecto)',
    },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm"
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {item.label}
          </dt>
          <dd className="text-lg font-bold tabular-nums text-slate-900">{item.value}</dd>
          <dd className="text-xs text-slate-500">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

function NewtonTab() {
  return (
    <div className="space-y-4">
      <KatexEquation
        latex="P_4(x) = a_0 + a_1(x - x_0) + a_2(x - x_0)(x - x_1) + \cdots + a_4 \prod_{k=0}^{3}(x - x_k)"
        caption="Forma de Newton: cada a_k sale de la tabla diagonal de diferencias divididas."
        accent="hoja"
      />
      <GuiaTab
        queVeo={
          <ul className="list-disc space-y-1 pl-4">
            <li>
              La tabla de diferencias divididas. Una diferencia dividida es una pendiente entre dos
              puntos; la columna siguiente es la &ldquo;pendiente entre pendientes&rdquo;, y así
              sucesivamente.
            </li>
            <li>
              La tabla es diagonal porque cada columna necesita dos valores de la anterior: por eso
              cada orden tiene una fila menos.
            </li>
            <li>
              La fila <span className="font-medium">Img por ai</span> dice cuánto aporta cada
              término del polinomio al resultado en x&nbsp;=&nbsp;14.5; la imagen final es la SUMA
              de esos aportes.
            </li>
          </ul>
        }
        porQue={
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Elegimos los 5 nodos más cercanos a 14.5 (horas 12–16) y no los 24 puntos: un
              polinomio de grado alto oscila entre los nodos (fenómeno de Runge) en lugar de estimar
              mejor.
            </li>
            <li>
              La primera celda de cada columna es directamente un coeficiente a<sub>k</sub> del
              polinomio: la tabla es la &ldquo;fábrica&rdquo; de coeficientes de Newton.
            </li>
          </ul>
        }
      />
      <p className="text-sm leading-relaxed text-slate-700">
        Igual que en la hoja <em>Diferencia divididas</em> del machote: cada celda aplica TRUNC a 5
        decimales y la siguiente usa el valor ya truncado (truncación en cascada). La fila{' '}
        <span className="font-medium">Img por ai</span> evalúa cada término en x = 14.5 y el cierre
        suma la fila sin truncar.
      </p>
      <ExcelSheet
        rows={NEWTON_GRID_14_5}
        sheetName="Diferencia divididas — x = 14.5"
        ariaLabel="Tabla de diferencias divididas de Newton para x igual a 14.5"
        showLegend
      />
      <details className="rounded-md border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Caso secundario: x = 7.5 con nodos 5–9 (madrugada)
        </summary>
        <div className="px-4 pb-4 pt-2">
          <ExcelSheet
            rows={NEWTON_GRID_7_5}
            sheetName="Diferencia divididas — x = 7.5"
            ariaLabel="Tabla de diferencias divididas de Newton para x igual a 7.5"
          />
          <p className="mt-3 text-sm text-slate-600">
            En este tramo a3 y a4 dan 0: esa zona de la madrugada se comporta como una parábola
            (curvatura constante), así que las diferencias de orden 3 en adelante se anulan y el
            polinomio corta en grado 2.
          </p>
        </div>
      </details>
    </div>
  );
}

function LagrangeTab() {
  return (
    <div className="space-y-4">
      <KatexEquation
        latex="P(x) = \sum_{k=0}^{4} y_k \, \frac{\prod_{j \neq k}(x - x_j)}{\prod_{j \neq k}(x_k - x_j)}"
        caption="Forma de Lagrange: numeradores evaluados en x, denominadores fijos por nodo."
        accent="hoja"
      />
      <GuiaTab
        queVeo={
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Los polinomios base L<sub>k</sub>: cada uno es una &ldquo;campana&rdquo; que vale 1 en
              su nodo y 0 en los otros cuatro.
            </li>
            <li>
              Los denominadores son fijos (solo dependen de los nodos); los numeradores dependen del
              punto a estimar, x&nbsp;=&nbsp;14.5.
            </li>
            <li>
              La fila <span className="font-medium">Lagrange</span> pondera cada y<sub>i</sub> según
              el peso de su nodo cerca de 14.5; la imagen es la suma de esos términos.
            </li>
          </ul>
        }
        porQue={
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Es otra ruta al mismo destino: da (casi) lo mismo que Newton — 1497.57813 vs
              1497.57811 — porque el polinomio interpolante que pasa por 5 puntos es ÚNICO.
            </li>
            <li>
              La diferencia de 0.00002 no es del método: es solo ruido del truncamiento a 5
              decimales en cada celda.
            </li>
          </ul>
        }
      />
      <p className="text-sm leading-relaxed text-slate-700">
        Réplica de la hoja <em>Lagrange</em> del machote: primero los denominadores L<sub>k</sub>{' '}
        (solo dependen de los nodos), luego los numeradores evaluados en x = 14.5, y por último cada
        término T<sub>k</sub> = TRUNC(y<sub>k</sub>·N<sub>k</sub>/L<sub>k</sub>, 5). El cierre suma
        los cinco términos sin truncar.
      </p>
      <ExcelSheet
        rows={LAGRANGE_GRID}
        sheetName="Lagrange — x = 14.5"
        ariaLabel="Hoja de Lagrange para x igual a 14.5"
        showLegend
      />
    </div>
  );
}

function MmcTab({
  fit,
  sums,
  system,
}: {
  fit: LeastSquaresFit;
  sums: ReturnType<typeof buildMmcSumsGrid>;
  system: ReturnType<typeof buildMmcSystemGrid>;
}) {
  return (
    <div className="space-y-4">
      <KatexEquation
        latex={modelLatex(fit.degree)}
        caption={`Modelo de mínimos cuadrados de grado ${fit.degree}; los coeficientes salen del sistema de ecuaciones normales.`}
        accent="hoja"
      />
      <GuiaTab
        queVeo={
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Las columnas Xi², Xi³, … y XiYi, Xi²Yi, … son los bloques con que se arma el sistema
              de ecuaciones normales: cada potencia y cada producto que el sistema va a necesitar.
            </li>
            <li>
              La fila <span className="font-medium">Sumatoria</span> suma cada columna sobre las 24
              horas; cada ecuación del sistema (1er ec, 2da ec, …) se arma copiando esas sumas en su
              posición.
            </li>
          </ul>
        }
        porQue={
          <ul className="list-disc space-y-1 pl-4">
            <li>
              La fila de coeficientes no tiene fórmula: el sistema se resuelve con la calculadora,
              como en clase, y el resultado se trunca a 5 decimales.
            </li>
            <li>
              Grado 3 suaviza la tendencia general del día; grado 5 sigue mejor la curva, pero con
              más riesgo de sobreajuste.
            </li>
          </ul>
        }
      />
      <p className="text-sm leading-relaxed text-slate-700">
        Como en la hoja <em>R. Cuadrática</em> del machote (generalizada a grado {fit.degree}): cada
        columna auxiliar aplica TRUNC 5, la fila <span className="font-medium">Sumatoria</span> suma
        las 24 mediciones horarias, y esas sumas alimentan el sistema de ecuaciones normales.
      </p>
      <ExcelSheet
        rows={sums}
        sheetName={`Sumatorias — grado ${fit.degree}`}
        maxHeightClassName="max-h-[26rem]"
        ariaLabel={`Tabla de sumatorias del ajuste de grado ${fit.degree}`}
        showLegend
      />
      <h4 className="pt-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
        Sistema de ecuaciones normales ({fit.degree + 1}×{fit.degree + 1})
      </h4>
      <ExcelSheet
        rows={system}
        startRow={MMC_SYSTEM_START_ROW}
        sheetName="Ecuaciones normales"
        ariaLabel={`Sistema de ecuaciones normales del ajuste de grado ${fit.degree}`}
      />
      <p className="text-sm text-slate-600">
        Cada coeficiente del sistema referencia la fila 26 (Sumatoria) de la tabla de arriba. El
        sistema se resuelve con precisión completa —como la calculadora del profe— y los
        coeficientes se presentan con TRUNC 5; predicciones y métricas se calculan con los
        coeficientes truncados.
      </p>
      <KatexEquation
        latex={polyLatex(fit.coefficients)}
        caption="Polinomio de ajuste con los coeficientes truncados a 5 decimales."
        accent="hoja"
      />
      <Metricas metrics={fit.metrics} />
    </div>
  );
}

function ErroresTab() {
  return (
    <div className="space-y-4">
      <KatexEquation
        latex="E_{abs} = |V_e - V_a| \qquad E_{rel} = \frac{|V_e - V_a|}{V_e} \qquad E_{\%} = \frac{|V_e - V_a|}{V_e} \cdot 100"
        caption="Hoja Errores del machote: cada error aplica TRUNC a 5 decimales."
        accent="hoja"
      />
      <GuiaTab
        queVeo={
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <span className="font-medium">V.Exacto</span> es la medición real de esa hora y{' '}
              <span className="font-medium">V.Aprox</span> lo que predice el ajuste por mínimos
              cuadrados.
            </li>
            <li>
              Tres formas de medir la misma distancia: error absoluto (en kW), relativo (proporción
              del valor real) y porcentual (el relativo por 100).
            </li>
          </ul>
        }
        porQue={
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Se comparan las horas 13–15 porque son la zona del pico de demanda, la más crítica
              para operar el data center: ahí un error cuesta más.
            </li>
            <li>
              El bloque Newton vs Lagrange no mide calidad sino unicidad: dos métodos distintos
              deben producir el mismo polinomio.
            </li>
          </ul>
        }
      />
      <p className="text-sm leading-relaxed text-slate-700">
        V.Exacto es la medición real de la hora pico (13:00–15:00) y V.Aprox la predicción de cada
        ajuste por mínimos cuadrados. El grado 5 baja el error porcentual muy por debajo del 1 % en
        las tres horas.
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
            Contra MMC grado 3
          </h4>
          <ExcelSheet
            rows={ERRORES_MMC3}
            sheetName="Errores — MMC grado 3"
            ariaLabel="Errores del ajuste de grado 3 en las horas 13 a 15"
            showLegend
          />
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
            Contra MMC grado 5
          </h4>
          <ExcelSheet
            rows={ERRORES_MMC5}
            sheetName="Errores — MMC grado 5"
            ariaLabel="Errores del ajuste de grado 5 en las horas 13 a 15"
          />
        </div>
      </div>
      <h4 className="pt-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
        Newton vs Lagrange en x = 14.5
      </h4>
      <ExcelSheet
        rows={NEWTON_VS_LAGRANGE}
        sheetName="Unicidad del polinomio"
        ariaLabel="Comparación de Newton y Lagrange en x igual a 14.5"
      />
      <p className="text-sm leading-relaxed text-slate-700">
        El polinomio interpolante es único: ambos métodos construyen el mismo polinomio de grado 4,
        así que la diferencia de 0.00002 no es del método sino del arrastre de la truncación a 5
        decimales en cada celda.
      </p>
    </div>
  );
}

/**
 * Sección 10 (#hoja): réplica navegable del machote de Excel del curso.
 * Consume exclusivamente los valores canónicos precalculados
 * (src/lib/machote/canonical.ts); no se recalcula nada en runtime.
 */
export function HojaCalculo() {
  return (
    <SectionAnchor id="hoja" accent="hoja">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-hoja">
          Anexo
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Hoja de cálculo</h2>
      </header>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        Esta sección replica el machote de Excel del curso celda por celda, con los mismos números y
        la misma disposición — así podés explicar de dónde sale cada número durante la presentación.
        Si nunca has visto el machote, empezá por esta guía:
      </p>

      <ComoLeerCard />

      <Tabs
        ariaLabel="Hojas del machote"
        tabs={[
          { id: 'newton', label: 'Newton', content: <NewtonTab /> },
          { id: 'lagrange', label: 'Lagrange', content: <LagrangeTab /> },
          {
            id: 'mmc3',
            label: 'MMC grado 3',
            content: <MmcTab fit={MMC_GRADO_3} sums={MMC3_SUMS} system={MMC3_SYSTEM} />,
          },
          {
            id: 'mmc5',
            label: 'MMC grado 5',
            content: <MmcTab fit={MMC_GRADO_5} sums={MMC5_SUMS} system={MMC5_SYSTEM} />,
          },
          { id: 'errores', label: 'Errores', content: <ErroresTab /> },
        ]}
      />
    </SectionAnchor>
  );
}

export default HojaCalculo;
