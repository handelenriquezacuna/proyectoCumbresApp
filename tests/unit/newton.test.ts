import { describe, expect, it } from 'vitest';
import {
  dividedDifferences,
  evalNewton,
  fitNewton,
} from '@/lib/methods/newton';
import { QUADRATIC } from '../fixtures/knownPolynomials';

const TOL = 1e-10;

describe('Newton interpolation', () => {
  it('computes exact divided differences for y = x^2 + 1', () => {
    // For x = 0,1,2 and y = 1,2,5:
    //  a_0 = 1, a_1 = 1, a_2 = 1.
    const coefs = dividedDifferences(QUADRATIC);
    expect(coefs.length).toBe(3);
    expect(coefs[0]).toBeCloseTo(1, 12);
    expect(coefs[1]).toBeCloseTo(1, 12);
    expect(coefs[2]).toBeCloseTo(1, 12);
  });

  it('evaluates exactly at the nodes', () => {
    const coefs = dividedDifferences(QUADRATIC);
    const xs = QUADRATIC.map((p) => p.x);
    for (const p of QUADRATIC) {
      expect(evalNewton(coefs, xs, p.x)).toBeCloseTo(p.y, 12);
    }
  });

  it('matches the true polynomial at the midpoint x = 0.5', () => {
    const coefs = dividedDifferences(QUADRATIC);
    const xs = QUADRATIC.map((p) => p.x);
    const v = evalNewton(coefs, xs, 0.5);
    expect(Math.abs(v - 1.25)).toBeLessThan(TOL);
  });

  it('fitNewton exposes evaluate, latex and metrics with R^2 = 1', () => {
    const fit = fitNewton(QUADRATIC);
    expect(fit.method).toBe('newton');
    expect(fit.coefficients.length).toBe(3);
    expect(fit.evaluate(0.5)).toBeCloseTo(1.25, 10);
    expect(fit.metrics.r2).toBeCloseTo(1, 10);
    expect(fit.metrics.mse).toBeCloseTo(0, 10);
    expect(typeof fit.latex).toBe('string');
    expect(fit.latex.length).toBeGreaterThan(0);
  });
});
