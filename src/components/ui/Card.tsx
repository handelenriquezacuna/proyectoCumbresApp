import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
}

export function Card({
  title,
  children,
  className,
  ...rest
}: CardProps) {
  const classes = [
    'rounded-lg border border-slate-200 bg-white shadow-sm',
    'p-4 sm:p-6',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {title !== undefined && (
        <h3 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg">
          {title}
        </h3>
      )}
      <div className="text-sm text-slate-700 sm:text-base">{children}</div>
    </div>
  );
}

export default Card;
