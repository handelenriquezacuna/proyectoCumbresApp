import { SectionAnchor } from '@/components/layout/SectionAnchor';
import { Walkthrough } from '@/components/walkthrough/Walkthrough';

/**
 * Sección 9 (#prueba): recorrido guiado paso-a-paso que reproduce el
 * razonamiento del proyecto académico — el operador de Cumbres tiene 24
 * mediciones horarias y necesita estimar valores intermedios. Cada paso
 * presenta una técnica con un widget interactivo y cierra con una
 * recomendación operativa que lleva al quiz.
 */
export function WalkthroughSection() {
  return (
    <SectionAnchor id="prueba" accent="implementacion">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-implementacion">
          Recorrido guiado
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Pruébalo tú mismo
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-700">
          Reproducí el razonamiento del proyecto en 9 pasos: desde el problema
          que enfrenta el operador de turno hasta la recomendación de método
          según el caso de uso.
        </p>
      </header>

      <Walkthrough />
    </SectionAnchor>
  );
}

export default WalkthroughSection;
