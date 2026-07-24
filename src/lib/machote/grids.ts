/**
 * grids.ts — Arma las grillas estilo Excel del machote a partir de los
 * valores canónicos precalculados (canonical.ts). Aquí NO se recalcula
 * ningún número: solo se posicionan los valores en la misma disposición
 * del machote del profesor y se generan las cadenas de fórmula
 * ("=TRUNC(...)") que se muestran en la barra fx al hacer clic.
 */
import { colLetter, type ExcelCellData, type ExcelRow } from '@/components/excel/ExcelSheet';
import { fmtTrunc5 } from '@/lib/format';
import type {
  ErrorRow,
  LagrangeCase,
  LeastSquaresFit,
  NewtonCase,
  NewtonVsLagrange,
} from './canonical';

type Cell = ExcelCellData | null;

/** Acceso seguro bajo noUncheckedIndexedAccess: los datos canónicos son completos. */
function req<T>(v: T | undefined): T {
  if (v === undefined) {
    throw new Error('Dato canónico faltante: la grilla no coincide con canonical.ts');
  }
  return v;
}

/* ------------------------------------------------------------------ */
/* Newton — hoja "Diferencia divididas"                                */
/* ------------------------------------------------------------------ */

/**
 * Tabla diagonal del machote: columnas xi | yi=a0 | a1 | ... | a4,
 * fila "Img por ai" y cierre "Imagen de [x] es [SUM]".
 * Cada celda de orden k en la fila r replica
 * =TRUNC((prev_r - prev_{r+1})/(A_r - A_{r+k}),5), p.ej. C3==TRUNC((B3-B4)/(A3-A4),5).
 */
export function buildNewtonGrid(c: NewtonCase): ExcelRow[] {
  const n = c.xi.length;
  const cols = n + 1;
  const xe = fmtTrunc5(c.xEval);
  const grid: Cell[][] = [];

  // Fila 1: encabezados
  const header: Cell[] = [
    { value: 'xi', kind: 'header' },
    { value: 'yi = a0', kind: 'header' },
  ];
  for (let k = 1; k < n; k += 1) header.push({ value: `a${k}`, kind: 'header' });
  grid.push(header);

  // Filas 2..n+1: nodos + tabla diagonal de diferencias divididas
  for (let i = 0; i < n; i += 1) {
    const r = i + 2;
    const row: Cell[] = [
      { value: req(c.xi[i]), kind: 'input' },
      { value: req(c.yi[i]), kind: 'input' },
    ];
    for (let k = 1; k < n; k += 1) {
      const order = req(c.dividedDifferences[k - 1]);
      const v = order[i];
      if (v === undefined) {
        row.push(null);
      } else {
        const prev = colLetter(k); // columna anterior (B para a1, C para a2, ...)
        row.push({
          value: v,
          kind: 'computed',
          formula: `=TRUNC((${prev}${r}-${prev}${r + 1})/(A${r}-A${r + k}),5)`,
        });
      }
    }
    grid.push(row);
  }

  // Fila "Img por ai": a0=y0; término k = TRUNC(a_k * (x-x0)...(x-x_{k-1}), 5)
  const rTerms = n + 2;
  const termsRow: Cell[] = [{ value: 'Img por ai', kind: 'label' }];
  for (let k = 0; k < n; k += 1) {
    const t = req(c.terms[k]);
    if (k === 0) {
      termsRow.push({ value: t, kind: 'computed', formula: '=B2' });
    } else {
      const prod = Array.from({ length: k }, (_, j) => `(${xe}-A${j + 2})`).join('*');
      termsRow.push({
        value: t,
        kind: 'computed',
        formula: `=TRUNC(${colLetter(k + 1)}2*${prod},5)`,
      });
    }
  }
  grid.push(termsRow);

  // Cierre: "Imagen de [x] es [SUM]" (la SUM no se trunca)
  const closing: Cell[] = [
    { value: `Imagen de ${xe} es`, kind: 'label' },
    {
      value: c.image,
      kind: 'result',
      formula: `=SUM(B${rTerms}:${colLetter(cols - 1)}${rTerms})`,
    },
  ];
  while (closing.length < cols) closing.push(null);
  grid.push(closing);

  return grid;
}

/* ------------------------------------------------------------------ */
/* Lagrange — hoja "Lagrange"                                          */
/* ------------------------------------------------------------------ */

/**
 * Filas horizontales xi / yi, bloque "Denominadores"
 * L_k = TRUNC(prod_{j!=k}(x_k - x_j),5), bloque "Imágenes numerador"
 * N_k = TRUNC(prod_{j!=k}(x_eval - x_j),5), bloque "Lagrange"
 * T_k = TRUNC(y_k*N_k/L_k,5) y cierre "Imagen de [x] es [SUM]".
 */
export function buildLagrangeGrid(c: LagrangeCase): ExcelRow[] {
  const n = c.xi.length;
  const cols = n + 1;
  const xe = fmtTrunc5(c.xEval);
  const node = (k: number): string => colLetter(k + 1); // B..F

  const others = (k: number): number[] =>
    Array.from({ length: n }, (_, j) => j).filter((j) => j !== k);

  const xiRow: Cell[] = [
    { value: 'xi', kind: 'header' },
    ...c.xi.map((v): ExcelCellData => ({ value: v, kind: 'input' })),
  ];
  const yiRow: Cell[] = [
    { value: 'yi', kind: 'header' },
    ...c.yi.map((v): ExcelCellData => ({ value: v, kind: 'input' })),
  ];

  const denRow: Cell[] = [{ value: 'Denominadores', kind: 'label' }];
  for (let k = 0; k < n; k += 1) {
    const prod = others(k)
      .map((j) => `(${node(k)}1-${node(j)}1)`)
      .join('*');
    denRow.push({
      value: req(c.denominators[k]),
      kind: 'computed',
      formula: `=TRUNC(${prod},5)`,
    });
  }

  const numRow: Cell[] = [{ value: 'Imágenes numerador', kind: 'label' }];
  for (let k = 0; k < n; k += 1) {
    const prod = others(k)
      .map((j) => `(${xe}-${node(j)}1)`)
      .join('*');
    numRow.push({
      value: req(c.numerators[k]),
      kind: 'computed',
      formula: `=TRUNC(${prod},5)`,
    });
  }

  const lagRow: Cell[] = [{ value: 'Lagrange', kind: 'label' }];
  for (let k = 0; k < n; k += 1) {
    lagRow.push({
      value: req(c.terms[k]),
      kind: 'computed',
      formula: `=TRUNC(${node(k)}2*${node(k)}4/${node(k)}3,5)`,
    });
  }

  const closing: Cell[] = [
    { value: `Imagen de ${xe} es`, kind: 'label' },
    { value: c.image, kind: 'result', formula: `=SUM(B5:${node(n - 1)}5)` },
  ];
  while (closing.length < cols) closing.push(null);

  return [xiRow, yiRow, denRow, numRow, lagRow, closing];
}

/* ------------------------------------------------------------------ */
/* Mínimos cuadrados — hoja "R. Cuadrática" generalizada               */
/* ------------------------------------------------------------------ */

interface ColSpec {
  header: string;
  pow: number;
  withY: boolean;
  input: boolean;
  /** letra de columna en la grilla (la columna A es la de etiquetas) */
  letter: string;
}

function parseCols(columns: readonly string[]): ColSpec[] {
  return columns.map((name, j) => {
    const letter = colLetter(j + 1);
    if (name === 'Xi') return { header: name, pow: 1, withY: false, input: true, letter };
    if (name === 'Yi') return { header: name, pow: 0, withY: true, input: true, letter };
    const m = /^Xi(?:\^(\d+))?(Yi)?$/.exec(name);
    if (!m) throw new Error(`Columna desconocida del machote: ${name}`);
    return {
      header: name,
      pow: m[1] !== undefined ? Number(m[1]) : 1,
      withY: m[2] !== undefined,
      input: false,
      letter,
    };
  });
}

/** Fila de "Sumatoria" del machote: es la fila 26 (1 encabezado + 24 datos + 1 suma). */
export const MMC_SUMS_ROW = 26;
/** El sistema normal se dibuja como grilla aparte que arranca en la fila 28. */
export const MMC_SYSTEM_START_ROW = 28;

/**
 * Tabla de sumatorias del machote: encabezados Xi | Yi | XiYi | Xi^2 | ...,
 * 24 filas con TRUNC 5 por celda y fila "Sumatoria" con SUM por columna.
 */
export function buildMmcSumsGrid(fit: LeastSquaresFit): ExcelRow[] {
  const specs = parseCols(fit.columns);
  const xL = req(specs.find((s) => s.input && !s.withY)).letter;
  const yL = req(specs.find((s) => s.input && s.withY)).letter;

  const header: Cell[] = [
    { value: '', kind: 'header' },
    ...specs.map((s): ExcelCellData => ({ value: s.header, kind: 'header' })),
  ];

  const dataRows: Cell[][] = fit.rows.map((row, i) => {
    const r = i + 2;
    const cells: Cell[] = [null];
    specs.forEach((s, j) => {
      const v = req(row[j]);
      if (s.input) {
        cells.push({ value: v, kind: 'input' });
      } else {
        const xPart = s.pow === 1 ? `${xL}${r}` : `${xL}${r}^${s.pow}`;
        const expr = s.withY ? `${xPart}*${yL}${r}` : xPart;
        cells.push({ value: v, kind: 'computed', formula: `=TRUNC(${expr},5)` });
      }
    });
    return cells;
  });

  const sumsRow: Cell[] = [
    { value: 'Sumatoria', kind: 'label' },
    ...specs.map(
      (s, j): ExcelCellData => ({
        value: req(fit.sums[j]),
        kind: 'result',
        formula: `=SUM(${s.letter}2:${s.letter}${MMC_SUMS_ROW - 1})`,
      }),
    ),
  ];

  return [header, ...dataRows, sumsRow];
}

const EQ_LABELS = ['1er ec', '2da ec', '3er ec', '4ta ec', '5ta ec', '6ta ec'] as const;
const COEF_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

/**
 * Sistema de ecuaciones normales tal como lo presenta el machote:
 * filas "1er ec", "2da ec", ... con columnas a, b, c, ... y "constante".
 * Cada coeficiente referencia la fila "Sumatoria" (fila 26) de la tabla
 * de arriba; n usa =COUNT. Al final, la fila de coeficientes resueltos
 * (con precisión completa, presentados TRUNC 5).
 */
export function buildMmcSystemGrid(fit: LeastSquaresFit): ExcelRow[] {
  const specs = parseCols(fit.columns);
  const m = fit.degree + 1;

  // letra de columna de cada potencia en la tabla de sumatorias
  const powL = new Map<number, string>();
  const yPowL = new Map<number, string>();
  specs.forEach((s) => {
    if (s.withY) yPowL.set(s.pow, s.letter);
    else powL.set(s.pow, s.letter);
  });
  const xL = req(powL.get(1));

  const header: Cell[] = [{ value: '', kind: 'header' }];
  for (let c = 0; c < m; c += 1) header.push({ value: req(COEF_LETTERS[c]), kind: 'header' });
  header.push({ value: 'constante', kind: 'header' });

  const eqRows: Cell[][] = fit.normalMatrix.map((matrixRow, k) => {
    const cells: Cell[] = [{ value: req(EQ_LABELS[k]), kind: 'label' }];
    matrixRow.forEach((v, c) => {
      const p = k + c;
      cells.push({
        value: v,
        kind: 'computed',
        formula:
          p === 0
            ? `=COUNT(${xL}2:${xL}${MMC_SUMS_ROW - 1})`
            : `=${req(powL.get(p))}${MMC_SUMS_ROW}`,
      });
    });
    cells.push({
      value: req(fit.normalVector[k]),
      kind: 'computed',
      formula: `=${req(yPowL.get(k))}${MMC_SUMS_ROW}`,
    });
    return cells;
  });

  const blank: Cell[] = Array.from({ length: m + 2 }, () => null);

  const coefRow: Cell[] = [{ value: 'Coeficientes', kind: 'label' }];
  fit.coefficients.forEach((v) => {
    coefRow.push({ value: v, kind: 'result' });
  });
  coefRow.push(null);

  return [header, ...eqRows, blank, coefRow];
}

/* ------------------------------------------------------------------ */
/* Errores — hoja "Errores"                                            */
/* ------------------------------------------------------------------ */

/**
 * Bloque del machote: V.Exacto / V.Aprox → Absoluto = TRUNC(ABS(e-a),5),
 * Relativo = TRUNC(ABS(e-a)/e,5), Porcentual = TRUNC(ABS((e-a)/e)*100,5).
 */
export function buildErroresGrid(rows: readonly ErrorRow[]): ExcelRow[] {
  const header: Cell[] = [
    { value: 'Hora', kind: 'header' },
    { value: 'V.Exacto', kind: 'header' },
    { value: 'V.Aprox', kind: 'header' },
    { value: 'Absoluto', kind: 'header' },
    { value: 'Relativo', kind: 'header' },
    { value: 'Porcentual', kind: 'header' },
  ];
  const dataRows: Cell[][] = rows.map((row, i) => {
    const r = i + 2;
    return [
      { value: row.hour, kind: 'input' },
      { value: row.exact, kind: 'input' },
      { value: row.approx, kind: 'computed' },
      { value: row.absolute, kind: 'computed', formula: `=TRUNC(ABS(B${r}-C${r}),5)` },
      { value: row.relative, kind: 'computed', formula: `=TRUNC(ABS(B${r}-C${r})/B${r},5)` },
      {
        value: row.percent,
        kind: 'result',
        formula: `=TRUNC(ABS((B${r}-C${r})/B${r})*100,5)`,
      },
    ];
  });
  return [header, ...dataRows];
}

/**
 * Comparación Newton vs Lagrange en el mismo x (unicidad del polinomio
 * interpolante): la diferencia es solo arrastre de TRUNC 5.
 */
export function buildNewtonVsLagrangeGrid(c: NewtonVsLagrange): ExcelRow[] {
  const xe = fmtTrunc5(c.xEval);
  return [
    [
      { value: 'Método', kind: 'header' },
      { value: `Imagen en x = ${xe}`, kind: 'header' },
    ],
    [
      { value: 'Newton', kind: 'label' },
      { value: c.newton, kind: 'computed' },
    ],
    [
      { value: 'Lagrange', kind: 'label' },
      { value: c.lagrange, kind: 'computed' },
    ],
    [
      { value: 'Diferencia absoluta', kind: 'label' },
      { value: c.absoluteDifference, kind: 'result', formula: '=TRUNC(ABS(B2-B3),5)' },
    ],
  ];
}
