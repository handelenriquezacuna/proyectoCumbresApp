/**
 * canonical.ts — Fuente única de verdad numérica del Avance 2 (proyecto Cumbres, MA-108).
 *
 * Estos valores replican EXACTAMENTE el Excel del profesor
 * ("Machote Fórmulas Métodos Numéricos.xlsx") con TRUNC(...,5) EN CASCADA:
 * cada celda calculada se trunca hacia cero a 5 decimales
 * (Math.trunc(x * 1e5) / 1e5) y las celdas siguientes usan el valor YA
 * truncado. Las filas "Sumatoria" y las imágenes finales son SUM sin truncar.
 * El sistema normal de mínimos cuadrados se resolvió con aritmética exacta
 * (fracciones BigInt) y los coeficientes se presentan con TRUNC 5; las
 * predicciones y métricas usan los coeficientes truncados.
 *
 * NO recalcular estos valores en runtime: cualquier recomputación en punto
 * flotante sin la cascada de truncación produciría discrepancias con el
 * machote. Generado por scratchpad/calculo-canonico.mjs.
 */

export interface NewtonCase {
  /** valor donde se interpola */
  readonly xEval: number;
  readonly xi: readonly number[];
  readonly yi: readonly number[];
  /**
   * Tabla diagonal de diferencias divididas (TRUNC 5 en cascada):
   * dividedDifferences[k][i] = diferencia de orden k+1 que inicia en x_i,
   * es decir f[x_i, ..., x_{i+k+1}]. La primera entrada de cada orden es a_{k+1}.
   */
  readonly dividedDifferences: ReadonlyArray<readonly number[]>;
  /** a0..a4: primera fila de la tabla diagonal (a0 = y0) */
  readonly coefficients: readonly number[];
  /** fila "Img por ai": a0 y luego TRUNC(a_k * (x-x0)...(x-x_{k-1}), 5) */
  readonly terms: readonly number[];
  /** "Imagen de xEval es": SUM de terms (sin truncar) */
  readonly image: number;
}

export interface LagrangeCase {
  readonly xEval: number;
  readonly xi: readonly number[];
  readonly yi: readonly number[];
  /** L_k = TRUNC(prod_{j!=k}(x_k - x_j), 5) */
  readonly denominators: readonly number[];
  /** N_k = TRUNC(prod_{j!=k}(xEval - x_j), 5) */
  readonly numerators: readonly number[];
  /** T_k = TRUNC(y_k * N_k / L_k, 5) */
  readonly terms: readonly number[];
  /** SUM de terms (sin truncar) */
  readonly image: number;
}

export interface FitMetrics {
  /** error cuadrático medio, TRUNC 5 */
  readonly mse: number;
  /** error absoluto medio, TRUNC 5 */
  readonly mae: number;
  /** error porcentual absoluto medio (en %), TRUNC 5 */
  readonly mape: number;
  /** coeficiente de determinación, TRUNC 5 */
  readonly r2: number;
}

export interface LeastSquaresFit {
  readonly degree: number;
  /** encabezados de la tabla del machote, en orden */
  readonly columns: readonly string[];
  /** 24 filas; cada celda TRUNC 5 */
  readonly rows: ReadonlyArray<readonly number[]>;
  /** fila "Sumatoria": SUM por columna (sin truncar) */
  readonly sums: readonly number[];
  /** sistema normal (potencias ascendentes); fila r: sum(x^(r+c)) — [0][0] = n = 24 */
  readonly normalMatrix: ReadonlyArray<readonly number[]>;
  /** columna "constante": sum(x^r * y) */
  readonly normalVector: readonly number[];
  /** a0..a_d (y = a0 + a1 x + ... + a_d x^d), resueltos exactos y presentados TRUNC 5 */
  readonly coefficients: readonly number[];
  /** predicción TRUNC 5 en cada hora 0..23, evaluada con los coeficientes truncados */
  readonly predictions: readonly number[];
  readonly metrics: FitMetrics;
}

export interface ErrorRow {
  readonly hour: number;
  /** V.Exacto: dato medido */
  readonly exact: number;
  /** V.Aprox: predicción del modelo */
  readonly approx: number;
  /** TRUNC(ABS(e-a), 5) */
  readonly absolute: number;
  /** TRUNC(ABS(e-a)/e, 5) */
  readonly relative: number;
  /** TRUNC(ABS((e-a)/e)*100, 5) */
  readonly percent: number;
}

export interface NewtonVsLagrange {
  readonly xEval: number;
  readonly newton: number;
  readonly lagrange: number;
  /** TRUNC(ABS(newton - lagrange), 5) */
  readonly absoluteDifference: number;
}

export interface ErrorsBlock {
  /** horas 13, 14 y 15 contra la predicción del MMC grado 3 */
  readonly mmc3: readonly ErrorRow[];
  /** horas 13, 14 y 15 contra la predicción del MMC grado 5 */
  readonly mmc5: readonly ErrorRow[];
  readonly newtonVsLagrange: NewtonVsLagrange;
}

/** Newton, caso principal: x = 14.5 con nodos [12..16] */
export const NEWTON_14_5 = {
  xEval: 14.5,
  xi: [12, 13, 14, 15, 16],
  yi: [1480, 1500, 1500, 1495, 1490],
  dividedDifferences: [
    [20, 0, -5, -5],
    [-10, -2.5, 0],
    [2.5, 0.83333],
    [-0.41666],
  ],
  coefficients: [1480, 20, -10, 2.5, -0.41666],
  terms: [1480, 50, -37.5, 4.6875, 0.39061],
  image: 1497.57811,
} as const satisfies NewtonCase;

/** Newton, caso secundario: x = 7.5 con nodos [5..9] */
export const NEWTON_7_5 = {
  xEval: 7.5,
  xi: [5, 6, 7, 8, 9],
  yi: [1250, 1270, 1300, 1340, 1390],
  dividedDifferences: [
    [20, 30, 40, 50],
    [5, 5, 5],
    [0, 0],
    [0],
  ],
  coefficients: [1250, 20, 5, 0, 0],
  terms: [1250, 50, 18.75, 0, 0],
  image: 1318.75,
} as const satisfies NewtonCase;

/** Lagrange, caso principal: x = 14.5 con nodos [12..16] */
export const LAGRANGE_14_5 = {
  xEval: 14.5,
  xi: [12, 13, 14, 15, 16],
  yi: [1480, 1500, 1500, 1495, 1490],
  denominators: [24, -6, 4, -6, 24],
  numerators: [0.5625, 0.9375, 2.8125, -2.8125, -0.9375],
  terms: [34.6875, -234.375, 1054.6875, 700.78125, -58.20312],
  image: 1497.57813,
} as const satisfies LagrangeCase;

/** Mínimos cuadrados grado 3 sobre los 24 puntos */
export const MMC_GRADO_3 = {
  degree: 3,
  columns: ["Xi", "Yi", "XiYi", "Xi^2", "Xi^2Yi", "Xi^3", "Xi^3Yi", "Xi^4", "Xi^5", "Xi^6"],
  rows: [
    [0, 1260, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1250, 1250, 1, 1250, 1, 1250, 1, 1, 1],
    [2, 1245, 2490, 4, 4980, 8, 9960, 16, 32, 64],
    [3, 1240, 3720, 9, 11160, 27, 33480, 81, 243, 729],
    [4, 1240, 4960, 16, 19840, 64, 79360, 256, 1024, 4096],
    [5, 1250, 6250, 25, 31250, 125, 156250, 625, 3125, 15625],
    [6, 1270, 7620, 36, 45720, 216, 274320, 1296, 7776, 46656],
    [7, 1300, 9100, 49, 63700, 343, 445900, 2401, 16807, 117649],
    [8, 1340, 10720, 64, 85760, 512, 686080, 4096, 32768, 262144],
    [9, 1390, 12510, 81, 112590, 729, 1013310, 6561, 59049, 531441],
    [10, 1430, 14300, 100, 143000, 1000, 1430000, 10000, 100000, 1000000],
    [11, 1460, 16060, 121, 176660, 1331, 1943260, 14641, 161051, 1771561],
    [12, 1480, 17760, 144, 213120, 1728, 2557440, 20736, 248832, 2985984],
    [13, 1500, 19500, 169, 253500, 2197, 3295500, 28561, 371293, 4826809],
    [14, 1500, 21000, 196, 294000, 2744, 4116000, 38416, 537824, 7529536],
    [15, 1495, 22425, 225, 336375, 3375, 5045625, 50625, 759375, 11390625],
    [16, 1490, 23840, 256, 381440, 4096, 6103040, 65536, 1048576, 16777216],
    [17, 1470, 24990, 289, 424830, 4913, 7222110, 83521, 1419857, 24137569],
    [18, 1440, 25920, 324, 466560, 5832, 8398080, 104976, 1889568, 34012224],
    [19, 1400, 26600, 361, 505400, 6859, 9602600, 130321, 2476099, 47045881],
    [20, 1360, 27200, 400, 544000, 8000, 10880000, 160000, 3200000, 64000000],
    [21, 1320, 27720, 441, 582120, 9261, 12224520, 194481, 4084101, 85766121],
    [22, 1290, 28380, 484, 624360, 10648, 13735920, 234256, 5153632, 113379904],
    [23, 1270, 29210, 529, 671830, 12167, 15452090, 279841, 6436343, 148035889],
  ],
  sums: [276, 32690, 383525, 4324, 5993445, 76176, 104706095, 1431244, 28007376, 563637724],
  normalMatrix: [
    [24, 276, 4324, 76176],
    [276, 4324, 76176, 1431244],
    [4324, 76176, 1431244, 28007376],
    [76176, 1431244, 28007376, 563637724],
  ],
  normalVector: [32690, 383525, 5993445, 104706095],
  coefficients: [1241.39886, -9.6832, 4.31588, -0.17187],
  predictions: [1241.39886, 1235.85967, 1237.92102, 1246.55169, 1260.72046, 1279.39611, 1301.54742, 1326.14317, 1352.15214, 1378.54311, 1404.28486, 1428.34617, 1449.69582, 1467.30259, 1480.13526, 1487.16261, 1487.35342, 1479.67647, 1463.10054, 1436.59441, 1399.12686, 1349.66667, 1287.18262, 1210.64349],
  metrics: {
    mse: 663.01692,
    mae: 22.03526,
    mape: 1.62775,
    r2: 0.93003,
  },
} as const satisfies LeastSquaresFit;

/** Mínimos cuadrados grado 5 sobre los 24 puntos */
export const MMC_GRADO_5 = {
  degree: 5,
  columns: ["Xi", "Yi", "XiYi", "Xi^2", "Xi^2Yi", "Xi^3", "Xi^3Yi", "Xi^4", "Xi^4Yi", "Xi^5", "Xi^5Yi", "Xi^6", "Xi^7", "Xi^8", "Xi^9", "Xi^10"],
  rows: [
    [0, 1260, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1250, 1250, 1, 1250, 1, 1250, 1, 1250, 1, 1250, 1, 1, 1, 1, 1],
    [2, 1245, 2490, 4, 4980, 8, 9960, 16, 19920, 32, 39840, 64, 128, 256, 512, 1024],
    [3, 1240, 3720, 9, 11160, 27, 33480, 81, 100440, 243, 301320, 729, 2187, 6561, 19683, 59049],
    [4, 1240, 4960, 16, 19840, 64, 79360, 256, 317440, 1024, 1269760, 4096, 16384, 65536, 262144, 1048576],
    [5, 1250, 6250, 25, 31250, 125, 156250, 625, 781250, 3125, 3906250, 15625, 78125, 390625, 1953125, 9765625],
    [6, 1270, 7620, 36, 45720, 216, 274320, 1296, 1645920, 7776, 9875520, 46656, 279936, 1679616, 10077696, 60466176],
    [7, 1300, 9100, 49, 63700, 343, 445900, 2401, 3121300, 16807, 21849100, 117649, 823543, 5764801, 40353607, 282475249],
    [8, 1340, 10720, 64, 85760, 512, 686080, 4096, 5488640, 32768, 43909120, 262144, 2097152, 16777216, 134217728, 1073741824],
    [9, 1390, 12510, 81, 112590, 729, 1013310, 6561, 9119790, 59049, 82078110, 531441, 4782969, 43046721, 387420489, 3486784401],
    [10, 1430, 14300, 100, 143000, 1000, 1430000, 10000, 14300000, 100000, 143000000, 1000000, 10000000, 100000000, 1000000000, 10000000000],
    [11, 1460, 16060, 121, 176660, 1331, 1943260, 14641, 21375860, 161051, 235134460, 1771561, 19487171, 214358881, 2357947691, 25937424601],
    [12, 1480, 17760, 144, 213120, 1728, 2557440, 20736, 30689280, 248832, 368271360, 2985984, 35831808, 429981696, 5159780352, 61917364224],
    [13, 1500, 19500, 169, 253500, 2197, 3295500, 28561, 42841500, 371293, 556939500, 4826809, 62748517, 815730721, 10604499373, 137858491849],
    [14, 1500, 21000, 196, 294000, 2744, 4116000, 38416, 57624000, 537824, 806736000, 7529536, 105413504, 1475789056, 20661046784, 289254654976],
    [15, 1495, 22425, 225, 336375, 3375, 5045625, 50625, 75684375, 759375, 1135265625, 11390625, 170859375, 2562890625, 38443359375, 576650390625],
    [16, 1490, 23840, 256, 381440, 4096, 6103040, 65536, 97648640, 1048576, 1562378240, 16777216, 268435456, 4294967296, 68719476736, 1099511627776],
    [17, 1470, 24990, 289, 424830, 4913, 7222110, 83521, 122775870, 1419857, 2087189790, 24137569, 410338673, 6975757441, 118587876497, 2015993900449],
    [18, 1440, 25920, 324, 466560, 5832, 8398080, 104976, 151165440, 1889568, 2720977920, 34012224, 612220032, 11019960576, 198359290368, 3570467226624],
    [19, 1400, 26600, 361, 505400, 6859, 9602600, 130321, 182449400, 2476099, 3466538600, 47045881, 893871739, 16983563041, 322687697779, 6131066257801],
    [20, 1360, 27200, 400, 544000, 8000, 10880000, 160000, 217600000, 3200000, 4352000000, 64000000, 1280000000, 25600000000, 512000000000, 10240000000000],
    [21, 1320, 27720, 441, 582120, 9261, 12224520, 194481, 256714920, 4084101, 5391013320, 85766121, 1801088541, 37822859361, 794280046581, 16679880978201],
    [22, 1290, 28380, 484, 624360, 10648, 13735920, 234256, 302190240, 5153632, 6648185280, 113379904, 2494357888, 54875873536, 1207269217792, 26559922791424],
    [23, 1270, 29210, 529, 671830, 12167, 15452090, 279841, 355398070, 6436343, 8174155610, 148035889, 3404825447, 78310985281, 1801152661463, 41426511213649],
  ],
  sums: [276, 32690, 383525, 4324, 5993445, 76176, 104706095, 1431244, 1949053545, 28007376, 37811015975, 563637724, 11577558576, 241550448844, 5101857205776, 108829886664124],
  normalMatrix: [
    [24, 276, 4324, 76176, 1431244, 28007376],
    [276, 4324, 76176, 1431244, 28007376, 563637724],
    [4324, 76176, 1431244, 28007376, 563637724, 11577558576],
    [76176, 1431244, 28007376, 563637724, 11577558576, 241550448844],
    [1431244, 28007376, 563637724, 11577558576, 241550448844, 5101857205776],
    [28007376, 563637724, 11577558576, 241550448844, 5101857205776, 108829886664124],
  ],
  normalVector: [32690, 383525, 5993445, 104706095, 1949053545, 37811015975],
  coefficients: [1266.48386, -21.91957, 2.4147, 0.55226, -0.0543, 0.00119],
  predictions: [1266.48386, 1247.47814, 1235.89088, 1233.25934, 1240.10318, 1256.06726, 1280.06444, 1310.41838, 1345.00634, 1381.40198, 1417.01816, 1449.24974, 1475.61638, 1493.90534, 1502.31428, 1499.59406, 1485.19154, 1459.39238, 1423.46384, 1379.79758, 1332.05246, 1285.29734, 1246.15388, 1222.93934],
  metrics: {
    mse: 326.2138,
    mae: 12.99764,
    mape: 0.97098,
    r2: 0.96557,
  },
} as const satisfies LeastSquaresFit;

/** Bloque de errores del machote (hoja "Errores") */
export const ERRORES = {
  mmc3: [
    {
      hour: 13,
      exact: 1500,
      approx: 1467.30259,
      absolute: 32.69741,
      relative: 0.02179,
      percent: 2.17982,
    },
    {
      hour: 14,
      exact: 1500,
      approx: 1480.13526,
      absolute: 19.86474,
      relative: 0.01324,
      percent: 1.32431,
    },
    {
      hour: 15,
      exact: 1495,
      approx: 1487.16261,
      absolute: 7.83739,
      relative: 0.00524,
      percent: 0.52424,
    },
  ],
  mmc5: [
    {
      hour: 13,
      exact: 1500,
      approx: 1493.90534,
      absolute: 6.09466,
      relative: 0.00406,
      percent: 0.40631,
    },
    {
      hour: 14,
      exact: 1500,
      approx: 1502.31428,
      absolute: 2.31428,
      relative: 0.00154,
      percent: 0.15428,
    },
    {
      hour: 15,
      exact: 1495,
      approx: 1499.59406,
      absolute: 4.59406,
      relative: 0.00307,
      percent: 0.30729,
    },
  ],
  newtonVsLagrange: {
    xEval: 14.5,
    newton: 1497.57811,
    lagrange: 1497.57813,
    absoluteDifference: 0.00002,
  },
} as const satisfies ErrorsBlock;
