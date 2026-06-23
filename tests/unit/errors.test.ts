import { describe, expect, it } from 'vitest';
import { mae, mape, mse, rSquared } from '@/lib/methods/errors';

describe('Error metrics', () => {
  it('returns 0 on identical vectors (mse, mae, mape)', () => {
    const actual = [1, 2, 3, 4, 5];
    const predicted = [1, 2, 3, 4, 5];
    expect(mse(actual, predicted)).toBe(0);
    expect(mae(actual, predicted)).toBe(0);
    expect(mape(actual, predicted)).toBe(0);
    expect(rSquared(actual, predicted)).toBeCloseTo(1, 12);
  });

  it('mape guard: returns 0 when all actuals are zero', () => {
    const actual = [0, 0, 0];
    const predicted = [1, 2, 3];
    expect(mape(actual, predicted)).toBe(0);
  });

  it('mape skips zero-valued actuals but still averages the rest', () => {
    // actual = [0, 100], predicted = [10, 110] → only second term counts:
    //  |100 - 110| / 100 = 0.1 → 10%.
    expect(mape([0, 100], [10, 110])).toBeCloseTo(10, 10);
  });

  it('R^2 < 0 when predictions are worse than the mean', () => {
    const actual = [1, 2, 3, 4, 5];
    // Constant prediction far from the data → SS_res >> SS_tot.
    const predicted = [10, 10, 10, 10, 10];
    expect(rSquared(actual, predicted)).toBeLessThan(0);
  });

  it('throws on length mismatch', () => {
    expect(() => mse([1, 2], [1])).toThrow(/length/i);
    expect(() => mae([1, 2], [1])).toThrow(/length/i);
    expect(() => mape([1, 2], [1])).toThrow(/length/i);
    expect(() => rSquared([1, 2], [1])).toThrow(/length/i);
  });
});
