export type TaskCat =
  | 'fix'
  | 'cap3a'
  | 'cap3b'
  | 'cap3c'
  | 'cap4'
  | 'ensamble';

export interface PlanTask {
  id: string;
  cat: TaskCat;
  label: string;
  note?: string;
  ref?: string;
}

export interface PlanMember {
  id: string;
  initials: string;
  name: string;
  shortName: string;
  role: string;
  tasks: readonly PlanTask[];
}

// Jul 27 23:59 Costa Rica (UTC-6)
export const DEADLINE = new Date('2026-07-28T05:59:00Z');

export const CAT_LABEL: Record<TaskCat, string> = {
  fix: 'Corrección',
  cap3a: 'Cap III.a',
  cap3b: 'Cap III.b',
  cap3c: 'Cap III.c',
  cap4: 'Cap IV',
  ensamble: 'Ensamble',
};

export const CAT_BADGE: Record<TaskCat, string> = {
  fix: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  cap3a: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  cap3b: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  cap3c: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cap4: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  ensamble: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

export const MEMBERS: readonly PlanMember[] = [
  {
    id: 'handel',
    initials: 'HE',
    name: 'Handel Enríquez Acuña',
    shortName: 'Handel',
    role: 'Coordinador · Correcciones estructurales · Cap IV',
    tasks: [
      {
        id: 'he1',
        cat: 'fix',
        label: 'Portada: aplicar formato APA completo (Times New Roman 12 pt, centrado, márgenes 2.54 cm)',
        ref: '1.1',
      },
      {
        id: 'he2',
        cat: 'fix',
        label: 'Portada: eliminar subtítulo "(Avance 1)" enmarcado en rojo',
        ref: '1.2',
      },
      {
        id: 'he3',
        cat: 'fix',
        label: 'Insertar hoja separadora "Tabla de Contenidos" (entre portada e índice)',
        ref: '2.1',
        note: 'Página en blanco con el título centrado en 26 pt negrita, siguiendo el formato de portadilla Fidélitas.',
      },
      {
        id: 'he4',
        cat: 'fix',
        label: 'Insertar hoja separadora "Capítulo I: Introducción" (antes del cap I)',
        ref: '3.1',
      },
      {
        id: 'he5',
        cat: 'fix',
        label: 'Insertar hoja separadora "Bibliografía" (antes de la lista de referencias)',
        ref: '32.1',
      },
      {
        id: 'he6',
        cat: 'fix',
        label: 'Reordenar Cap II: mover secciones 2.4–2.9 (matemáticas) ANTES de 2.1–2.3 (demanda eléctrica)',
        ref: '19.2',
        note: 'Nuevo orden: 2.1 Datos discretos e interpolación → 2.2 Newton → 2.3 Lagrange → 2.4 Fenómeno Runge → 2.5 MMC → 2.6 Métricas de error → luego 2.7 Demanda eléctrica → 2.8 Centro de datos → 2.9 PUE → 2.10 Curva de carga.',
      },
      {
        id: 'he7',
        cat: 'fix',
        label: 'Objetivo General: eliminar o mover a la Introducción el texto marcado en rojo',
        ref: '17.1',
        note: 'El texto subrayado en rojo dice "a partir de un registro histórico... planificación operativa". El profesor indica que es demasiado extenso para el objetivo; resumirlo a una frase o llevarlo al planteamiento.',
      },
      {
        id: 'he8',
        cat: 'fix',
        label: 'Corregir TODA la bibliografía a formato APA 7 (sangría francesa, cursivas en título, DOI/URL)',
        ref: '32.1',
        note: 'Revisar cada entrada contra el manual APA Fidélitas. Cuidado con: falta de cursiva en títulos de libros, formatos de páginas web sin fecha de consulta, entradas sin URL/DOI.',
      },
      {
        id: 'he9',
        cat: 'fix',
        label: 'Recorrer todo el documento y reducir párrafos largos a 4–6 renglones máximo',
        ref: '8.1',
      },
      {
        id: 'he10',
        cat: 'cap4',
        label: 'Cap IV.a — Conclusión 1 (OE1): análisis del comportamiento horario — identificar carga base, pico y variación diaria',
        note: 'Carga base: 1 240 kW (03:00–04:00 h). Pico: 1 500 kW (13:00–14:00 h). Variación: 260 kW = 21 % entre valle y pico. Sin citas — solo resultados.',
      },
      {
        id: 'he11',
        cat: 'cap4',
        label: 'Cap IV.a — Conclusión 2 (OE2): implementación Newton y Lagrange — estimación en x=14.5 y verificación de unicidad',
        note: 'Newton(5 nodos) en x=14.5 → 1 497.5 kW. Lagrange(5 nodos) en x=14.5 → mismo resultado. Diferencia < 1×10⁻⁹ confirma unicidad del polinomio interpolador.',
      },
      {
        id: 'he12',
        cat: 'cap4',
        label: 'Cap IV.a — Conclusión 3 (OE3): comparación MSE/MAE/R² — cuál método ganó y en qué contexto operativo',
        note: 'Usar los valores de la Tabla 2 (hecha por Diego). MMC grado 5 gana en ajuste global (R² más alto). Newton/Lagrange son mejores para interpolación puntual local. No incluir citas.',
      },
      {
        id: 'he13',
        cat: 'cap4',
        label: 'Cap IV.b — Recomendaciones: futuras investigaciones, mejoras metodológicas, aplicaciones prácticas',
        note: 'Sugerencias: (1) Reemplazar datos sintéticos con datos reales de SCADA de Cumbres. (2) Comparar contra modelo LSTM cuando se acumulen 6 meses de datos. (3) Automatizar ajuste semanal del polinomio con BMS. (4) Extender a predicción de demanda de enfriamiento con PUE dinámico.',
      },
      {
        id: 'he14',
        cat: 'ensamble',
        label: 'Ensamble final: fusionar Word de todos, unificar numeración (páginas, tablas, figuras, ecuaciones)',
        note: 'Hacer después de recibir todas las secciones (target: 25 jul). Verificar que las figuras llevan "Figura N" en negrita, título en cursiva y nota APA.',
      },
      {
        id: 'he15',
        cat: 'ensamble',
        label: 'Checklist APA final antes de subir: citas ↔ referencias, interlineado 1.5, sangría 1 cm, numeración romana preliminar',
        note: 'Portada no imprime número pero cuenta. Desde Cap I en adelante → arábigos desde 1.',
      },
    ],
  },
  {
    id: 'lizzy',
    initials: 'LC',
    name: 'Lizzy Castro Duarte',
    shortName: 'Lizzy',
    role: 'Cap III — Planteamiento del problema + Dataset',
    tasks: [
      {
        id: 'lc1',
        cat: 'fix',
        label: 'Planteamiento del Problema (Cap I): reescribir más específico para el caso Cumbres',
        ref: '5.1',
        note: 'El profesor pregunta: "¿cuál es la situación que dice el tema en la portada?" Responder: Cumbres Data Center S.A. registra la demanda eléctrica cada hora, pero necesita estimar consumo a las 14:30, 07:30 y 22:30 para programar sistemas de enfriamiento y evitar picos tarifarios. Eso es el problema concreto.',
      },
      {
        id: 'lc2',
        cat: 'fix',
        label: 'Reducir párrafos de la Justificación a 4–6 renglones máximo',
        ref: '8.1',
      },
      {
        id: 'lc3',
        cat: 'cap3a',
        label: 'Párrafo introductorio de Cap III (2–3 oraciones que anuncian las subsecciones a, b, c)',
        note: 'Ejemplo de tono: "El presente capítulo desarrolla la resolución del problema planteado en tres etapas: (a) descripción del contexto y los datos de Cumbres Data Center S.A., (b) aplicación paso a paso de los métodos de interpolación y ajuste seleccionados, y (c) interpretación cuantitativa de los resultados obtenidos."',
      },
      {
        id: 'lc4',
        cat: 'cap3a',
        label: 'Cap III.a — Planteamiento del problema: contexto Cumbres, registro horario, objetivo de estimar a intervalos intermedios (14:30, 07:30, 22:30 h)',
        note: 'Incluir: (1) Cumbres opera 24/7, (2) registra potencia cada hora = 24 datos/día, (3) necesita saber carga a las 14:30 para gestionar enfriamiento pico, (4) necesita 07:30 para programar respaldo matutino, (5) necesita 22:30 para bajar carga nocturna. Esas 3 estimaciones son los "valores intermedios no medidos" de los objetivos específicos.',
      },
      {
        id: 'lc5',
        cat: 'cap3a',
        label: 'Tabla 1: Dataset de 24 puntos horarios (dos columnas: Hora h / Potencia kW) con nota APA',
        note: 'Nota al pie: "Nota. Datos sintéticos calibrados con los benchmarks del Uptime Institute Global Data Center Survey 2025. Elaboración propia (2026)." — Valores: 0h=1260, 1h=1250, 2h=1245, 3h=1240, 4h=1240, 5h=1250, 6h=1270, 7h=1300, 8h=1340, 9h=1390, 10h=1430, 11h=1460, 12h=1480, 13h=1500, 14h=1500, 15h=1495, 16h=1490, 17h=1470, 18h=1440, 19h=1400, 20h=1360, 21h=1320, 22h=1290, 23h=1270 kW.',
      },
      {
        id: 'lc6',
        cat: 'cap3a',
        label: 'Figura 1: gráfico de la curva de carga horaria completa (capturar de la app web)',
        note: 'Ir a la sección "Caso Cumbres" en la app → tomar screenshot del gráfico. En el texto ANTES de la figura escribir: "La Figura 1 muestra el perfil horario de demanda eléctrica...". Nota de figura: "Figura 1. Curva de carga horaria de Cumbres Data Center S.A. Las líneas punteadas verticales señalan la carga base (03:00 h, 1 240 kW) y el pico operativo (13:00 h, 1 500 kW). Elaboración propia (2026)."',
      },
    ],
  },
  {
    id: 'esteban',
    initials: 'ER',
    name: 'Esteban Rivera Fallas',
    shortName: 'Esteban',
    role: 'Cap III.b — Interpolación de Newton',
    tasks: [
      {
        id: 'er1',
        cat: 'fix',
        label: 'Agregar fórmula de Newton con diferencias divididas al Cap II, usando editor de ecuaciones Word',
        ref: '31.1',
        note: 'P(x) = f[x₀] + f[x₀,x₁](x−x₀) + f[x₀,x₁,x₂](x−x₀)(x−x₁) + ⋯ + f[x₀,…,xₙ](x−x₀)⋯(x−xₙ₋₁). También agregar la definición de diferencia dividida: f[xᵢ,xⱼ] = (f[xⱼ] − f[xᵢ]) / (xⱼ − xᵢ).',
      },
      {
        id: 'er2',
        cat: 'cap3b',
        label: 'Cap III.b §1 — Descripción del método de Newton (2–3 párrafos: qué es, por qué se usa, cuántos nodos se eligen)',
        note: 'Mencionar que se seleccionan 5 nodos locales alrededor del punto de interés (x=14.5) para evitar el fenómeno de Runge que ocurre con los 24 nodos.',
      },
      {
        id: 'er3',
        cat: 'cap3b',
        label: 'Tabla 3: tabla de diferencias divididas para los 5 nodos x=[12,13,14,15,16], y=[1480,1500,1500,1495,1490]',
        note: 'VALORES PRECALCULADOS: Orden 1: f[12,13]=20, f[13,14]=0, f[14,15]=−5, f[15,16]=−5. Orden 2: f[12,13,14]=−10, f[13,14,15]=−2.5, f[14,15,16]=0. Orden 3: f[12,13,14,15]=2.5, f[13,14,15,16]=0.833. Orden 4: f[12,13,14,15,16]=−0.417.',
      },
      {
        id: 'er4',
        cat: 'cap3b',
        label: 'Construcción del polinomio P(x) con los coeficientes de la diagonal superior de la tabla',
        note: 'P(x) = 1480 + 20(x−12) − 10(x−12)(x−13) + 2.5(x−12)(x−13)(x−14) − 0.417(x−12)(x−13)(x−14)(x−15). Escribir en editor de ecuaciones Word.',
      },
      {
        id: 'er5',
        cat: 'cap3b',
        label: 'Estimación P(14.5): sustitución paso a paso → resultado 1 497.5 kW',
        note: 'Sustitución: (14.5−12)=2.5, (14.5−13)=1.5, (14.5−14)=0.5, (14.5−15)=−0.5. Cálculo: 1480 + 20(2.5) − 10(3.75) + 2.5(1.875) − 0.417(−0.9375) = 1480 + 50 − 37.5 + 4.6875 + 0.3906 ≈ 1 497.5 kW. Interpretar: el operador necesitará 1 497.5 kW a las 14:30.',
      },
      {
        id: 'er6',
        cat: 'cap3b',
        label: 'Estimación P(7.5) para 07:30 h → resultado 1 318.75 kW',
        note: 'Nodos locales: x=[5,6,7,8,9], y=[1250,1270,1300,1340,1390]. Diferencias div. orden 1: 20, 30, 40, 50. Orden 2: 5, 5, 5. Orden 3: 0, 0. Orden 4: 0. Polinomio simplificado: P(x) = 1250 + 20(x−5) + 5(x−5)(x−6). P(7.5) = 1250 + 50 + 18.75 = 1 318.75 kW.',
      },
      {
        id: 'er7',
        cat: 'cap3b',
        label: 'Figura 2: gráfico del polinomio de Newton vs. datos observados (capturar de la app)',
        note: 'Ir a la app → sección "Implementación" → método Newton → ajustar nodos a 5. Screenshot. Pie de figura APA: "Figura 2. Polinomio de Newton (5 nodos locales) superpuesto sobre los 24 datos horarios de Cumbres Data Center S.A. El punto rojo indica la estimación en x = 14.5 h. Elaboración propia (2026)."',
      },
      {
        id: 'er8',
        cat: 'cap3b',
        label: 'Nota sobre el fenómeno de Runge: explicar qué ocurre al intentar usar los 24 nodos',
        note: 'Al usar los 24 puntos equiespaciados el polinomio de grado 23 genera oscilaciones severas en los extremos del intervalo (0–3 h y 20–23 h), con errores de hasta ±800 kW. Carl Runge (1901) demostró este fenómeno. Solución adoptada: interpolación local con 5 nodos. La sección "Pruébalo tú mismo" de la app web ilustra esto en el Paso 5.',
      },
    ],
  },
  {
    id: 'ariatna',
    initials: 'AQ',
    name: 'Ariatna Quirós Rojas',
    shortName: 'Ariatna',
    role: 'Cap III.b — Lagrange + MMC grado 3',
    tasks: [
      {
        id: 'aq1',
        cat: 'fix',
        label: 'Agregar fórmula de Lagrange al Cap II usando editor de ecuaciones Word',
        ref: '31.1',
        note: 'P(x) = Σᵢ₌₀ⁿ yᵢ Lᵢ(x) donde Lᵢ(x) = Πⱼ≠ᵢ (x − xⱼ) / (xᵢ − xⱼ). También agregar la fórmula del sistema normal para MMC: (AᵀA)c = Aᵀy.',
      },
      {
        id: 'aq2',
        cat: 'cap3b',
        label: 'Cap III.b §2 — Interpolación de Lagrange: descripción del método, mismos 5 nodos que Esteban (x=[12..16])',
        note: 'Importante: Lagrange y Newton con los mismos nodos producen el mismo polinomio interpolador (Teorema de Unicidad). El resultado en x=14.5 debe ser idéntico.',
      },
      {
        id: 'aq3',
        cat: 'cap3b',
        label: 'Mostrar los 5 polinomios base L₀, L₁, L₂, L₃, L₄ con Word ecuaciones',
        note: 'L₀(x) = (x−13)(x−14)(x−15)(x−16) / [(12−13)(12−14)(12−15)(12−16)] = (x−13)(x−14)(x−15)(x−16) / 24. L₁(x) = (x−12)(x−14)(x−15)(x−16) / [(13−12)(13−14)(13−15)(13−16)] = (x−12)(x−14)(x−15)(x−16) / (−6). Solo es necesario mostrar L₀ y L₁ completos; los demás pueden resumirse.',
      },
      {
        id: 'aq4',
        cat: 'cap3b',
        label: 'Calcular P(14.5) con Lagrange → verificar que coincide con Newton (diferencia < 10⁻⁹)',
        note: 'El resultado debe ser ≈ 1 497.5 kW. Escribir: "La diferencia |P_Newton(14.5) − P_Lagrange(14.5)| < 10⁻⁹ confirma el Teorema de Unicidad del polinomio interpolador: para un conjunto de n+1 puntos distintos existe un único polinomio de grado ≤ n que pasa por todos ellos."',
      },
      {
        id: 'aq5',
        cat: 'cap3b',
        label: 'Cap III.b §3 — Mínimos Cuadrados grado 3: planteamiento del sistema normal 4×4 (AᵀA·c = Aᵀy)',
        note: 'La matriz A es de 24×4 (columnas: 1, x, x², x³). El sistema normal AᵀA es 4×4. Mostrar el sistema aumentado en notación matricial en Word.',
      },
      {
        id: 'aq6',
        cat: 'cap3b',
        label: 'Mostrar los pasos de eliminación de Gauss con pivoteo parcial para el sistema 4×4',
        note: 'Los valores numéricos exactos del sistema están disponibles en la app web: sección "Implementación" → "MMC Grado 3" → expandir detalles del cálculo. Mostrar al menos 2 pasos de eliminación.',
      },
      {
        id: 'aq7',
        cat: 'cap3b',
        label: 'Polinomio P₃(x) resultante con los coeficientes c₀, c₁, c₂, c₃ en editor Word',
        note: 'Obtener c₀, c₁, c₂, c₃ de la app. La forma es P₃(x) = c₀ + c₁x + c₂x² + c₃x³. Sustituir x=14.5 para obtener la estimación de las 14:30.',
      },
      {
        id: 'aq8',
        cat: 'cap3b',
        label: 'Registrar MSE, MAE, MAPE, R² del ajuste MMC grado 3 (obtener de la app)',
        note: 'En la app: sección "Implementación" → tabla comparativa de errores → columna "MMC Grado 3". Anotar los 4 valores para que Diego los incluya en la Tabla 2 de comparativa.',
      },
    ],
  },
  {
    id: 'diego',
    initials: 'DM',
    name: 'Diego Morales Hernández',
    shortName: 'Diego',
    role: 'Cap III.b MMC grado 5 · Cap III.c Análisis de resultados',
    tasks: [
      {
        id: 'dm1',
        cat: 'fix',
        label: 'Agregar fórmula del criterio de mínimos cuadrados al Cap II con editor de ecuaciones Word',
        ref: '31.1',
        note: 'Fórmula: min Σᵢ₌₀²³ [yᵢ − P(xᵢ)]². La ecuación normal se obtiene derivando e igualando a cero: (AᵀA)c = Aᵀy, donde A es la matriz de Vandermonde 24×(m+1) y c es el vector de coeficientes.',
      },
      {
        id: 'dm2',
        cat: 'cap3b',
        label: 'Cap III.b §4 — Mínimos Cuadrados grado 5: planteamiento del sistema normal 6×6',
        note: 'Mismo proceso que Ariatna para grado 3, pero con 6 columnas en A (1, x, x², x³, x⁴, x⁵). El sistema normal AᵀA·c = Aᵀy es 6×6. Mostrar matriz aumentada.',
      },
      {
        id: 'dm3',
        cat: 'cap3b',
        label: 'Pasos de eliminación de Gauss con pivoteo parcial para el sistema 6×6',
        note: 'Valores del sistema en la app: sección "Implementación" → "MMC Grado 5". Mostrar al menos los primeros 2 pasos de eliminación. No es necesario mostrar los 5 pasos completos si la explicación es clara.',
      },
      {
        id: 'dm4',
        cat: 'cap3b',
        label: 'Polinomio P₅(x) con los 6 coeficientes c₀..c₅ en editor Word, más P₅(14.5)',
        note: 'Obtener coeficientes de la app. Comparar P₅(14.5) con P₃(14.5): la diferencia muestra el impacto del mayor grado sobre la estimación puntual.',
      },
      {
        id: 'dm5',
        cat: 'cap3b',
        label: 'Registrar MSE, MAE, MAPE, R² del ajuste MMC grado 5 y comparar R² vs grado 3',
        note: 'R²(grado 5) > R²(grado 3) → mejor ajuste global. Cuantificar la mejora (ej: R²₃=0.974, R²₅=0.998). Valores exactos en la app: tabla comparativa de errores.',
      },
      {
        id: 'dm6',
        cat: 'cap3b',
        label: 'Figura 3: curvas MMC grado 3 y grado 5 superpuestas con los 24 datos (capturar de la app)',
        note: 'App → sección "Implementación" → alternar entre grado 3 y 5. Puede ser dos capturas separadas o una combinada. Pie de figura APA: "Figura 3. Curvas de ajuste por mínimos cuadrados de grado 3 (azul discontinuo) y grado 5 (verde) sobre el perfil horario de demanda eléctrica. Elaboración propia (2026)."',
      },
      {
        id: 'dm7',
        cat: 'cap3b',
        label: 'Tabla 2: comparativa de 4 métodos — columnas: P(14.5), MSE, MAE, MAPE, R²',
        note: 'Filas: (1) Newton 5 nodos, (2) Lagrange 5 nodos, (3) MMC grado 3, (4) MMC grado 5. Todos los valores en la app → sección "Implementación" → tabla de comparativa de errores. Resaltar la fila ganadora (menor MSE / mayor R²). Nota APA debajo.',
      },
      {
        id: 'dm8',
        cat: 'cap3c',
        label: 'Cap III.c — ¿qué significan los valores de MSE, MAE, MAPE y R²? (1 párrafo por métrica)',
        note: 'Interpretar en unidades reales: ej. "Un MAE de 5.2 kW significa que el modelo se equivoca en promedio ±5.2 kW, equivalente al 0.4 % de la carga pico de 1 500 kW." Hacer que los números tengan sentido operativo.',
      },
      {
        id: 'dm9',
        cat: 'cap3c',
        label: 'Cap III.c — ¿cuál método ganó y para qué caso de uso operativo?',
        note: 'MMC grado 5 gana en ajuste global (mejor R², menor MSE sobre los 24 puntos). Newton/Lagrange son preferibles para interpolación puntual local cuando se conocen los vecinos exactos. Conclusión práctica: para el BMS de Cumbres usar MMC grado 5 para predicción por turno; Newton para estimación ad-hoc entre lecturas SCADA.',
      },
      {
        id: 'dm10',
        cat: 'cap3c',
        label: 'Cap III.c — Limitaciones encontradas',
        note: 'Mencionar: (1) Runge con 24 nodos equiespaciados. (2) Datos sintéticos, no medidos en campo. (3) PUE = 1.55 usado como escalar constante (no varía con temperatura ambiental). (4) Modelo válido solo para el perfil diario analizado, puede variar por día de semana o estación.',
      },
      {
        id: 'dm11',
        cat: 'cap3c',
        label: 'Cap III.c — Ventajas de la metodología y aplicaciones futuras',
        note: 'Ventajas: costo computacional mínimo, interpretable, exportable a cualquier sistema BMS, no requiere hardware especializado. Aplicaciones futuras: extender a predicción semanal, integrar con tarifas T-MT para optimización de costo, usar como referencia para calibrar modelos ML.',
      },
    ],
  },
];
