import type { Point } from '@/lib/methods/types';

/**
 * Demanda eléctrica horaria del Cumbres Data Center S.A. (caso ficticio).
 * Serie de 24 puntos correspondiente a un martes laboral típico, con eje
 * temporal en horas (0–23) y carga útil en kW.
 *
 * El perfil reproduce el patrón observado por Uptime Institute (Global Data
 * Center Survey 2024) para instalaciones Tier III con factor de carga ≈ 0,9,
 * y la curva diaria descrita por Hong & Fan (2016) en "Probabilistic electric
 * load forecasting: A tutorial review". Los valores valle (1240 kW) y pico
 * (1500 kW) reflejan la elevación térmica vespertina típica de la Gran Área
 * Metropolitana de Costa Rica (ASHRAE Thermal Guidelines, 5.ª ed., 2021).
 */
export const CUMBRES_POINTS: Point[] = [
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

export const DATASET_METADATA = {
  company: 'Cumbres Data Center S.A. (ficticio)',
  tier: 'Tier III',
  location: 'Belén, Heredia, Costa Rica',
  pue: 1.55,
  loadFactor: 0.9,
  basis:
    'Uptime Institute Global Data Center Survey 2024; ASHRAE Thermal Guidelines 5th ed.',
  pickKw: 1500,
  valleyKw: 1240,
  dayType: 'martes laboral típico',
  unitsX: 'hora',
  unitsY: 'kW',
} as const;
