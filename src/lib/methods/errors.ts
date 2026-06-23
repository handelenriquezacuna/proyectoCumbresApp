/**
 * Error metrics for evaluating a model's fit on a set of observations.
 *
 * All functions take two equally-sized arrays: `actual` (observed) and
 * `predicted` (model output). They throw when sizes differ. MAPE guards
 * against division-by-zero by skipping zero observations, and returns 0
 * when every observation is zero.
 */

function assertSameLength(actual: number[], predicted: number[]): void {
  if (actual.length !== predicted.length) {
    throw new Error(
      `error metric: length mismatch, actual=${actual.length} predicted=${predicted.length}`,
    );
  }
}

export function mse(actual: number[], predicted: number[]): number {
  assertSameLength(actual, predicted);
  const n = actual.length;
  if (n === 0) return 0;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = actual[i]! - predicted[i]!;
    s += d * d;
  }
  return s / n;
}

export function mae(actual: number[], predicted: number[]): number {
  assertSameLength(actual, predicted);
  const n = actual.length;
  if (n === 0) return 0;
  let s = 0;
  for (let i = 0; i < n; i++) {
    s += Math.abs(actual[i]! - predicted[i]!);
  }
  return s / n;
}

export function mape(actual: number[], predicted: number[]): number {
  assertSameLength(actual, predicted);
  const n = actual.length;
  if (n === 0) return 0;
  let s = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    const a = actual[i]!;
    if (a === 0) continue;
    s += Math.abs((a - predicted[i]!) / a);
    count++;
  }
  if (count === 0) return 0;
  return (s / count) * 100;
}

export function rSquared(actual: number[], predicted: number[]): number {
  assertSameLength(actual, predicted);
  const n = actual.length;
  if (n === 0) return 0;
  let mean = 0;
  for (let i = 0; i < n; i++) {
    mean += actual[i]!;
  }
  mean /= n;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const a = actual[i]!;
    const p = predicted[i]!;
    ssRes += (a - p) * (a - p);
    ssTot += (a - mean) * (a - mean);
  }
  if (ssTot === 0) {
    return ssRes === 0 ? 1 : 0;
  }
  return 1 - ssRes / ssTot;
}
