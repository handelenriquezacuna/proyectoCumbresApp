import type { HTMLAttributes, ReactNode } from 'react';

export type CumbresAccent =
  | 'conceptos'
  | 'metodos'
  | 'aplicaciones'
  | 'caso'
  | 'implementacion'
  | 'futuro'
  | 'conclusiones';

const ACCENT_BORDER: Record<CumbresAccent, string> = {
  conceptos: 'border-l-cumbres-conceptos',
  metodos: 'border-l-cumbres-metodos',
  aplicaciones: 'border-l-cumbres-aplicaciones',
  caso: 'border-l-cumbres-caso',
  implementacion: 'border-l-cumbres-implementacion',
  futuro: 'border-l-cumbres-futuro',
  conclusiones: 'border-l-cumbres-conclusiones',
};

export interface SectionAnchorProps
  extends Omit<HTMLAttributes<HTMLElement>, 'id'> {
  id: string;
  accent?: CumbresAccent;
  children: ReactNode;
}

export function SectionAnchor({
  id,
  accent,
  className,
  children,
  ...rest
}: SectionAnchorProps) {
  const accentClass = accent ? `${ACCENT_BORDER[accent]} border-l-4 pl-4` : '';
  const classes = [
    'scroll-mt-24 py-8 sm:py-10',
    accentClass,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={classes} {...rest}>
      {children}
    </section>
  );
}

export default SectionAnchor;
