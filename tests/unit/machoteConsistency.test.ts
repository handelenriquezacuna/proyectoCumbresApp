import { describe, expect, it } from 'vitest';
import { dividedDifferences, evalNewton } from '@/lib/methods/newton';
import { evalLagrange } from '@/lib/methods/lagrange';
import { fitLeastSquares } from '@/lib/methods/leastSquares';
import { trunc5 } from '@/lib/format';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import {
  LAGRANGE_14_5,
  MMC_GRADO_3,
  MMC_GRADO_5,
  NEWTON_14_5,
} from '@/lib/machote/canonical';

/**
 * Amarra el motor interactivo (TRUNC 5 en cascada) a la fuente canónica
 * src/lib/machote/canonical.ts. Si estos tests fallan, la app mostraría
 * números distintos a la Hoja de cálculo, al Excel del equipo y al Word
 * del Capítulo IV — que deben coincidir dígito a dígito.
 */

const NODES_14_5 = CUMBRES_POINTS.filter((p) => p.x >= 12 && p.x <= 16);

describe('consistencia motor interactivo vs machote canónico', () => {
  it('Newton 14.5: coeficientes e imagen coinciden con la tabla canónica', () => {
    const coefs = dividedDifferences(NODES_14_5);
    expect(coefs).toEqual([1480, 20, -10, 2.5, -0.41666]);
    const xs = NODES_14_5.map((p) => p.x);
    expect(trunc5(evalNewton(coefs, xs, 14.5))).toBe(NEWTON_14_5.image);
  });

  it('Lagrange 14.5: imagen coincide con la tabla canónica', () => {
    expect(trunc5(evalLagrange(NODES_14_5, 14.5))).toBe(LAGRANGE_14_5.image);
  });

  it('MMC grado 3: coeficientes y métricas coinciden con el canónico', () => {
    const fit = fitLeastSquares([...CUMBRES_POINTS], 3);
    expect(fit.coefficients).toEqual([...MMC_GRADO_3.coefficients]);
    expect(trunc5(fit.metrics.mse)).toBe(MMC_GRADO_3.metrics.mse);
    expect(trunc5(fit.metrics.mae)).toBe(MMC_GRADO_3.metrics.mae);
    expect(trunc5(fit.metrics.r2)).toBe(MMC_GRADO_3.metrics.r2);
  });

  it('MMC grado 5: coeficientes y métricas coinciden con el canónico', () => {
    const fit = fitLeastSquares([...CUMBRES_POINTS], 5);
    expect(fit.coefficients).toEqual([...MMC_GRADO_5.coefficients]);
    expect(trunc5(fit.metrics.mse)).toBe(MMC_GRADO_5.metrics.mse);
    expect(trunc5(fit.metrics.mae)).toBe(MMC_GRADO_5.metrics.mae);
    expect(trunc5(fit.metrics.r2)).toBe(MMC_GRADO_5.metrics.r2);
  });
});
