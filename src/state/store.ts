import { create } from 'zustand';
import type { Method } from '@/lib/methods/types';

type State = {
  /** Método numérico activo en la vista comparativa. */
  activeMethod: Method;
  /** Grado del polinomio para mínimos cuadrados (1..5; aplica a ls3/ls5). */
  polynomialDegree: number;
  /** Hora consultada por la usuaria (0..23, decimales permitidos). */
  sampleX: number;
  /** Respuestas del quiz: índice de pregunta → índice de opción elegida. */
  quizAnswers: Record<number, number>;
  setMethod: (m: Method) => void;
  setDegree: (d: number) => void;
  setSampleX: (x: number) => void;
  answerQuiz: (q: number, c: number) => void;
  resetQuiz: () => void;
};

export const useCumbresStore = create<State>((set) => ({
  activeMethod: 'ls3',
  polynomialDegree: 3,
  sampleX: 14.5,
  quizAnswers: {},
  setMethod: (m) => set({ activeMethod: m }),
  setDegree: (d) => set({ polynomialDegree: d }),
  setSampleX: (x) => set({ sampleX: x }),
  answerQuiz: (q, c) =>
    set((state) => ({ quizAnswers: { ...state.quizAnswers, [q]: c } })),
  resetQuiz: () => set({ quizAnswers: {} }),
}));
