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

/** Restringe x al intervalo [lo, hi]. NaN se devuelve sin modificar. */
export function clampX(x: number, lo: number, hi: number): number {
  if (Number.isNaN(x)) return x;
  if (x < lo) return lo;
  if (x > hi) return hi;
  return x;
}
