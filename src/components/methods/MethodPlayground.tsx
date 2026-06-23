import { DegreeSlider } from '@/components/methods/DegreeSlider';
import { FitSummary } from '@/components/methods/FitSummary';
import { InterpolationChart } from '@/components/methods/InterpolationChart';
import { MethodPicker } from '@/components/methods/MethodPicker';

/**
 * Playground interactivo: combina el picker de método, el slider de grado,
 * la gráfica de interpolación y el resumen del ajuste. Todos los hijos leen
 * directamente del store de zustand, por lo que las actualizaciones se
 * propagan sin necesidad de prop drilling y los cálculos se memorizan
 * dentro de cada componente con useMemo.
 */
export function MethodPlayground() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MethodPicker />
        <DegreeSlider />
      </div>
      <InterpolationChart />
      <FitSummary />
    </div>
  );
}

export default MethodPlayground;
