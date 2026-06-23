# MASTER PROMPT — Cumbres Demand Forecasting (autocontenido)

> Este documento permite a un Claude futuro reconstruir el proyecto desde cero. Está pensado
> para ser pegado literalmente como prompt inicial. Léelo entero antes de actuar.

---

## 1. Identidad

- **Proyecto:** Predicción de la Demanda Eléctrica en un Centro de Datos mediante Interpolación
  Polinómica y Mínimos Cuadrados — Caso Cumbres Data Center S.A.
- **Codename:** ⚡ Proyecto Cumbres
- **Curso:** MA-108 Métodos Numéricos
- **Universidad:** Universidad Fidélitas (Costa Rica)
- **Profesor:** Edwin Villalobos Martínez
- **Grupo:** #3 (Lunes Noche, 6pm–9pm) — 5 integrantes
- **Avance 1:** dom 28 jun 2026 (Cap. I)
- **Avance 2 (incluye esta app):** dom 2 ago 2026
- **Propósito de la app:** complemento ejecutable del trabajo académico que cuenta la historia
  del proyecto, demuestra los 3 métodos numéricos sobre el dataset canónico y permite descargar
  CSV/PDF. Despliegue gratuito en GitHub Pages.

---

## 2. Vínculo al cerebro de Obsidian

El conocimiento académico vive en un vault de Obsidian:

```
~/Documents/fidelitasHan/metodosNumericos/cerebro/
```

Archivos clave a leer ANTES de tocar la app:

1. `cerebro/00-Indice/MOC.md` — dashboard del proyecto
2. `cerebro/07-MapaMental/Mapa-Mental-Radial.md` — 7 ramas que estructuran la narrativa
3. `cerebro/03-Empresa/Datos-Sinteticos.md` — dataset canónico

Documentación complementaria de la app vive en `cerebro/09-App-Cumbres/Repo-y-Decisiones.md`.

---

## 3. Dataset canónico (24 puntos hora:kW)

Hard-coded en `src/lib/data/cumbresDataset.ts`. Origen: ficticio, calibrado con Uptime Institute
2024 (PUE 1.55) y ASHRAE Thermal Guidelines 5th ed. Centro de datos Tier III en Belén, Heredia.

```
 0:1260,  1:1250,  2:1245,  3:1240,  4:1240,  5:1250,
 6:1270,  7:1300,  8:1340,  9:1390, 10:1430, 11:1460,
12:1480, 13:1500, 14:1500, 15:1495, 16:1490, 17:1470,
18:1440, 19:1400, 20:1360, 21:1320, 22:1290, 23:1270
```

- Rango: 1240–1500 kW
- Pico: 13–14 h (laboral). Valle: 3–4 h (madrugada).
- Variación pico-valle: ~17 %.

---

## 4. Stack técnico

| Capa | Elección | Razón |
|---|---|---|
| Build / dev | Vite 5 | build estático trivial para GitHub Pages |
| Framework | React 19 + TypeScript 5 (strict, noUncheckedIndexedAccess) | tipado fuerte, ecosistema dominante |
| Styling | Tailwind CSS 3 | mobile-first sin CSS custom |
| Gráficos | Recharts 3 | declarativo, React-nativo |
| Ecuaciones | `react-katex` (KaTeX) | LaTeX rápido en cliente |
| Estado | Zustand | mínimo, sin boilerplate |
| Export PDF | pdfmake | tablas/secciones declarativas |
| Tests | Vitest + @testing-library/react + jsdom | runner compartido con Vite |
| Lint/Format | ESLint + Prettier | calidad antes de commit |
| Deploy | gh-pages + GitHub Actions | gratis, automatizado |

Base path Vite: `/proyectoCumbresApp/`. Path alias: `@/*` → `src/*`.

---

## 5. Estructura de carpetas

```
proyectoCumbresApp/
├── .github/workflows/{ci.yml, deploy.yml}
├── docs/{MASTER_PROMPT.md, ARCHITECTURE.md, DATASET.md}
├── public/
├── src/
│   ├── main.tsx, App.tsx, index.css
│   ├── lib/
│   │   ├── methods/{types, linalg, newton, lagrange, leastSquares, errors}.ts
│   │   ├── data/cumbresDataset.ts
│   │   ├── export/{csv, pdf}.ts
│   │   └── format.ts
│   ├── state/store.ts
│   ├── components/
│   │   ├── layout/{Header, Footer, TocSidebar, SectionAnchor}.tsx
│   │   ├── ui/{Button, Card, Select, Slider, Tabs}.tsx
│   │   ├── math/KatexEquation.tsx
│   │   ├── data/{DatasetTable, DatasetChart}.tsx
│   │   ├── methods/{MethodPicker, DegreeSlider, InterpolationChart, FitSummary, MethodPlayground}.tsx
│   │   ├── compare/ErrorComparison.tsx
│   │   ├── quiz/{Question, QuizResult, Quiz}.tsx
│   │   └── exports/{CsvDownloadButton, PdfDownloadButton}.tsx
│   ├── sections/01-Hero.tsx … 09-Quiz.tsx
│   └── types/react-katex.d.ts
└── tests/{unit, components, fixtures, setup.ts}
```

---

## 6. Signatures TypeScript de `src/lib/methods/`

```ts
// types.ts
export type Point = { x: number; y: number };
export type Method = 'newton' | 'lagrange' | 'ls3' | 'ls5';
export type FitResult = {
  method: Method;
  coefficients: number[];
  evaluate: (x: number) => number;
  latex: string;
  metrics: { mse: number; mae: number; mape: number; r2: number };
};

// linalg.ts
export function gaussSolve(A: number[][], b: number[]): number[]; // partial pivoting

// newton.ts
export function dividedDifferences(points: Point[]): number[];
export function evalNewton(coefs: number[], xs: number[], x: number): number;
export function fitNewton(points: Point[]): FitResult;

// lagrange.ts
export function evalLagrange(points: Point[], x: number): number;
export function fitLagrange(points: Point[]): FitResult;

// leastSquares.ts
export function fitLeastSquares(points: Point[], degree: number): FitResult;

// errors.ts
export function mse(actual: number[], predicted: number[]): number;
export function mae(actual: number[], predicted: number[]): number;
export function mape(actual: number[], predicted: number[]): number; // guard 0
export function rSquared(actual: number[], predicted: number[]): number;
```

---

## 7. Las 7 secciones narrativas (1 línea por sección)

| Sección | Hash | Color cumbres | Contenido |
|---|---|---|---|
| 01 Hero | — | — | identidad + CTA scroll → #conceptos |
| 02 Conceptos | #conceptos | conceptos (azul) | demanda eléctrica, kW vs kWh, datos discretos |
| 03 Métodos | #metodos | metodos (morado) | Newton, Lagrange, MMC, Runge + ecuaciones KaTeX |
| 04 Aplicaciones | #aplicaciones | aplicaciones (rosa) | pronóstico horario, HVAC, tarifa T-MT, picos |
| 05 Caso Cumbres | #caso | caso (rojo) | DatasetTable + MethodPlayground + CSV/PDF buttons |
| 06 Implementación | #implementacion | implementacion (verde) | software + Runge + ErrorComparison |
| 07 Futuro | #futuro | futuro (naranja) | ML/LSTM, BMS, AI/GPU, sostenibilidad |
| 08 Conclusiones | #conclusiones | conclusiones (amarillo) | ≥3 conclusiones técnicas |
| 09 Quiz | #quiz | — | 5 preguntas de autoevaluación |

Citaciones APA 7 inline: Chapra & Canale (2015), Burden & Faires (2017), Hong & Fan (2016),
Suganthi & Samuel (2012), Avelar et al. (2012), Belady et al. (2008), ASHRAE (2021), Uptime
Institute (2024), Koomey (2011), Mora Flores (2022). **PROHIBIDO** Wikipedia, ChatGPT, Gemini.

---

## 8. Spec del Playground y ErrorComparison

**MethodPlayground** (`src/components/methods/MethodPlayground.tsx`)
- Compone: `MethodPicker` + `DegreeSlider` (solo si ls3/ls5) + `InterpolationChart` + `FitSummary`.
- Lee/escribe estado vía `useCumbresStore`: `activeMethod`, `polynomialDegree`, `sampleX`.
- `useMemo` para el `FitResult` cuando cambian inputs.
- `yDomain` clamp `[1100, 1600]` para que Runge (Newton/Lagrange grado 23) no rompa el gráfico —
  esto es deliberado y se explica en sección 06.

**ErrorComparison** (`src/components/compare/ErrorComparison.tsx`)
- Calcula los 4 fits (`newton`, `lagrange`, `ls3`, `ls5`) sobre `CUMBRES_POINTS`.
- Tabla 4 × 5 (Método, MSE, MAE, MAPE, R²) con fila de menor MSE resaltada (emerald).
- `ComposedChart` con 4 series de curvas + scatter de los 24 puntos.

---

## 9. Quiz — 5 preguntas (respuesta correcta marcada)

| # | Pregunta | Respuesta correcta |
|---|---|---|
| 1 | ¿Cuál método permite agregar un nuevo punto sin recalcular el polinomio anterior? | b) Newton (diferencias divididas) |
| 2 | Para datos con ruido, ¿qué método es preferible? | c) Mínimos cuadrados |
| 3 | El fenómeno de Runge ocurre cuando... | a) ...se usan polinomios de grado alto en interpolación equiespaciada |
| 4 | Si R² = 0.97, significa que... | b) El modelo explica el 97% de la variabilidad |
| 5 | El PUE de un centro de datos ideal sería... | b) 1 |

---

## 10. Umbrales de testing

- `npm run typecheck`: 0 errores
- `npm test`: **36 tests / 8 archivos** mínimo, todos verdes
- `npm run build`: succeed (warning del bundle por pdfmake es aceptable)
- MMC grado 5 sobre `CUMBRES_24`: **R² ≥ 0.97** (medido 0.9957 en implementación actual)
- MMC grado 1 sobre línea perfecta: **R² = 1**
- Newton + Lagrange sobre cuadrática y=x²+1 con 3 puntos: error < 1e-10
- Cross-check Newton vs Lagrange en 50 puntos aleatorios: |diff| < 1e-8

---

## 11. CI/CD + base path

`.github/workflows/ci.yml` — ejecuta en push + PR:
- Node 20, npm ci, lint (continue-on-error), typecheck, test --coverage, build.

`.github/workflows/deploy.yml` — ejecuta en push a `main`:
- Build → `peaceiris/actions-gh-pages@v3` publica `./dist` a la rama `gh-pages`.

`vite.config.ts`: `base: '/proyectoCumbresApp/'`. GitHub: Settings → Pages → Source `gh-pages` / root.

---

## 12. Comandos de despliegue

```bash
cd ~/Documents/dev/proyectoCumbresApp
npm ci
npm run typecheck && npm test && npm run build   # gate local
npm run deploy                                   # primera vez manual; luego CI
```

**URL final:** https://handelenriquezacuna.github.io/proyectoCumbresApp/

---

## 13. Workflow multi-agente (cómo se construyó)

Fases ejecutadas con patrón work + reviewer adversarial cuando aplica:

1. **scaffold** (main loop)
2. **math core** + reviewer adversarial
3. **data + state**
4. **UI primitives + layout**
5. **feature components** (Playground, ErrorComparison)
6. **narrative sections** + reviewer adversarial
7. **quiz**
8. **exports** + reviewer adversarial
9. **CI/CD**
10. **docs**
11. **cerebro update**
12. **orchestrator sign-off**

Cada agente: recibe path absoluto del repo, dataset, lista de archivos a crear, criterios. Tras
escribir corre `npm run typecheck && npm test && npm run build` y commitea con prefijo
convencional (feat / fix / chore / ci / docs / test).

Para reconstruir desde cero, ver script en `~/.claude/projects/.../workflows/scripts/cumbres-build-*.js`.

---

## 14. Restricciones invariantes

- ❌ No usar Wikipedia / ChatGPT / Gemini como fuentes citadas.
- ✅ APA 7 inline (Apellido y Apellido, año) en español.
- ✅ Tercera persona impersonal en prosa.
- ✅ TypeScript strict + noUncheckedIndexedAccess.
- ✅ Mobile-first (Tailwind responsive); sin scroll horizontal en 375 px.
- ✅ Accesibilidad AA: focus-visible, aria-roles, contraste suficiente.
- ✅ Ecuaciones siempre en KaTeX (NUNCA imágenes).
- ✅ Commits convencionales y atómicos por fase.

---

## 15. Checklist de aceptación final

- [ ] `npm run typecheck` 0 errores
- [ ] `npm test` ≥ 36 tests verdes
- [ ] `npm run build` succeed, `dist/` generado
- [ ] App abre en localhost (`npm run dev`) y en URL pública
- [ ] TOC click → scroll a sección + sección resaltada
- [ ] MethodPicker cambia entre Newton/Lagrange/MMC3/MMC5
- [ ] DegreeSlider visible solo para ls3/ls5
- [ ] InterpolationChart muestra Runge cuando grado=23 (Newton/Lagrange)
- [ ] ErrorComparison resalta fila de menor MSE
- [ ] CSV button descarga `cumbres-demanda.csv` con 24 filas + predicción
- [ ] PDF button descarga reporte con dataset + ecuación + métricas
- [ ] Quiz: completar 5 → ver score; reset funciona
- [ ] Lighthouse mobile: Performance ≥ 80, Accessibility ≥ 95
- [ ] README, MASTER_PROMPT, ARCHITECTURE, DATASET docs presentes
- [ ] Cerebro: `09-App-Cumbres/Repo-y-Decisiones.md` con timeline de commits
