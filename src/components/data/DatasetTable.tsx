import { useMemo, useState } from 'react';
import { CUMBRES_POINTS } from '@/lib/data/cumbresDataset';
import { formatNumber } from '@/lib/format';

type SortKey = 'x' | 'y';
type SortDir = 'asc' | 'desc';

/**
 * Tabla compacta y ordenable de la serie horaria del Cumbres Data Center.
 * Diseñada para vivir dentro de un Card; en pantallas pequeñas se desplaza
 * verticalmente para no romper el layout.
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
    <div
      className="max-h-72 overflow-y-auto rounded-md border border-slate-200"
      role="region"
      aria-label="Tabla de demanda eléctrica horaria"
    >
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-slate-100 text-slate-700">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">
              <button
                type="button"
                onClick={() => toggle('x')}
                className="w-full text-left focus:outline-none focus-visible:underline"
                aria-label={`Ordenar por hora (${
                  sortKey === 'x' ? sortDir : 'sin orden'
                })`}
              >
                Hora{indicator('x')}
              </button>
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              <button
                type="button"
                onClick={() => toggle('y')}
                className="w-full text-right focus:outline-none focus-visible:underline"
                aria-label={`Ordenar por carga (${
                  sortKey === 'y' ? sortDir : 'sin orden'
                })`}
              >
                Carga (kW){indicator('y')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.x}
              className="border-t border-slate-100 odd:bg-white even:bg-slate-50"
            >
              <td className="px-3 py-1.5 font-mono text-slate-800">
                {String(p.x).padStart(2, '0')}:00
              </td>
              <td className="px-3 py-1.5 text-right font-mono text-slate-800">
                {formatNumber(p.y, 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DatasetTable;
