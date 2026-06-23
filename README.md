# ⚡ Cumbres — Demand Forecasting

Aplicación web educativa que demuestra interpolación polinómica de Newton, Lagrange y ajuste por
mínimos cuadrados aplicados a la predicción de demanda eléctrica en un centro de datos.

Proyecto académico del curso **MA-108 Métodos Numéricos**, Universidad Fidélitas, Grupo 3
(lunes noche), profesor Edwin Villalobos Martínez. Entrega Avance 2: **2 ago 2026**.

🔗 **URL pública:** https://handelenriquezacuna.github.io/proyectoCumbresApp/

## Historia que cuenta

Datos discretos (24 puntos kW/hora del Cumbres Data Center S.A. ficticio, calibrado con Uptime
Institute 2024) → 3 métodos numéricos → comparación de errores (MSE, MAE, MAPE, R²) → conclusión
sobre cuál método es más preciso y cuándo usar cada uno.

## Stack

- Vite 5 + React 18 + TypeScript 5 (strict)
- Tailwind CSS 3
- Recharts (gráficos), KaTeX (ecuaciones), Zustand (estado), pdfmake (PDF)
- Vitest + Testing Library (tests)

## Comandos

```bash
npm install        # instalar deps
npm run dev        # dev server en :5173
npm test           # correr tests
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # build de producción a ./dist
npm run deploy     # publica ./dist a la rama gh-pages
```

## Estructura

```
src/lib/methods/       # newton, lagrange, leastSquares, errors, linalg
src/lib/data/          # dataset Cumbres (24 puntos)
src/lib/export/        # csv, pdf
src/state/             # zustand store
src/components/        # ui + math + data + methods + compare + quiz + exports
src/sections/          # 7 secciones narrativas + Hero + Quiz
tests/                 # unit + componentes
docs/MASTER_PROMPT.md  # reconstrucción autocontenida del proyecto
```

## Documentación

- [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md) — prompt autocontenido para recrear el proyecto
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — decisiones de arquitectura
- [`docs/DATASET.md`](docs/DATASET.md) — origen y calibración del dataset
- Cerebro académico del proyecto: `~/Documents/fidelitasHan/metodosNumericos/cerebro/`
