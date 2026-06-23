import { useEffect, useRef } from 'react';
import katex from 'katex';
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
 * Hook que renderiza una expresión LaTeX a un nodo DOM via katex.render directo
 * (sin react-katex). Esto evita problemas con dangerouslySetInnerHTML y permite
 * que las clases CSS de KaTeX se apliquen sin interferencia.
 */
function useKatex(latex: string, displayMode: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        displayMode,
        throwOnError: false,
        errorColor: '#dc2626',
        strict: 'ignore',
        output: 'html',
      });
    } catch (err) {
      if (ref.current) {
        ref.current.textContent = latex;
      }
      // eslint-disable-next-line no-console
      console.error('[KatexEquation] render error', err);
    }
  }, [latex, displayMode]);
  return ref;
}

/**
 * Renderiza una expresión LaTeX en bloque con estilo de card (borde izquierdo
 * de color por sección + fondo suave + caption opcional). Para math en línea,
 * usar `InlineKatex` o pasar `displayMode={false}`.
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
  const ref = useKatex(latex, displayMode);

  if (!displayMode) {
    return <span ref={ref} className={className} aria-label={ariaLabel} role="math" />;
  }

  if (bare) {
    return (
      <div
        className={['overflow-x-auto py-1', className ?? ''].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
        role="math"
      >
        <span ref={ref} />
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
        <span ref={ref} />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-xs italic text-slate-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Math en línea para usar dentro de párrafos. Es una conveniencia equivalente
 * a `<KatexEquation latex="..." displayMode={false} />`.
 */
export function InlineKatex({ latex, className }: { latex: string; className?: string }) {
  const ref = useKatex(latex, false);
  return <span ref={ref} className={className} role="math" />;
}

export default KatexEquation;
