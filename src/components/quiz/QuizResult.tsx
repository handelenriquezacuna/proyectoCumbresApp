import { Button } from '@/components/ui/Button';
import { useCumbresStore } from '@/state/store';

export interface QuizResultProps {
  /** Cantidad de respuestas correctas obtenidas por la usuaria. */
  score: number;
  /** Cantidad total de preguntas del cuestionario. */
  total: number;
}

/**
 * Panel resumen del quiz. Muestra el puntaje en formato "X / N",
 * un mensaje cualitativo según el desempeño y un botón para reiniciar
 * (limpia las respuestas en el store de Zustand).
 */
export function QuizResult({ score, total }: QuizResultProps) {
  const resetQuiz = useCumbresStore((s) => s.resetQuiz);
  const ratio = total > 0 ? score / total : 0;

  let band: { label: string; tone: string } = {
    label: 'Sigue repasando los métodos antes de avanzar.',
    tone: 'bg-red-50 text-red-800 border-red-200',
  };
  if (ratio >= 0.8) {
    band = {
      label: 'Excelente: dominas los conceptos clave del informe.',
      tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  } else if (ratio >= 0.6) {
    band = {
      label: 'Buen desempeño. Repasa los puntos que fallaste.',
      tone: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  return (
    <section
      role="region"
      aria-label="Resultado del quiz"
      className={[
        'rounded-lg border p-4 shadow-sm sm:p-6',
        band.tone,
      ].join(' ')}
    >
      <h3 className="text-base font-semibold sm:text-lg">Resultado</h3>
      <p className="mt-2 text-3xl font-bold tabular-nums">
        <span data-testid="quiz-score">{score}</span>
        <span className="text-slate-500"> / {total}</span>
      </p>
      <p className="mt-2 text-sm leading-relaxed sm:text-base">{band.label}</p>

      <div className="mt-4">
        <Button variant="ghost" onClick={resetQuiz} aria-label="Reiniciar quiz">
          Reiniciar quiz
        </Button>
      </div>
    </section>
  );
}

export default QuizResult;
