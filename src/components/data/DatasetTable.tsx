import { useMemo, useState } from 'react';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { fmtTrunc5 } from '@/lib/format';
import {
  EXCEL_COL_HEADER_CLASS,
  EXCEL_FONT,
  EXCEL_ROW_HEADER_CLASS,
  colLetter,
  excelCellClass,
} from '@/components/excel/ExcelSheet';

type SortKey = 'x' | 'y';
type SortDir = 'asc' | 'desc';

/**
 * Tabla compacta y ordenable de la serie horaria del Cumbres Data Center,
 * presentada como hoja de Excel del machote: letras de columna, números de
 * fila, gridlines finas y datos duros en azul (convención contable). Conserva
 * el ordenamiento por columna; en pantallas pequeñas se desplaza vertical y
 * horizontalmente para no romper el layout.
 */
export function DatasetTable() {
  const [sortKey, setSortKey] = useState<SortKey>('x');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const rows = useMemo(() => {
    const copy = [...CUMBRES_POINTS];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [sortKey, sortDir]);

  const toggle = (key: SortKey): void => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const indicator = (key: SortKey): string =>
    sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <>
      <p className="mb-2 text-sm text-slate-600">
        Los números azules son las 24 mediciones horarias del caso (un martes laboral típico).
      </p>
      <div
        className="max-h-72 overflow-x-auto overflow-y-auto rounded-md border border-slate-300 bg-white"
        role="region"
        aria-label="Tabla de demanda eléctrica horaria"
      >
        <table className="w-full border-separate border-spacing-0 text-sm" style={EXCEL_FONT}>
          <thead>
            {/* Letras de columna estilo Excel */}
            <tr>
              <th
                scope="col"
                className={`sticky left-0 top-0 z-20 w-10 ${EXCEL_ROW_HEADER_CLASS}`}
                aria-label="Fila"
              />
              <th scope="col" className={`sticky top-0 z-10 ${EXCEL_COL_HEADER_CLASS}`}>
                {colLetter(0)}
              </th>
              <th scope="col" className={`sticky top-0 z-10 ${EXCEL_COL_HEADER_CLASS}`}>
                {colLetter(1)}
              </th>
            </tr>
            {/* Fila 1: títulos con ordenamiento */}
            <tr>
              <th scope="row" className={`sticky left-0 top-[25px] z-20 ${EXCEL_ROW_HEADER_CLASS}`}>
                1
              </th>
              <th
                scope="col"
                className={`sticky top-[25px] z-10 ${excelCellClass('header', 'text-left')}`}
              >
                <button
                  type="button"
                  onClick={() => toggle('x')}
                  className="w-full text-left focus:outline-none focus-visible:underline"
                  aria-label={`Ordenar por hora (${sortKey === 'x' ? sortDir : 'sin orden'})`}
                >
                  Hora{indicator('x')}
                </button>
              </th>
              <th
                scope="col"
                className={`sticky top-[25px] z-10 ${excelCellClass('header', 'text-right')}`}
              >
                <button
                  type="button"
                  onClick={() => toggle('y')}
                  className="w-full text-right focus:outline-none focus-visible:underline"
                  aria-label={`Ordenar por carga (${sortKey === 'y' ? sortDir : 'sin orden'})`}
                >
                  Carga (kW){indicator('y')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, r) => (
              <tr key={p.x}>
                <th scope="row" className={`sticky left-0 z-10 ${EXCEL_ROW_HEADER_CLASS}`}>
                  {r + 2}
                </th>
                <td className={excelCellClass('input', 'text-right tabular-nums')}>
                  {String(p.x).padStart(2, '0')}:00
                </td>
                <td className={excelCellClass('input', 'text-right tabular-nums')}>
                  {fmtTrunc5(p.y)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default DatasetTable;
