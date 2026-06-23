export type Point = { x: number; y: number };

export type Method = 'newton' | 'lagrange' | 'ls3' | 'ls5';

export type FitMetrics = {
  mse: number;
  mae: number;
  mape: number;
  r2: number;
};

export type FitResult = {
  method: Method;
  coefficients: number[];
  evaluate: (x: number) => number;
  latex: string;
  metrics: FitMetrics;
};
