import type { FitResult, Point } from './types';
import { mae, mape, mse, rSquared } from './errors';
import { trunc5 } from '@/lib/format';

/**
 * Compute Newton's divided differences for a set of (x, y) data points.
 *
 * Given n+1 points, the returned array contains the n+1 leading
 * coefficients a_0, a_1, ..., a_n of the Newton interpolating polynomial:
 *
 *   P(x) = a_0 + a_1 (x - x_0) + a_2 (x - x_0)(x - x_1) + ...
 *
 * A escala machote (hasta 6 nodos, el máximo que tabula el Excel del
 * curso) cada diferencia dividida se trunca a 5 decimales en cascada
 * (TRUNC), de modo que la tabla interactiva coincide dígito a dígito con
 * la hoja de cálculo y con el documento del equipo. Con más nodos (p.ej.
 * la demo de Runge sobre los 24 puntos) se usa precisión completa: ahí la
 * truncación multiplicada por productos (x-x_0)···(x-x_22) ~ 1e20 haría
 * explotar el polinomio incluso en los propios nodos.
 *
 * Reference: Burden & Faires (2017), Numerical Analysis, ch. 3.
 */
export const MACHOTE_MAX_NODES = 6;

export function dividedDifferences(points: Point[]): number[] {
  const n = points.length;
  if (n === 0) return [];

  const xs: number[] = new Array(n);
  const F: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const p = points[i]!;
    xs[i] = p.x;
    F[i] = new Array<number>(n).fill(0);
    F[i]![0] = p.y;
  }
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      const dx = xs[i + j]! - xs[i]!;
      if (dx === 0) {
        throw new Error(
          `dividedDifferences: duplicated x value at indices ${i} and ${i + j}`,
        );
      }
      const dd = (F[i + 1]![j - 1]! - F[i]![j - 1]!) / dx;
      F[i]![j] = n <= MACHOTE_MAX_NODES ? trunc5(dd) : dd;
    }
  }

  const coefs = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    coefs[i] = F[0]![i]!;
  }
  return coefs;
}

/**
 * Evaluate the Newton interpolating polynomial at a point x.
 *
 * `coefs` must come from `dividedDifferences` and `xs` is the array of
 * node x-coordinates in the same order as the original points.
 *
 * A escala machote (≤ 6 nodos) evalúa término a término como la fila
 * "Img por ai": cada término a_k·(x-x_0)···(x-x_{k-1}) se trunca a 5
 * decimales y la imagen final es la SUM de los términos (sin truncar),
 * igual que en Excel. Con más nodos evalúa con precisión completa.
 */
export function evalNewton(coefs: number[], xs: number[], x: number): number {
  const n = coefs.length;
  if (n === 0) return 0;
  const machote = n <= MACHOTE_MAX_NODES;
  let value = coefs[0]!;
  let prod = 1;
  for (let k = 1; k < n; k++) {
    prod *= x - xs[k - 1]!;
    const term = coefs[k]! * prod;
    value += machote ? trunc5(term) : term;
  }
  return value;
}

function formatNumber(n: number, sig = 4): string {
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0';
  return Number(n.toPrecision(sig)).toString();
}

/**
 * Render the Newton interpolating polynomial as KaTeX, truncating after
 * `maxTerms` terms when the table is long enough to be unreadable.
 */
function newtonLatex(coefs: number[], xs: number[], maxTerms = 6): string {
  const n = coefs.length;
  if (n === 0) return '0';
  const terms: string[] = [];
  const limit = Math.min(n, maxTerms);
  for (let i = 0; i < limit; i++) {
    const c = coefs[i]!;
    if (i === 0) {
      terms.push(formatNumber(c));
      continue;
    }
    const abs = Math.abs(c);
    const sign = c >= 0 ? ' + ' : ' - ';
    let term = `${formatNumber(abs)}`;
    for (let j = 0; j < i; j++) {
      term += `(x - ${formatNumber(xs[j]!)})`;
    }
    terms.push(sign + term);
  }
  let latex = terms.join('');
  if (n > maxTerms) {
    latex += ' + \\dots';
  }
  return latex;
}

export function fitNewton(points: Point[]): FitResult {
  const coefs = dividedDifferences(points);
  const xs = points.map((p) => p.x);
  const evaluate = (x: number): number => evalNewton(coefs, xs, x);
  const actual = points.map((p) => p.y);
  const predicted = points.map((p) => evaluate(p.x));
  return {
    method: 'newton',
    coefficients: coefs,
    evaluate,
    latex: newtonLatex(coefs, xs),
    metrics: {
      mse: mse(actual, predicted),
      mae: mae(actual, predicted),
      mape: mape(actual, predicted),
      r2: rSquared(actual, predicted),
    },
  };
}
