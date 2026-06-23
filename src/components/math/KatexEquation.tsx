import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export interface KatexEquationProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Renders a LaTeX expression using react-katex. Defaults to block (display)
 * mode for use in lecture/notebook layouts; set `displayMode={false}` for
 * inline math.
 */
export function KatexEquation({
  latex,
  displayMode = true,
  className,
  ariaLabel,
}: KatexEquationProps) {
  const classes = [
    displayMode ? 'overflow-x-auto py-1' : 'inline-block',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-label={ariaLabel} role="math">
      {displayMode ? <BlockMath math={latex} /> : <InlineMath math={latex} />}
    </div>
  );
}

export default KatexEquation;
