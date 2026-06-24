import type { Point } from '@/lib/methods/types';

/**
 * Selecciona los `n` puntos del dataset más cercanos a un valor `target` en x,
 * preservando su orden creciente para que los polinomios interpolantes los
 * consuman bien. Útil para Newton/Lagrange centrados en una hora consultada.
 */
export function pickNearestN(points: ReadonlyArray<Point>, target: number, n: number): Point[] {
  const sortedByDistance = [...points].sort(
    (a, b) => Math.abs(a.x - target) - Math.abs(b.x - target),
  );
  const top = sortedByDistance.slice(0, Math.min(n, points.length));
  return top.sort((a, b) => a.x - b.x);
}

/**
 * Interpolación lineal entre dos puntos. Devuelve y(target) bajo la recta que
 * pasa por (x0,y0) y (x1,y1).
 */
export function linearInterpolate(p0: Point, p1: Point, target: number): number {
  if (p1.x === p0.x) return p0.y;
  const slope = (p1.y - p0.y) / (p1.x - p0.x);
  return p0.y + slope * (target - p0.x);
}

/**
 * Encuentra los dos vecinos inmediatos (anterior y posterior) a un target en x.
 * Devuelve null si target queda fuera del rango.
 */
export function neighbors(
  points: ReadonlyArray<Point>,
  target: number,
): { left: Point; right: Point } | null {
  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i]!;
    const right = points[i + 1]!;
    if (target >= left.x && target <= right.x) {
      return { left, right };
    }
  }
  return null;
}

/**
 * Muestrea una función fit en `samples` puntos equiespaciados en [xMin, xMax],
 * clamp opcional para evitar que oscilaciones de Runge rompan el eje Y.
 */
export function sampleFit(
  evaluate: (x: number) => number,
  xMin: number,
  xMax: number,
  samples: number,
  clamp?: [number, number],
): Array<{ x: number; y: number; raw: number }> {
  const result = new Array<{ x: number; y: number; raw: number }>(samples);
  const last = samples - 1;
  for (let i = 0; i < samples; i++) {
    const x = xMin + ((xMax - xMin) * i) / last;
    const raw = evaluate(x);
    let y = raw;
    if (clamp) {
      if (y < clamp[0]) y = clamp[0];
      else if (y > clamp[1]) y = clamp[1];
    }
    result[i] = { x, y, raw };
  }
  return result;
}
