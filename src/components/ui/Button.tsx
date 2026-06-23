import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ' +
  'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-white ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 ' +
    'disabled:hover:bg-blue-600',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 ' +
    'border border-slate-300 disabled:hover:bg-transparent',
};

export function Button({
  variant = 'primary',
  className,
  type,
  children,
  ...rest
}: ButtonProps) {
  const classes = [BASE, VARIANTS[variant], className ?? ''].filter(Boolean).join(' ');
  return (
    <button type={type ?? 'button'} className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
