import { describe, expect, it } from 'vitest';
import { toCSV } from '@/lib/export/csv';

describe('toCSV', () => {
  it('serializes a flat dataset with inferred headers', () => {
    const rows = [
      { hora: 0, kW: 1260 },
      { hora: 1, kW: 1250 },
    ];
    const csv = toCSV(rows);
    const expected = ['hora,kW', '0,1260', '1,1250'].join('\r\n');
    expect(csv).toBe(expected);
  });

  it('honors an explicit column order', () => {
    const rows = [{ a: 1, b: 2, c: 3 }];
    const csv = toCSV(rows, ['c', 'a']);
    expect(csv).toBe(['c,a', '3,1'].join('\r\n'));
  });

  it('escapes fields containing commas, quotes and line breaks', () => {
    const rows = [
      {
        nota: 'incluye, coma',
        cita: 'Avelar dice "PUE"',
        salto: 'línea\nrota',
      },
    ];
    const csv = toCSV(rows);
    const [, dataRow] = csv.split('\r\n');
    expect(dataRow).toContain('"incluye, coma"');
    expect(dataRow).toContain('"Avelar dice ""PUE"""');
    expect(dataRow).toContain('"línea\nrota"');
  });

  it('returns an empty string for empty input without headers', () => {
    expect(toCSV([])).toBe('');
  });

  it('emits an empty cell when a row is missing a declared column', () => {
    const csv = toCSV([{ a: 1 }], ['a', 'b']);
    expect(csv).toBe(['a,b', '1,'].join('\r\n'));
  });
});
