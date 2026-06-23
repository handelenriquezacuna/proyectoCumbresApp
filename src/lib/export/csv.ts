/**
 * Utilidades de exportación CSV.
 *
 * Generan archivos compatibles con Excel/LibreOffice/Google Sheets:
 *  - Separador `,`
 *  - Salto de línea `\r\n` (recomendación RFC 4180)
 *  - Comillado de campos con `,`, `"` o saltos de línea
 *  - Comillas dobles escapadas duplicándolas (`"` → `""`)
 *  - Encabezado opcional (si se omite, se infiere de la primera fila)
 */

const NEWLINE = '\r\n';

function escapeField(value: string | number): string {
  const raw = typeof value === 'number' ? String(value) : value;
  // Campo "seguro": sin coma, sin comilla y sin salto de línea.
  if (!/[",\r\n]/.test(raw)) return raw;
  return `"${raw.replace(/"/g, '""')}"`;
}

/**
 * Convierte un arreglo de filas (objetos planos) a una cadena CSV.
 *
 * - Si `headers` es indefinido, se usan las claves del primer registro en su
 *   orden de inserción. Si no hay filas se devuelve una cadena vacía.
 * - Las celdas ausentes se serializan como `""` (campo vacío) para conservar
 *   el ancho del CSV.
 */
export function toCSV(
  rows: Array<Record<string, string | number>>,
  headers?: string[],
): string {
  const first = rows[0];
  const cols = headers ?? (first ? Object.keys(first) : []);
  if (cols.length === 0) return '';

  const lines: string[] = [];
  lines.push(cols.map(escapeField).join(','));

  for (const row of rows) {
    const cells = cols.map((c) => {
      const v = row[c];
      if (v === undefined || v === null) return '';
      return escapeField(v);
    });
    lines.push(cells.join(','));
  }

  return lines.join(NEWLINE);
}

/**
 * Lanza la descarga de un CSV en el navegador. Crea un Blob con BOM UTF-8
 * (para que Excel detecte la codificación) y simula un click sobre un
 * `<a download>` temporal.
 *
 * En entornos sin DOM (Node puro, jsdom sin window) la función simplemente
 * no hace nada — facilita testear el llamador sin mockear `URL.createObjectURL`.
 */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return;
  if (typeof URL.createObjectURL !== 'function') return;

  // BOM UTF-8 (﻿) → Excel español interpreta acentos correctamente.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Liberamos el ObjectURL tras un tick para no abortar la descarga en
  // navegadores que la procesan de forma asíncrona.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
