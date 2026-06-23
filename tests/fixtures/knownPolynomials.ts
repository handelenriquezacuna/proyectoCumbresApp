import type { Point } from '@/lib/methods/types';

/** y = x^2 + 1 sampled at x = 0, 1, 2. */
export const QUADRATIC: Point[] = [
  { x: 0, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 5 },
];

/** y = 2x + 3 sampled at x = 0, 1, 2, 3. */
export const LINEAR: Point[] = [
  { x: 0, y: 3 },
  { x: 1, y: 5 },
  { x: 2, y: 7 },
  { x: 3, y: 9 },
];

/**
 * Cumbres Data Center S.A. — 24-hour electrical demand profile (kW).
 * Calibrated against Uptime Institute (2024) Tier III references and
 * the building's measured PUE of 1.55.
 */
export const CUMBRES_24: Point[] = [
  { x: 0, y: 1260 },
  { x: 1, y: 1250 },
  { x: 2, y: 1245 },
  { x: 3, y: 1240 },
  { x: 4, y: 1240 },
  { x: 5, y: 1250 },
  { x: 6, y: 1270 },
  { x: 7, y: 1300 },
  { x: 8, y: 1340 },
  { x: 9, y: 1390 },
  { x: 10, y: 1430 },
  { x: 11, y: 1460 },
  { x: 12, y: 1480 },
  { x: 13, y: 1500 },
  { x: 14, y: 1500 },
  { x: 15, y: 1495 },
  { x: 16, y: 1490 },
  { x: 17, y: 1470 },
  { x: 18, y: 1440 },
  { x: 19, y: 1400 },
  { x: 20, y: 1360 },
  { x: 21, y: 1320 },
  { x: 22, y: 1290 },
  { x: 23, y: 1270 },
];
