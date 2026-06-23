/**
 * Gauss elimination with partial pivoting.
 *
 * Solves the linear system A x = b for a square matrix A (n x n) and a
 * right-hand-side vector b of length n. Throws when the matrix is singular
 * (or numerically singular) so that callers can surface a meaningful error
 * to the user.
 *
 * Reference: Chapra & Canale (2015), Numerical Methods for Engineers, ch. 9.
 */
export function gaussSolve(A: number[][], b: number[]): number[] {
  const n = A.length;
  if (n === 0) {
    return [];
  }
  if (b.length !== n) {
    throw new Error(
      `gaussSolve: dimension mismatch, A is ${n}x${n} but b has length ${b.length}`,
    );
  }

  // Build the augmented matrix as deep copies so the inputs are not mutated.
  const M: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = A[i];
    const bi = b[i];
    if (row === undefined || bi === undefined) {
      throw new Error(`gaussSolve: missing row ${i}`);
    }
    if (row.length !== n) {
      throw new Error(
        `gaussSolve: A is not square, row ${i} has length ${row.length}`,
      );
    }
    const copy = new Array<number>(n + 1);
    for (let j = 0; j < n; j++) {
      const v = row[j];
      if (v === undefined) {
        throw new Error(`gaussSolve: missing element A[${i}][${j}]`);
      }
      copy[j] = v;
    }
    copy[n] = bi;
    M[i] = copy;
  }

  const EPS = 1e-12;

  // Forward elimination with partial pivoting.
  for (let k = 0; k < n; k++) {
    // Find pivot row: the row with the largest absolute value in column k.
    let pivotRow = k;
    let pivotAbs = Math.abs(M[k]![k]!);
    for (let i = k + 1; i < n; i++) {
      const v = Math.abs(M[i]![k]!);
      if (v > pivotAbs) {
        pivotAbs = v;
        pivotRow = i;
      }
    }

    if (pivotAbs < EPS) {
      throw new Error('gaussSolve: matrix is singular or nearly singular');
    }

    if (pivotRow !== k) {
      const tmp = M[k]!;
      M[k] = M[pivotRow]!;
      M[pivotRow] = tmp;
    }

    const pivot = M[k]![k]!;
    for (let i = k + 1; i < n; i++) {
      const factor = M[i]![k]! / pivot;
      if (factor === 0) continue;
      for (let j = k; j <= n; j++) {
        M[i]![j] = M[i]![j]! - factor * M[k]![j]!;
      }
    }
  }

  // Back substitution.
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i]![n]!;
    for (let j = i + 1; j < n; j++) {
      s -= M[i]![j]! * x[j]!;
    }
    const diag = M[i]![i]!;
    if (Math.abs(diag) < EPS) {
      throw new Error('gaussSolve: matrix is singular or nearly singular');
    }
    x[i] = s / diag;
  }
  return x;
}
