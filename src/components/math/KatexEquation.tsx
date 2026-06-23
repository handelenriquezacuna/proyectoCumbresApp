import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export type CumbresAccent =
  | 'conceptos'
  | 'metodos'
  | 'aplicaciones'
  | 'caso'
  | 'implementacion'
  | 'futuro'
  | 'conclusiones';

export interface KatexEquationProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  ariaLabel?: string;
  /** Caption opcional debajo de la ecuación (rol explicativo). */
  caption?: string;
  /** Color de acento del borde izquierdo (palette cumbres). */
  accent?: CumbresAccent;
  /** Si true, no aplica el card stylizado. Útil dentro de FitSummary u otros contenedores. */
  bare?: boolean;
}

const ACCENT_BORDER: Record<CumbresAccent, string> = {
  conceptos: 'border-cumbres-conceptos',
  metodos: 'border-cumbres-metodos',
  aplicaciones: 'border-cumbres-aplicaciones',
  caso: 'border-cumbres-caso',
  implementacion: 'border-cumbres-implementacion',
  futuro: 'border-cumbres-futuro',
  conclusiones: 'border-cumbres-conclusiones',
};

/**
 * Renderiza una expresión LaTeX vía react-katex con un estilo de card:
 * fondo suave, borde izquierdo coloreado (palette cumbres), centrado y
 * con scroll horizontal en mobile para ecuaciones largas. Cuando se
 * necesita math en línea con el texto, usar `<InlineMath />` directamente
 * o pasar `displayMode={false}`.
 */
export function KatexEquation({
  latex,
  displayMode = true,
  className,
  ariaLabel,
  caption,
  accent,
  bare = false,
}: KatexEquationProps) {
  if (!displayMode) {
    return (
      <span className={className} aria-label={ariaLabel} role="math">
        <InlineMath math={latex} />
      </span>
    );
  }

  if (bare) {
    return (
      <div
        className={['overflow-x-auto py-1', className ?? ''].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
        role="math"
      >
        <BlockMath math={latex} />
      </div>
    );
  }

  const borderClass = accent ? ACCENT_BORDER[accent] : 'border-slate-300';
  const wrapper = [
    'my-4 rounded-md border-l-4 bg-slate-50/80 px-4 py-3 shadow-sm',
    borderClass,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={wrapper} aria-label={ariaLabel} role="math">
      <div className="overflow-x-auto">
        <BlockMath math={latex} />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-xs italic text-slate-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default KatexEquation;
