import { describe, expect, it } from 'vitest';
import { gaussSolve } from '@/lib/methods/linalg';

const TOL = 1e-10;

describe('gaussSolve', () => {
  it('solves a known 3x3 system with partial pivoting', () => {
    // System:
    //   2x +  y -  z =  8
    //  -3x -  y + 2z = -11
    //  -2x +  y + 2z = -3
    // Exact solution: x = 2, y = 3, z = -1.
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2],
    ];
    const b = [8, -11, -3];
    const x = gaussSolve(A, b);
    expect(x[0]).toBeCloseTo(2, 10);
    expect(x[1]).toBeCloseTo(3, 10);
    expect(x[2]).toBeCloseTo(-1, 10);
  });

  it('uses partial pivoting when the leading element is zero', () => {
    // Without pivoting this would fail (a_11 = 0).
    const A = [
      [0, 2, 1],
      [1, -2, -3],
      [-1, 1, 2],
    ];
    const b = [-8, 0, 3];
    const x = gaussSolve(A, b);
    // verify by substitution
    for (let i = 0; i < 3; i++) {
      let sum = 0;
      for (let j = 0; j < 3; j++) sum += A[i]![j]! * x[j]!;
      expect(Math.abs(sum - b[i]!)).toBeLessThan(TOL);
    }
  });

  it('throws on a singular matrix', () => {
    const A = [
      [1, 2, 3],
      [2, 4, 6],
      [3, 6, 9],
    ];
    const b = [1, 2, 3];
    expect(() => gaussSolve(A, b)).toThrow(/singular/i);
  });

  it('throws on dimension mismatch', () => {
    expect(() =>
      gaussSolve(
        [
          [1, 0],
          [0, 1],
        ],
        [1, 2, 3],
      ),
    ).toThrow(/dimension/i);
  });
});
