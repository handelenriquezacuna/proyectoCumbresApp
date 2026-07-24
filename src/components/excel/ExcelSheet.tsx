import { useMemo, useState, type KeyboardEvent } from 'react';
import { fmtTrunc5 } from '@/lib/format';
import { TableScrollHint } from '@/components/ui/TableScrollHint';

/**
 * Tipos de celda calcados del machote de Excel del curso:
 * - 'header': encabezado gris (fila de títulos de columna del machote).
 * - 'input': dato duro en azul (convención contable de Excel).
 * - 'computed': celda calculada, texto negro.
 * - 'result': resultado destacado con fondo amarillo suave.
 * - 'label': etiqueta de fila ("Sumatoria", "Img por ai", ...).
 */
export type ExcelCellKind = 'header' | 'input' | 'computed' | 'result' | 'label';

export interface ExcelCellData {
  /** Contenido de la celda; los números se formatean con fmtTrunc5. */
  value: string | number;
  /** Fórmula estilo Excel (p.ej. "=TRUNC((B3-B4)/(A3-A4),5)") para la barra fx. */
  formula?: string;
  /** Tipo visual de la celda (default: 'computed'). */
  kind?: ExcelCellKind;
}

/** Una fila de la grilla; null representa una celda vacía. */
export type ExcelRow = ReadonlyArray<ExcelCellData | null>;

export interface ExcelSheetProps {
  rows: ReadonlyArray<ExcelRow>;
  /** Nombre visible tipo pestaña de hoja de Excel (opcional). */
  sheetName?: string;
  /**
   * Número de la primera fila (estilo Excel). Permite partir una misma
   * "hoja" lógica en varias grillas manteniendo referencias coherentes
   * (p.ej. el sistema normal del MMC arranca en la fila 28 y referencia
   * la fila 26 de la tabla de sumatorias).
   */
  startRow?: number;
  /** Clase de alto máximo para scroll vertical (p.ej. 'max-h-[26rem]'). */
  maxHeightClassName?: string;
  /** Muestra la leyenda del código de colores debajo de la grilla. */
  showLegend?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** Convierte un índice de columna 0-based en letra estilo Excel (A, B, ..., Z, AA...). */
export function colLetter(index: number): string {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

/** Fuente Calibri del machote; exportada para tablas que replican el look Excel. */
export const EXCEL_FONT = { fontFamily: 'Calibri, ui-sans-serif, system-ui, sans-serif' } as const;

const KIND_CLASSES: Record<ExcelCellKind, string> = {
  header: 'bg-slate-100 font-semibold text-slate-700',
  input: 'bg-white text-blue-700',
  computed: 'bg-white text-slate-900',
  result: 'bg-yellow-100 font-semibold text-slate-900',
  label: 'bg-white font-medium text-slate-700',
};

/** Gridlines + padding base de toda celda de datos del machote. */
const GRID_CELL = 'border-b border-r border-slate-300 px-2 py-1 whitespace-nowrap';

/**
 * Clases de una celda de datos estilo Excel (gridlines finas + colores por
 * tipo). Permite que otras tablas del sitio compartan el look del machote
 * sin renderizar una ExcelSheet completa (p.ej. cuando la celda necesita
 * JSX o botones de ordenamiento).
 */
export function excelCellClass(kind: ExcelCellKind = 'computed', extra = ''): string {
  return [GRID_CELL, KIND_CLASSES[kind], extra].filter(Boolean).join(' ');
}

/** Celda gris de encabezado de columna (letras A, B, C, ...). */
export const EXCEL_COL_HEADER_CLASS =
  'border-b border-r border-slate-300 bg-slate-200 px-2 py-1 text-center text-xs font-semibold text-slate-600';

/** Celda gris de número de fila (1, 2, 3, ...). */
export const EXCEL_ROW_HEADER_CLASS =
  'border-b border-r border-slate-300 bg-slate-200 px-2 py-1 text-center text-xs font-normal text-slate-600';

/** Ítems de la leyenda de colores; los swatches replican KIND_CLASSES. */
const LEGEND_ITEMS: ReadonlyArray<{ swatch: string; label: string }> = [
  { swatch: 'border border-blue-700 bg-blue-700', label: 'azul = dato de entrada' },
  { swatch: 'border border-slate-900 bg-slate-900', label: 'negro = celda calculada' },
  { swatch: 'border border-yellow-300 bg-yellow-100', label: 'amarillo = resultado' },
  { swatch: 'border border-slate-300 bg-slate-200', label: 'gris = encabezado' },
];

/**
 * Leyenda compacta del código de colores del machote. Reutilizable fuera de
 * ExcelSheet (p.ej. junto a tablas que usan excelCellClass) o vía la prop
 * showLegend de ExcelSheet.
 */
export function ExcelLegend({ className }: { className?: string }) {
  return (
    <ul
      className={[
        'flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Código de colores de las celdas"
    >
      {LEGEND_ITEMS.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-sm ${item.swatch}`} aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

interface SelectedCell {
  r: number;
  c: number;
}

function displayValue(cell: ExcelCellData): string {
  return typeof cell.value === 'number' ? fmtTrunc5(cell.value) : cell.value;
}

/**
 * Grilla estilo Excel que replica la apariencia del machote del profesor:
 * letras de columna, números de fila, gridlines finas y una barra de
 * fórmulas (fx). Al hacer clic en una celda con fórmula, la fórmula se
 * muestra arriba y la celda queda resaltada con el borde verde de Excel —
 * clave para explicar de dónde sale cada número en la presentación.
 */
export function ExcelSheet({
  rows,
  sheetName,
  startRow = 1,
  maxHeightClassName,
  showLegend = false,
  className,
  ariaLabel,
}: ExcelSheetProps) {
  const [selected, setSelected] = useState<SelectedCell | null>(null);

  const colCount = useMemo(() => rows.reduce((max, row) => Math.max(max, row.length), 0), [rows]);

  const selectedCell: ExcelCellData | null =
    selected === null ? null : (rows[selected.r]?.[selected.c] ?? null);

  const selectedRef = selected === null ? '' : `${colLetter(selected.c)}${startRow + selected.r}`;

  const barContent =
    selectedCell === null
      ? 'Haz clic en una celda para ver su fórmula'
      : (selectedCell.formula ?? displayValue(selectedCell));

  const handleKeyDown = (e: KeyboardEvent<HTMLTableCellElement>, r: number, c: number): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected({ r, c });
    }
  };

  const scrollClasses = [
    'overflow-x-auto rounded-b-md border border-t-0 border-slate-300 bg-white',
    maxHeightClassName ? `${maxHeightClassName} overflow-y-auto` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['w-full', className ?? ''].filter(Boolean).join(' ')}>
      <TableScrollHint />
      {/* Barra de fórmulas, como en Excel: caja de nombre | fx | fórmula */}
      <div
        className="flex items-stretch rounded-t-md border border-slate-300 bg-white text-sm"
        style={EXCEL_FONT}
      >
        <div className="flex min-w-[3.5rem] items-center justify-center border-r border-slate-300 px-2 py-1.5 font-semibold text-slate-600">
          {selectedRef || '—'}
        </div>
        <div className="flex items-center border-r border-slate-300 px-2 py-1.5 italic text-cumbres-hoja">
          fx
        </div>
        <div
          className={
            'flex-1 overflow-x-auto whitespace-nowrap px-2 py-1.5 ' +
            (selectedCell === null ? 'italic text-slate-400' : 'text-slate-800')
          }
          aria-live="polite"
        >
          {barContent}
        </div>
      </div>

      <div className={scrollClasses}>
        <table
          className="w-max min-w-full border-separate border-spacing-0 text-sm"
          style={EXCEL_FONT}
          aria-label={ariaLabel}
        >
          <thead>
            <tr>
              <th
                scope="col"
                className={`sticky left-0 top-0 z-20 w-10 ${EXCEL_ROW_HEADER_CLASS}`}
                aria-label="Fila"
              />
              {Array.from({ length: colCount }, (_, c) => (
                <th
                  key={c}
                  scope="col"
                  className={`sticky top-0 z-10 min-w-[3.5rem] ${EXCEL_COL_HEADER_CLASS}`}
                >
                  {colLetter(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={r}>
                <th scope="row" className={`sticky left-0 z-10 ${EXCEL_ROW_HEADER_CLASS}`}>
                  {startRow + r}
                </th>
                {Array.from({ length: colCount }, (_, c) => {
                  const cell = row[c] ?? null;
                  if (cell === null) {
                    return <td key={c} className={excelCellClass()} />;
                  }
                  const isSelected = selected !== null && selected.r === r && selected.c === c;
                  const kind = cell.kind ?? 'computed';
                  const align =
                    kind === 'header'
                      ? 'text-center'
                      : typeof cell.value === 'number'
                        ? 'text-right tabular-nums'
                        : 'text-left';
                  const classes = [
                    excelCellClass(kind, 'cursor-pointer'),
                    align,
                    isSelected ? 'ring-2 ring-inset ring-cumbres-hoja' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <td
                      key={c}
                      tabIndex={0}
                      className={classes}
                      onClick={() => setSelected({ r, c })}
                      onKeyDown={(e) => handleKeyDown(e, r, c)}
                      title={cell.formula}
                    >
                      {displayValue(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sheetName ? (
        <div className="mt-0 inline-flex items-center rounded-b-md border border-t-0 border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-cumbres-hoja" aria-hidden />
          {sheetName}
        </div>
      ) : null}

      {showLegend ? <ExcelLegend className="mt-2" /> : null}
    </div>
  );
}

export default ExcelSheet;
