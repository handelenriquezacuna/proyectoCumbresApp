import { Question } from '@/components/quiz/Question';
import { QuizResult } from '@/components/quiz/QuizResult';
import { useCumbresStore } from '@/state/store';

export interface QuizItem {
  prompt: string;
  options: string[];
  correctIndex: number;
}

/**
 * Banco oficial de preguntas del quiz de repaso del informe Cumbres.
 * Cinco ítems de selección única que cubren los métodos numéricos y
 * los indicadores energéticos discutidos en los capítulos previos.
 */
export const QUIZ_QUESTIONS: ReadonlyArray<QuizItem> = [
  {
    prompt:
      '¿Cuál método permite agregar un nuevo punto sin recalcular el polinomio anterior?',
    options: [
      'Lagrange',
      'Newton (diferencias divididas)',
      'Mínimos cuadrados',
      'Runge',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Para datos con ruido, ¿qué método es preferible?',
    options: [
      'Interpolación de Newton',
      'Interpolación de Lagrange',
      'Mínimos cuadrados',
      'Mapa de Karnaugh',
    ],
    correctIndex: 2,
  },
  {
    prompt: 'El fenómeno de Runge ocurre cuando...',
    options: [
      '...se usan polinomios de grado alto en interpolación equiespaciada.',
      '...se usa MMC en lugar de interpolación.',
      '...los puntos están muy juntos en el centro.',
      '...se usa pivoteo parcial.',
    ],
    correctIndex: 0,
  },
  {
    prompt: 'Si R² = 0.97, significa que...',
    options: [
      'El modelo explica el 3% de la variabilidad.',
      'El modelo explica el 97% de la variabilidad.',
      'El error promedio es 97 kW.',
      'El modelo es perfecto.',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'El PUE de un centro de datos ideal sería...',
    options: ['0', '1', '1.55', '∞'],
    correctIndex: 1,
  },
];

/**
 * Compone las cinco preguntas del quiz y, una vez respondidas todas,
 * muestra el panel de resultado con el puntaje y el botón de reinicio.
 */
export function Quiz() {
  const answers = useCumbresStore((s) => s.quizAnswers);
  const total = QUIZ_QUESTIONS.length;

  let answered = 0;
  let score = 0;
  QUIZ_QUESTIONS.forEach((q, i) => {
    const choice = answers[i];
    if (typeof choice === 'number') {
      answered += 1;
      if (choice === q.correctIndex) score += 1;
    }
  });

  const allAnswered = answered === total;

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-sm text-slate-600"
        aria-live="polite"
        data-testid="quiz-progress"
      >
        Progreso: <span className="font-semibold tabular-nums">{answered}</span>
        {' / '}
        <span className="tabular-nums">{total}</span>
      </p>

      <ol className="flex flex-col gap-4">
        {QUIZ_QUESTIONS.map((q, i) => (
          <li key={i}>
            <Question
              index={i}
              prompt={q.prompt}
              options={[...q.options]}
              correctIndex={q.correctIndex}
            />
          </li>
        ))}
      </ol>

      {allAnswered && <QuizResult score={score} total={total} />}
    </div>
  );
}

export default Quiz;
