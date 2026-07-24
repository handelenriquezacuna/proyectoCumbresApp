import type { FitResult, Method, Point } from './types';
import { gaussSolve } from './linalg';
import { mae, mape, mse, rSquared } from './errors';
import { trunc5 } from '@/lib/format';

/**
 * Polynomial least-squares fit of arbitrary degree (1..5).
 *
 * Builds the Vandermonde matrix A (n rows x degree+1 cols), forms the
 * normal equations A^T A a = A^T y and solves them with Gauss elimination.
 *
 * Sigue la convención del machote de Excel del curso: cada celda tabulada
 * (Xi^k y Xi^k·Yi) se trunca a 5 decimales antes de sumarse, el sistema se
 * resuelve con precisión completa (como la calculadora) y los coeficientes
 * finales se truncan a 5 decimales; las predicciones usan esos coeficientes
 * truncados. Así las métricas coinciden con la Hoja de cálculo y el Word.
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

  // Sumas de las columnas del machote: S[e] = Σ TRUNC(x_i^e, 5) para
  // e = 0..2·degree, y T[e] = Σ TRUNC(x_i^e · y_i, 5) para e = 0..degree.
  const S = new Array<number>(2 * degree + 1).fill(0);
  const T = new Array<number>(k).fill(0);
  for (let i = 0; i < n; i++) {
    const xi = points[i]!.x;
    const yi = points[i]!.y;
    let pow = 1;
    for (let e = 0; e <= 2 * degree; e++) {
      S[e] = S[e]! + trunc5(pow);
      if (e < k) {
        T[e] = T[e]! + trunc5(pow * yi);
      }
      pow *= xi;
    }
  }

  // Normal equations: AtA[r][c] = S[r+c], Aty[r] = T[r].
  const AtA: number[][] = new Array(k);
  for (let r = 0; r < k; r++) {
    const row = new Array<number>(k);
    for (let c = 0; c < k; c++) {
      row[c] = S[r + c]!;
    }
    AtA[r] = row;
  }
  const Aty = T.slice();

  const coeffs = gaussSolve(AtA, Aty).map(trunc5);

  const evaluate = (x: number): number => {
    // Forma de potencias a_0 + a_1·x + a_2·x² + ... (no Horner): es como
    // evalúa el machote/canónico y el orden de las operaciones flotantes
    // cambia el 5º decimal, que aquí debe coincidir dígito a dígito.
    let acc = 0;
    for (let j = 0; j <= degree; j++) {
      acc += coeffs[j]! * Math.pow(x, j);
    }
    return acc;
  };

  const actual = points.map((p) => p.y);
  const predicted = points.map((p) => trunc5(evaluate(p.x)));

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
