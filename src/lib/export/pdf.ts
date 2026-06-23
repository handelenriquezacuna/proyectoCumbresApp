import pdfMake from 'pdfmake/build/pdfmake';
// `pdfmake/build/vfs_fonts` registra los TTF de Roboto (Regular / Italic /
// Bold / BoldItalic) en `pdfMake.vfs`. El módulo se distribuye como bundle
// CommonJS sin declaraciones de tipo propias; los tipos públicos del paquete
// `@types/pdfmake` cubren su forma `Record<string, string>` cuando se importa
// como `import vfs from 'pdfmake/build/vfs_fonts'`.
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type {
  Content,
  TCreatedPdf,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';

import { CUMBRES_POINTS, DATASET_METADATA } from '@/lib/data/cumbresDataset';
import type { FitResult, Method } from '@/lib/methods/types';
import { formatNumber } from '@/lib/format';

// El bundle de browser exporta `vfs` como default o como propiedad; cubrimos
// ambos cánones para no romper en builds futuros.
type PdfMakeWithVfs = typeof pdfMake & {
  vfs?: Record<string, string>;
  addVirtualFileSystem?: (vfs: Record<string, string>) => void;
};

const pdfMakeRef = pdfMake as PdfMakeWithVfs;
const fontsRef = pdfFonts as
  | Record<string, string>
  | { vfs?: Record<string, string>; pdfMake?: { vfs?: Record<string, string> } };

function extractVfs(): Record<string, string> | undefined {
  if (!fontsRef) return undefined;
  // Forma actual (>=0.2.x): exporta directamente el objeto vfs.
  if (
    typeof fontsRef === 'object' &&
    !('vfs' in fontsRef) &&
    !('pdfMake' in fontsRef)
  ) {
    return fontsRef as Record<string, string>;
  }
  // Formas legadas: pdfMake.vfs o vfs anidado.
  const candidate = fontsRef as {
    vfs?: Record<string, string>;
    pdfMake?: { vfs?: Record<string, string> };
  };
  return candidate.vfs ?? candidate.pdfMake?.vfs;
}

const resolvedVfs = extractVfs();
if (resolvedVfs) {
  if (typeof pdfMakeRef.addVirtualFileSystem === 'function') {
    pdfMakeRef.addVirtualFileSystem(resolvedVfs);
  } else {
    pdfMakeRef.vfs = resolvedVfs;
  }
}

const METHOD_LABELS: Record<Method, string> = {
  newton: 'Newton (interpolación)',
  lagrange: 'Lagrange (interpolación)',
  ls3: 'Mínimos cuadrados — grado 3',
  ls5: 'Mínimos cuadrados — grado 5',
};

/**
 * Adapta el LaTeX de un polinomio al texto plano que pdfmake puede renderizar
 * sin un parser TeX. Sustituye exponentes `x^{n}` por `x^n`, elimina llaves
 * triviales y reemplaza el separador de espacios duros LaTeX.
 */
function latexToPlainPolynomial(latex: string): string {
  return latex
    .replace(/\\,/g, ' ')
    .replace(/\\cdot/g, '·')
    .replace(/\\;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/x\^\{([^}]+)\}/g, (_m, exp) => `x^${exp}`)
    .replace(/\{([^{}]+)\}/g, '$1')
    .trim();
}

function datasetRows(): Content {
  const header = [
    { text: 'Hora', style: 'th' },
    { text: 'Demanda (kW)', style: 'th' },
  ];
  const body: Array<Array<{ text: string; style: string }>> = [header];
  for (const p of CUMBRES_POINTS) {
    body.push([
      { text: String(p.x), style: 'td' },
      { text: formatNumber(p.y, 0), style: 'td' },
    ]);
  }
  return {
    table: {
      headerRows: 1,
      widths: [60, 100],
      body,
    },
    layout: 'lightHorizontalLines',
    margin: [0, 4, 0, 12],
  };
}

function metricsTable(metrics: FitResult['metrics']): Content {
  return {
    table: {
      headerRows: 1,
      widths: ['*', '*', '*', '*'],
      body: [
        [
          { text: 'MSE', style: 'th' },
          { text: 'MAE', style: 'th' },
          { text: 'MAPE', style: 'th' },
          { text: 'R²', style: 'th' },
        ],
        [
          { text: formatNumber(metrics.mse, 2), style: 'tdNum' },
          { text: formatNumber(metrics.mae, 2), style: 'tdNum' },
          { text: `${formatNumber(metrics.mape, 2)} %`, style: 'tdNum' },
          { text: formatNumber(metrics.r2, 4), style: 'tdNum' },
        ],
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 4, 0, 12],
  };
}

export type BuildCumbresReportOptions = {
  activeMethod: Method;
  metrics: FitResult['metrics'];
  /** LaTeX del polinomio ajustado (P(x) = ...). Se serializa a texto plano. */
  polynomialLatex: string;
  /** Opcional: gráfica del playground en formato data URL (image/png). */
  chartPngDataUrl?: string;
};

/**
 * Construye el reporte PDF del caso Cumbres. La estructura es:
 *  1. Encabezado institucional (universidad + curso)
 *  2. Tabla del dataset (24 filas)
 *  3. Bloque "Método activo" (etiqueta + ecuación textual)
 *  4. Imagen del playground (si se proporciona)
 *  5. Métricas en grid 4x1
 *  6. Conclusión narrativa
 */
export function buildCumbresReport(
  opts: BuildCumbresReportOptions,
): TCreatedPdf {
  const methodLabel = METHOD_LABELS[opts.activeMethod];
  const plainPoly = latexToPlainPolynomial(opts.polynomialLatex);
  const today = new Date().toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

  const content: Content = [
    {
      text: 'Cumbres — Reporte de Predicción',
      style: 'h1',
    },
    {
      text: 'MA-108 Métodos Numéricos · Universidad Fidélitas',
      style: 'subtitle',
    },
    {
      text: `Caso ${DATASET_METADATA.company} · ${DATASET_METADATA.location} · PUE ${formatNumber(
        DATASET_METADATA.pue,
        2,
      )} · Generado ${today}`,
      style: 'meta',
    },
    { text: 'Dataset horario (24 puntos)', style: 'h2' },
    {
      text: `Día tipo: ${DATASET_METADATA.dayType}. Valle ${DATASET_METADATA.valleyKw} kW, pico ${DATASET_METADATA.pickKw} kW. Calibrado con Uptime Institute (2024) y ASHRAE Thermal Guidelines 5.ª ed. (2021).`,
      style: 'p',
    },
    datasetRows(),
    { text: 'Método activo', style: 'h2' },
    {
      text: methodLabel,
      style: 'p',
      bold: true,
    },
    {
      text: 'Polinomio ajustado:',
      style: 'p',
    },
    {
      text: `P(x) = ${plainPoly}`,
      style: 'equation',
    },
  ];

  if (opts.chartPngDataUrl) {
    content.push({
      text: 'Curva ajustada vs. observaciones',
      style: 'h2',
    });
    content.push({
      image: opts.chartPngDataUrl,
      width: 480,
      margin: [0, 4, 0, 12],
    });
  }

  content.push({ text: 'Métricas de error', style: 'h2' });
  content.push(metricsTable(opts.metrics));

  content.push({ text: 'Conclusión', style: 'h2' });
  content.push({
    text:
      `Para el perfil del ${DATASET_METADATA.dayType} del Cumbres Data Center, el método ${methodLabel} ` +
      `produce un ajuste con MAPE = ${formatNumber(opts.metrics.mape, 2)} % y R² = ${formatNumber(opts.metrics.r2, 4)}. ` +
      'Los métodos de interpolación de alto grado tienden a sufrir oscilaciones de Runge (Chapra & Canale, 2015), ' +
      'mientras que los mínimos cuadrados de grado moderado ofrecen un compromiso adecuado entre fidelidad y ' +
      'robustez para tareas de pronóstico horario (Hong & Fan, 2016; Suganthi & Samuel, 2012). El criterio operativo ' +
      'recomendado por Uptime Institute (2024) prioriza modelos que reduzcan el MAPE sin sacrificar generalización.',
    style: 'p',
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [50, 56, 50, 56],
    info: {
      title: 'Cumbres — Reporte de Predicción',
      author: 'Universidad Fidélitas · MA-108 Métodos Numéricos',
      subject: `Caso Cumbres Data Center · ${methodLabel}`,
    },
    content,
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      color: '#1f2937',
    },
    styles: {
      h1: {
        fontSize: 18,
        bold: true,
        color: '#0f172a',
        margin: [0, 0, 0, 2],
      },
      h2: {
        fontSize: 13,
        bold: true,
        color: '#0f172a',
        margin: [0, 14, 0, 4],
      },
      subtitle: {
        fontSize: 11,
        italics: true,
        color: '#475569',
        margin: [0, 0, 0, 2],
      },
      meta: {
        fontSize: 9,
        color: '#64748b',
        margin: [0, 0, 0, 8],
      },
      p: {
        fontSize: 10,
        margin: [0, 0, 0, 6],
        alignment: 'justify',
      },
      th: {
        bold: true,
        fontSize: 10,
        fillColor: '#f1f5f9',
        color: '#0f172a',
      },
      td: {
        fontSize: 9,
      },
      tdNum: {
        fontSize: 11,
        bold: true,
        alignment: 'center',
        color: '#0f172a',
      },
      equation: {
        fontSize: 10,
        italics: true,
        margin: [0, 2, 0, 10],
        color: '#1e293b',
      },
    },
    footer: (currentPage: number, pageCount: number): Content => ({
      text: `Cumbres Data Center · Página ${currentPage} de ${pageCount}`,
      alignment: 'center',
      fontSize: 9,
      color: '#94a3b8',
      margin: [0, 16, 0, 0],
    }),
  };

  return pdfMakeRef.createPdf(docDefinition);
}

/**
 * Construye y descarga el reporte PDF. Devuelve una promesa que se resuelve
 * cuando pdfmake termina de generar el binario.
 */
export async function downloadCumbresPdf(
  opts: BuildCumbresReportOptions,
): Promise<void> {
  const pdf = buildCumbresReport(opts);
  await pdf.download('cumbres-reporte.pdf');
}
