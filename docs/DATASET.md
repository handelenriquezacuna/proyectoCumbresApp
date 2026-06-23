# Dataset — Cumbres Data Center S.A.

## Origen

Dataset **sintético** de 24 puntos horarios kW/hora, calibrado para reflejar el comportamiento
real de un centro de datos Tier III ficticio operando en Costa Rica. La calibración se basa en:

- **Uptime Institute Global Data Center Survey 2024** — PUE promedio mundial 1.55; instalaciones
  hiperescala < 1.20.
- **ASHRAE Thermal Guidelines for Data Processing Environments (5.ª ed., 2021)** — patrones de
  carga térmica horaria.
- **Koomey (2011)** — comportamiento de carga de TI ~24/7 con picos por horario laboral.

## Empresa modelada

| Campo | Valor |
|---|---|
| Razón social | Cumbres Data Center S.A. (ficticio) |
| Tier | III (disponibilidad 99.982 %) |
| Ubicación | Belén, Heredia, Costa Rica |
| Carga pico | 1500 kW |
| Carga valle | 1240 kW |
| Variación pico-valle | ~17 % |
| PUE objetivo | 1.55 |
| Factor de carga | ~0.9 |
| Día tipo | Martes laboral |

## Tabla literal (24 puntos)

| Hora | kW | Hora | kW | Hora | kW | Hora | kW |
|------|----|------|----|------|----|------|----|
| 0 | 1260 | 6 | 1270 | 12 | 1480 | 18 | 1440 |
| 1 | 1250 | 7 | 1300 | 13 | 1500 | 19 | 1400 |
| 2 | 1245 | 8 | 1340 | 14 | 1500 | 20 | 1360 |
| 3 | 1240 | 9 | 1390 | 15 | 1495 | 21 | 1320 |
| 4 | 1240 | 10 | 1430 | 16 | 1490 | 22 | 1290 |
| 5 | 1250 | 11 | 1460 | 17 | 1470 | 23 | 1270 |

Hard-coded en [`src/lib/data/cumbresDataset.ts`](../src/lib/data/cumbresDataset.ts) como
`CUMBRES_POINTS` (TypeScript readonly array de `Point`).

## Patrón temporal

- **Madrugada (0–5 h):** valle. Carga base ~1240–1260 kW. Servidores activos pero pocos
  procesos batch; HVAC mínimo (clima frío exterior).
- **Mañana (6–11 h):** rampa. Picos progresivos por inicio de jornada laboral de clientes y
  procesos diurnos.
- **Mediodía (12–14 h):** pico. ~1500 kW. Máxima carga de TI + máxima necesidad de
  refrigeración (clima exterior cálido).
- **Tarde (15–18 h):** meseta alta + descenso. Carga sostenida con descenso suave.
- **Noche (19–23 h):** descenso. Vuelta a valores cercanos a base.

Esta curva en forma de campana asimétrica (mañana más empinada que tarde) es típica de centros
de datos en clima tropical, donde el HVAC amplifica la curva de carga de TI.

## Fuentes citadas

```
ASHRAE. (2021). Thermal guidelines for data processing environments (5.ª ed.).
   American Society of Heating, Refrigerating and Air-Conditioning Engineers.

Avelar, V., Azevedo, D., & French, A. (2012). PUE: A comprehensive examination
   of the metric (White Paper #49). The Green Grid.

Belady, C., Rawson, A., Pflueger, J., & Cader, T. (2008). Green Grid data center
   power efficiency metrics: PUE and DCiE (White Paper #6). The Green Grid.

Hong, T., & Fan, S. (2016). Probabilistic electric load forecasting: A tutorial
   review. International Journal of Forecasting, 32(3), 914–938.
   https://doi.org/10.1016/j.ijforecast.2015.11.011

Koomey, J. (2011). Growth in data center electricity use 2005 to 2010.
   Analytics Press.

Suganthi, L., & Samuel, A. A. (2012). Energy models for demand forecasting —
   A review. Renewable and Sustainable Energy Reviews, 16(2), 1223–1240.
   https://doi.org/10.1016/j.rser.2011.08.014

Uptime Institute. (2024). Global data center survey 2024.
   Uptime Institute Intelligence.
```
