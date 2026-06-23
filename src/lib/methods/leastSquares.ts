import type { FitResult, Method, Point } from './types';
import { gaussSolve } from './linalg';
import { mae, mape, mse, rSquared } from './errors';

/**
 * Polynomial least-squares fit of arbitrary degree (1..5).
 *
 * Builds the Vandermonde matrix A (n rows x degree+1 cols), forms the
 * normal equations A^T A a = A^T y and solves them with Gauss elimination.
 *
 * References: Chapra & Canale (2015) ch. 17, Hong & Fan (2016).
 */
export function fitLeastSquares(points: Point[], degree: number): FitResult {
  if (!Number.isInteger(degree) || degree < 1 || degree > 5) {
    throw new Error(
      `fitLeastSquares: degree must be an integer in [1, 5], got ${degree}`,
    );
  }
  const n = points.length;
  const k = degree + 1;
  if (n < k) {
    throw new Error(
      `fitLeastSquares: need at least ${k} points for degree ${degree}, got ${n}`,
    );
  }

  // Vandermonde: A[i][j] = x_i^j  (j = 0..degree).
  const A: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = new Array<number>(k);
    const xi = points[i]!.x;
    let pow = 1;
    for (let j = 0; j < k; j++) {
      row[j] = pow;
      pow *= xi;
    }
    A[i] = row;
  }

  // Normal equations: AtA (k x k), Aty (length k).
  const AtA: number[][] = new Array(k);
  for (let i = 0; i < k; i++) {
    AtA[i] = new Array<number>(k).fill(0);
  }
  const Aty = new Array<number>(k).fill(0);
  for (let i = 0; i < n; i++) {
    const row = A[i]!;
    const yi = points[i]!.y;
    for (let r = 0; r < k; r++) {
      const ar = row[r]!;
      Aty[r] = Aty[r]! + ar * yi;
      for (let c = 0; c < k; c++) {
        AtA[r]![c] = AtA[r]![c]! + ar * row[c]!;
      }
    }
  }

  const coeffs = gaussSolve(AtA, Aty);

  const evaluate = (x: number): number => {
    // Horner: a_0 + x (a_1 + x (a_2 + ...))
    let acc = coeffs[degree]!;
    for (let j = degree - 1; j >= 0; j--) {
      acc = acc * x + coeffs[j]!;
    }
    return acc;
  };

  const actual = points.map((p) => p.y);
  const predicted = points.map((p) => evaluate(p.x));

  let method: Method;
  if (degree === 3) {
    method = 'ls3';
  } else if (degree === 5) {
    method = 'ls5';
  } else {
    // For degrees 1, 2, 4 we surface the result under 'ls3' as a default
    // bucket because the public Method union only enumerates the two
    // showcased degrees. UI components decide labels using the coefficient
    // length / degree, not this tag.
    method = 'ls3';
  }

  return {
    method,
    coefficients: coeffs,
    evaluate,
    latex: lsLatex(coeffs),
    metrics: {
      mse: mse(actual, predicted),
      mae: mae(actual, predicted),
      mape: mape(actual, predicted),
      r2: rSquared(actual, predicted),
    },
  };
}

function formatNumber(n: number, sig = 4): string {
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0';
  return Number(n.toPrecision(sig)).toString();
}

/**
 * Format a polynomial with coefficients [a_0, a_1, ..., a_n] as:
 *   "a_0 + a_1 x + a_2 x^{2} + ..."
 * with signs adjusted ("+ -" → "-") and coefficients to 4 significant
 * figures.
 */
function lsLatex(coeffs: number[]): string {
  if (coeffs.length === 0) return '0';
  const parts: string[] = [];
  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i]!;
    if (i === 0) {
      parts.push(formatNumber(c));
      continue;
    }
    const abs = Math.abs(c);
    const sign = c >= 0 ? ' + ' : ' - ';
    const monomial =
      i === 1 ? `${formatNumber(abs)}x` : `${formatNumber(abs)}x^{${i}}`;
    parts.push(sign + monomial);
  }
  return parts.join('');
}
