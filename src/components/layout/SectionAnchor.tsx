import type { HTMLAttributes, ReactNode } from 'react';

export type CumbresAccent =
  | 'conceptos'
  | 'metodos'
  | 'aplicaciones'
  | 'caso'
  | 'implementacion'
  | 'futuro'
  | 'conclusiones'
  | 'plan'
  | 'hoja';

const ACCENT_BORDER: Record<CumbresAccent, string> = {
  conceptos: 'border-l-cumbres-conceptos',
  metodos: 'border-l-cumbres-metodos',
  aplicaciones: 'border-l-cumbres-aplicaciones',
  caso: 'border-l-cumbres-caso',
  implementacion: 'border-l-cumbres-implementacion',
  futuro: 'border-l-cumbres-futuro',
  conclusiones: 'border-l-cumbres-conclusiones',
  plan: 'border-l-cumbres-plan',
  hoja: 'border-l-cumbres-hoja',
};

export interface SectionAnchorProps
  extends Omit<HTMLAttributes<HTMLElement>, 'id'> {
  id: string;
  accent?: CumbresAccent;
  /**
   * Si true, el contenido interno usa `content-visibility: auto` (clase
   * `.cv-auto`) para diferir su render mientras la sección está lejos del
   * viewport. La clase se aplica a un div interno — no al `<section id=…>` —
   * para que el IntersectionObserver del TOC y los anclajes sigan observando
   * una caja normal. Pensado para secciones bajo el fold (capítulos 2+ y
   * anexo).
   */
  deferOffscreen?: boolean;
  children: ReactNode;
}

export function SectionAnchor({
  id,
  accent,
  className,
  deferOffscreen = false,
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
      {deferOffscreen ? <div className="cv-auto">{children}</div> : children}
    </section>
  );
}

export default SectionAnchor;
