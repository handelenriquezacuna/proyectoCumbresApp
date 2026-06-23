import { describe, expect, it } from 'vitest';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { CUMBRES_24, LINEAR } from '../fixtures/knownPolynomials';

describe('Polynomial least squares', () => {
  it('recovers a line exactly for the linear fixture (degree 1)', () => {
    const fit = fitLeastSquares(LINEAR, 1);
    expect(fit.coefficients.length).toBe(2);
    expect(fit.coefficients[0]).toBeCloseTo(3, 8); // a_0 = intercept
    expect(fit.coefficients[1]).toBeCloseTo(2, 8); // a_1 = slope
    expect(fit.metrics.r2).toBeCloseTo(1, 8);
  });

  it('fits the Cumbres 24-hour profile with R^2 >= 0.97 at degree 5', () => {
    const fit = fitLeastSquares(CUMBRES_24, 5);
    expect(fit.coefficients.length).toBe(6);
    expect(fit.metrics.r2).toBeGreaterThanOrEqual(0.97);
    expect(fit.metrics.mape).toBeGreaterThanOrEqual(0);
  });

  it('rejects invalid degrees', () => {
    expect(() => fitLeastSquares(LINEAR, 0)).toThrow(/degree/i);
    expect(() => fitLeastSquares(LINEAR, 6)).toThrow(/degree/i);
    expect(() => fitLeastSquares(LINEAR, 1.5)).toThrow(/degree/i);
  });

  it('produces a LaTeX string with the right shape', () => {
    const fit = fitLeastSquares(LINEAR, 1);
    expect(fit.latex).toMatch(/x/);
  });
});
