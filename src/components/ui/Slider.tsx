import { useId, type ChangeEvent } from 'react';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  id?: string;
  disabled?: boolean;
  format?: (value: number) => string;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  id,
  disabled = false,
  format,
  className,
}: SliderProps) {
  const autoId = useId();
  const sliderId = id ?? autoId;
  const display = format ? format(value) : String(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) onChange(next);
  };

  const wrapperClasses = [
    'flex w-full flex-col gap-1',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={sliderId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <output
          htmlFor={sliderId}
          className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-800 sm:text-sm"
          aria-live="polite"
        >
          {display}
        </output>
      </div>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={display}
        className={
          'w-full cursor-pointer accent-blue-600 ' +
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
          'focus-visible:ring-offset-2 focus-visible:ring-offset-white ' +
          'disabled:cursor-not-allowed disabled:opacity-50'
        }
      />
    </div>
  );
}

export default Slider;
