import { Quiz } from '@/components/quiz/Quiz';
import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Sección 8 (#quiz): quiz de autoevaluación con cinco preguntas de
 * selección única sobre los métodos numéricos discutidos en el informe
 * y los indicadores energéticos del caso Cumbres Data Center.
 */
export function QuizSection() {
  return (
    <SectionAnchor id="quiz">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Capítulo 8
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Quiz de Repaso
        </h2>
      </header>

      <p className="mb-6 text-base leading-relaxed text-slate-700">
        Cinco preguntas de selección única para verificar la comprensión de los
        métodos numéricos y los indicadores energéticos discutidos en los
        capítulos anteriores. Cada respuesta queda registrada y se evalúa al
        instante; al completar las cinco se muestra el puntaje final con la
        opción de reiniciar.
      </p>

      <Quiz />
    </SectionAnchor>
  );
}

export default QuizSection;
