import { useId, useRef, type KeyboardEvent } from 'react';
import { useCumbresStore } from '@/state/store';

export interface QuestionProps {
  /** Posición 0-based de la pregunta dentro del cuestionario. */
  index: number;
  /** Enunciado mostrado al usuario. */
  prompt: string;
  /** Opciones a mostrar (típicamente 4). */
  options: string[];
  /** Índice (0-based) de la opción correcta dentro de `options`. */
  correctIndex: number;
}

/**
 * Pregunta de selección única para el quiz de repaso. Implementa un
 * grupo de radios accesible (rol `radiogroup`) con navegación por teclado:
 * flechas ↑/↓/←/→ mueven el foco entre opciones, Espacio/Enter selecciona.
 * Una vez respondida la pregunta, las opciones se resaltan en verde (correcta)
 * o rojo (elegida pero incorrecta) y se muestra una nota de retroalimentación.
 */
export function Question({ index, prompt, options, correctIndex }: QuestionProps) {
  const reactId = useId();
  const groupId = `quiz-q-${index}-${reactId}`;
  const answers = useCumbresStore((s) => s.quizAnswers);
  const answerQuiz = useCumbresStore((s) => s.answerQuiz);

  const chosen = answers[index];
  const answered = typeof chosen === 'number';
  const isCorrect = answered && chosen === correctIndex;

  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusOption = (i: number) => {
    const n = options.length;
    const next = ((i % n) + n) % n;
    const el = optionRefs.current[next];
    if (el) el.focus();
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    i: number,
  ) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        focusOption(i + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        focusOption(i - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusOption(0);
        break;
      case 'End':
        e.preventDefault();
        focusOption(options.length - 1);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (!answered) answerQuiz(index, i);
        break;
      default:
        break;
    }
  };

  const handleClick = (i: number) => {
    if (!answered) answerQuiz(index, i);
  };

  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <legend className="mb-3 px-2 text-sm font-semibold text-slate-900 sm:text-base">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
          {index + 1}
        </span>
        {prompt}
      </legend>

      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-legend`}
        id={groupId}
        className="flex flex-col gap-2"
      >
        {options.map((option, i) => {
          const isChosen = chosen === i;
          const isAnswerCorrect = i === correctIndex;

          let stateClasses =
            'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50';
          if (answered) {
            if (isAnswerCorrect) {
              stateClasses =
                'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500';
            } else if (isChosen) {
              stateClasses =
                'border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500';
            } else {
              stateClasses =
                'border-slate-200 bg-slate-50 text-slate-500';
            }
          }

          // tabIndex semantics for radiogroup: only the active option is in
          // the tab order; if nothing is selected, the first option is.
          const tabIndex = answered
            ? isChosen
              ? 0
              : -1
            : i === 0
              ? 0
              : -1;

          return (
            <button
              key={i}
              ref={(el) => {
                optionRefs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isChosen}
              aria-disabled={answered}
              tabIndex={tabIndex}
              disabled={answered}
              onClick={() => handleClick(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={[
                'flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left text-sm',
                'transition-colors focus:outline-none focus-visible:ring-2',
                'focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                'focus-visible:ring-offset-white',
                'disabled:cursor-not-allowed',
                stateClasses,
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center',
                  'rounded-full border text-[10px] font-bold uppercase',
                  answered && isAnswerCorrect
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : answered && isChosen
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-slate-400 bg-white text-slate-600',
                ].join(' ')}
              >
                {String.fromCharCode(97 + i)}
              </span>
              <span className="flex-1 leading-snug">{option}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <p
          role="status"
          aria-live="polite"
          className={[
            'mt-3 rounded-md px-3 py-2 text-sm font-medium',
            isCorrect
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-red-50 text-red-800',
          ].join(' ')}
        >
          {isCorrect
            ? 'Correcto.'
            : `Incorrecto. La respuesta correcta es la opción ${String.fromCharCode(97 + correctIndex)}.`}
        </p>
      )}
    </fieldset>
  );
}

export default Question;
