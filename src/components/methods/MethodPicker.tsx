import type { ChangeEvent } from 'react';
import { Select, type SelectOption } from '@/components/ui/Select';
import { useCumbresStore } from '@/state/store';
import type { Method } from '@/lib/methods/types';

const OPTIONS: ReadonlyArray<SelectOption> = [
  { value: 'newton', label: 'Newton (interpolación)' },
  { value: 'lagrange', label: 'Lagrange (interpolación)' },
  { value: 'ls3', label: 'Mínimos cuadrados — grado 3' },
  { value: 'ls5', label: 'Mínimos cuadrados — grado 5' },
];

/**
 * Select controlado para elegir el método numérico activo. Empata con
 * `activeMethod` en el store de zustand y, al cambiar a ls3 o ls5,
 * sincroniza también el grado por defecto del polinomio.
 */
export function MethodPicker() {
  const activeMethod = useCumbresStore((s) => s.activeMethod);
  const setMethod = useCumbresStore((s) => s.setMethod);
  const setDegree = useCumbresStore((s) => s.setDegree);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const next = e.target.value as Method;
    setMethod(next);
    if (next === 'ls3') setDegree(3);
    else if (next === 'ls5') setDegree(5);
  };

  return (
    <Select
      label="Método numérico"
      options={OPTIONS}
      value={activeMethod}
      onChange={handleChange}
    />
  );
}

export default MethodPicker;
