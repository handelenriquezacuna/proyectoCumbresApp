import type { FitResult, Point } from './types';
import { MACHOTE_MAX_NODES, dividedDifferences } from './newton';
import { mae, mape, mse, rSquared } from './errors';
import { trunc5 } from '@/lib/format';

/**
 * Evaluate the Lagrange interpolating polynomial at a point x.
 *
 *   L(x) = Σ_i y_i Π_{j != i} (x - x_j) / (x_i - x_j)
 *
 * A escala machote (≤ 6 nodos, como las hojas del Excel del curso) sigue
 * su layout: denominador y numerador de cada polinomio base se truncan a
 * 5 decimales, el término y_i·N_i/D_i también, y la imagen final es la
 * SUM de los términos. Con más nodos (demo de Runge sobre 24 puntos) se
 * usa precisión completa, porque truncar productos ~1e20 destruye el
 * polinomio incluso en los nodos.
 *
 * Reference: Chapra & Canale (2015), ch. 18.
 */
export function evalLagrange(points: Point[], x: number): number {
  const n = points.length;
  if (n === 0) return 0;
  const machote = n <= MACHOTE_MAX_NODES;
  let result = 0;
  for (let i = 0; i < n; i++) {
    const pi = points[i]!;
    let denom = 1;
    let numer = 1;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const pj = points[j]!;
      const d = pi.x - pj.x;
      if (d === 0) {
        throw new Error(
          `evalLagrange: duplicated x value at indices ${i} and ${j}`,
        );
      }
      denom *= d;
      numer *= x - pj.x;
    }
    result += machote
      ? trunc5((pi.y * trunc5(numer)) / trunc5(denom))
      : (pi.y * numer) / denom;
  }
  return result;
}

function formatNumber(n: number, sig = 4): string {
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0';
  return Number(n.toPrecision(sig)).toString();
}

/**
 * Render the polynomial that the Lagrange form produces in expanded
 * Newton form (it is the same polynomial), truncated after `maxTerms`
 * terms for readability.
 */
function lagrangeAsNewtonLatex(points: Point[], maxTerms = 6): string {
  const n = points.length;
  if (n === 0) return '0';
  const coefs = dividedDifferences(points);
  const xs = points.map((p) => p.x);
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

export function fitLagrange(points: Point[]): FitResult {
  const evaluate = (x: number): number => evalLagrange(points, x);
  const coefficients = dividedDifferences(points);
  const actual = points.map((p) => p.y);
  const predicted = points.map((p) => evaluate(p.x));
  return {
    method: 'lagrange',
    coefficients,
    evaluate,
    latex: lagrangeAsNewtonLatex(points),
    metrics: {
      mse: mse(actual, predicted),
      mae: mae(actual, predicted),
      mape: mape(actual, predicted),
      r2: rSquared(actual, predicted),
    },
  };
}
