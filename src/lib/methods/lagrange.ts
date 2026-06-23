import type { FitResult, Point } from './types';
import { dividedDifferences } from './newton';
import { mae, mape, mse, rSquared } from './errors';

/**
 * Evaluate the Lagrange interpolating polynomial at a point x.
 *
 *   L(x) = Σ_i y_i Π_{j != i} (x - x_j) / (x_i - x_j)
 *
 * Reference: Chapra & Canale (2015), ch. 18.
 */
export function evalLagrange(points: Point[], x: number): number {
  const n = points.length;
  if (n === 0) return 0;
  let result = 0;
  for (let i = 0; i < n; i++) {
    const pi = points[i]!;
    let term = pi.y;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const pj = points[j]!;
      const denom = pi.x - pj.x;
      if (denom === 0) {
        throw new Error(
          `evalLagrange: duplicated x value at indices ${i} and ${j}`,
        );
      }
      term *= (x - pj.x) / denom;
    }
    result += term;
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
