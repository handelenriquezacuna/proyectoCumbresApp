import { Slider } from '@/components/ui/Slider';
import { useCumbresStore } from '@/state/store';

/**
 * Slider de grado polinomial (1..5) que solo se muestra cuando el método
 * activo es de mínimos cuadrados (ls3 o ls5). Permite al usuario sobrescribir
 * el grado por defecto que asigna el MethodPicker.
 */
export function DegreeSlider() {
  const activeMethod = useCumbresStore((s) => s.activeMethod);
  const polynomialDegree = useCumbresStore((s) => s.polynomialDegree);
  const setDegree = useCumbresStore((s) => s.setDegree);

  if (activeMethod !== 'ls3' && activeMethod !== 'ls5') return null;

  return (
    <Slider
      label="Grado del polinomio"
      min={1}
      max={5}
      step={1}
      value={polynomialDegree}
      onChange={setDegree}
      format={(v) => `n = ${v}`}
    />
  );
}

export default DegreeSlider;
