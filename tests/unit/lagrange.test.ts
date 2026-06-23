import { describe, expect, it } from 'vitest';
import { evalLagrange, fitLagrange } from '@/lib/methods/lagrange';
import {
  dividedDifferences,
  evalNewton,
} from '@/lib/methods/newton';
import { QUADRATIC } from '../fixtures/knownPolynomials';

const TOL = 1e-8;

describe('Lagrange interpolation', () => {
  it('matches Newton at 50 random x in [0, 2]', () => {
    const coefs = dividedDifferences(QUADRATIC);
    const xs = QUADRATIC.map((p) => p.x);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 2;
      const a = evalLagrange(QUADRATIC, x);
      const b = evalNewton(coefs, xs, x);
      expect(Math.abs(a - b)).toBeLessThanOrEqual(TOL);
    }
  });

  it('reproduces y exactly at the nodes', () => {
    for (const p of QUADRATIC) {
      expect(evalLagrange(QUADRATIC, p.x)).toBeCloseTo(p.y, 12);
    }
  });

  it('fitLagrange returns a FitResult with R^2 = 1 on the quadratic fixture', () => {
    const fit = fitLagrange(QUADRATIC);
    expect(fit.method).toBe('lagrange');
    expect(fit.metrics.r2).toBeCloseTo(1, 10);
    expect(fit.evaluate(0.5)).toBeCloseTo(1.25, 10);
    expect(fit.latex.length).toBeGreaterThan(0);
  });
});
