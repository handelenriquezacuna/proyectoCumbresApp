import { useId, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: ReadonlyArray<SelectOption>;
  id?: string;
}

export function Select({
  label,
  options,
  id,
  className,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const classes = [
    'block w-full rounded-md border border-slate-300 bg-white px-3 py-2',
    'text-sm text-slate-900 shadow-sm',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex w-full flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <select id={selectId} className={classes} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
