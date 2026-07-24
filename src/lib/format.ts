/**
 * Formatea un número con dígitos fijos. Devuelve 'NaN' o '±∞' como cadena
 * legible para evitar romper la UI cuando un método numérico diverge.
 */
export function formatNumber(n: number, digits = 2): string {
  if (!Number.isFinite(n)) {
    if (Number.isNaN(n)) return 'NaN';
    return n > 0 ? '+∞' : '−∞';
  }
  return n.toLocaleString('es-CR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: false,
  });
}

/**
 * Convierte un vector canónico de coeficientes [a0, a1, ..., an] en la
 * representación LaTeX  "a0 + a1 x + a2 x^{2} + ... + an x^{n}".
 *
 * - Coeficientes (≈) 0 se omiten para no contaminar la lectura.
 * - El primer término no nulo conserva su signo (negativo si corresponde).
 * - Los términos subsecuentes usan separador '+' / '-' con coeficiente
 *   absoluto.
 * - Si todos los coeficientes son nulos devuelve "0".
 */
export function formatPolynomialLatex(coefs: number[]): string {
  const EPS = 1e-12;
  const parts: string[] = [];

  for (let i = 0; i < coefs.length; i += 1) {
    const c = coefs[i];
    if (c === undefined) continue;
    if (Math.abs(c) < EPS) continue;

    const abs = Math.abs(c);
    const absStr = formatNumber(abs, 4);
    let term: string;

    if (i === 0) {
      term = absStr;
    } else if (i === 1) {
      term = absStr === '1' ? 'x' : `${absStr} x`;
    } else {
      const pow = `x^{${i}}`;
      term = absStr === '1' ? pow : `${absStr} ${pow}`;
    }

    if (parts.length === 0) {
      parts.push(c < 0 ? `-${term}` : term);
    } else {
      parts.push(c < 0 ? `- ${term}` : `+ ${term}`);
    }
  }

  return parts.length === 0 ? '0' : parts.join(' ');
}

/**
 * TRUNC(x,5) del machote de Excel: trunca hacia cero a 5 decimales.
 * Los enteros se devuelven tal cual para no perder precisión en sumas
 * grandes (p.ej. Xi^10 del MMC grado 5, donde n*1e5 excede 2^53).
 */
export function trunc5(n: number): number {
  if (!Number.isFinite(n) || Number.isInteger(n)) return n;
  // n*1e5 arrastra polvo flotante (2.4147*1e5 = 241469.99999999997, que
  // truncaría a 2.41469); redondear a 12 cifras significativas antes de
  // truncar reproduce el TRUNC exacto de Excel sin alterar truncaciones
  // genuinas (-0.416666... sigue dando -0.41666).
  const scaled = Number((n * 1e5).toPrecision(12));
  return Math.trunc(scaled) / 1e5;
}

/**
 * Formatea un número como lo muestra el machote: hasta 5 decimales
 * (TRUNC hacia cero) y sin ceros de relleno innecesarios, estilo Excel.
 * P.ej. 2.5 → "2.5", -0.416667 → "-0.41666", 1497.57811 → "1497.57811".
 */
export function fmtTrunc5(n: number): string {
  if (!Number.isFinite(n)) {
    if (Number.isNaN(n)) return 'NaN';
    return n > 0 ? '+∞' : '−∞';
  }
  const t = trunc5(n);
  if (Object.is(t, -0)) return '0';
  return String(t);
}

/** Restringe x al intervalo [lo, hi]. NaN se devuelve sin modificar. */
export function clampX(x: number, lo: number, hi: number): number {
  if (Number.isNaN(x)) return x;
  if (x < lo) return lo;
  if (x > hi) return hi;
  return x;
}
