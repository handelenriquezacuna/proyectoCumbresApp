import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Quiz, QUIZ_QUESTIONS } from '@/components/quiz/Quiz';
import { Question } from '@/components/quiz/Question';
import { useCumbresStore } from '@/state/store';

function resetStore() {
  useCumbresStore.getState().resetQuiz();
}

afterEach(() => {
  resetStore();
});

function getRadios(container?: HTMLElement): HTMLElement[] {
  if (container) {
    return within(container).getAllByRole('radio');
  }
  return screen.getAllByRole('radio');
}

describe('Question', () => {
  it('renders an accessible radiogroup with the provided options', () => {
    render(
      <Question
        index={0}
        prompt="¿Pregunta?"
        options={['uno', 'dos', 'tres']}
        correctIndex={1}
      />,
    );

    const group = screen.getByRole('radiogroup');
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    for (const r of radios) {
      expect(r).toHaveAttribute('aria-checked', 'false');
    }
  });

  it('marks the chosen option correct in green and shows feedback', () => {
    render(
      <Question
        index={0}
        prompt="¿Pregunta?"
        options={['uno', 'dos', 'tres']}
        correctIndex={1}
      />,
    );

    const radios = getRadios();
    const chosen = radios[1]!;
    fireEvent.click(chosen);

    expect(chosen).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('status').textContent).toMatch(/correcto/i);
    expect(chosen.className).toMatch(/emerald/);
  });

  it('shows the correct answer when the user picks the wrong one', () => {
    render(
      <Question
        index={0}
        prompt="¿Pregunta?"
        options={['uno', 'dos', 'tres']}
        correctIndex={1}
      />,
    );

    const radios = getRadios();
    const wrong = radios[2]!;
    const correct = radios[1]!;
    fireEvent.click(wrong);

    expect(wrong).toHaveAttribute('aria-checked', 'true');
    expect(wrong.className).toMatch(/red/);
    expect(correct.className).toMatch(/emerald/);
    expect(screen.getByRole('status').textContent).toMatch(/incorrecto/i);
  });

  it('locks further selections once the question has been answered', () => {
    render(
      <Question
        index={0}
        prompt="¿Pregunta?"
        options={['uno', 'dos']}
        correctIndex={0}
      />,
    );

    const radios = getRadios();
    const first = radios[0]!;
    const second = radios[1]!;
    fireEvent.click(first);
    fireEvent.click(second);

    expect(first).toHaveAttribute('aria-checked', 'true');
    expect(second).toHaveAttribute('aria-checked', 'false');
  });

  it('supports arrow-key navigation between options', () => {
    render(
      <Question
        index={0}
        prompt="¿Pregunta?"
        options={['uno', 'dos', 'tres']}
        correctIndex={0}
      />,
    );

    const radios = getRadios();
    const first = radios[0] as HTMLButtonElement;
    const second = radios[1]!;
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(second);

    fireEvent.keyDown(second, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(first);
  });
});

describe('Quiz', () => {
  it('exposes exactly five questions in the expected order', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(5);
    expect(QUIZ_QUESTIONS[0]!.correctIndex).toBe(1);
    expect(QUIZ_QUESTIONS[1]!.correctIndex).toBe(2);
    expect(QUIZ_QUESTIONS[2]!.correctIndex).toBe(0);
    expect(QUIZ_QUESTIONS[3]!.correctIndex).toBe(1);
    expect(QUIZ_QUESTIONS[4]!.correctIndex).toBe(1);
  });

  it('does not show the result panel until every question is answered', () => {
    render(<Quiz />);
    expect(screen.queryByRole('region', { name: /resultado/i })).toBeNull();

    const groups = screen.getAllByRole('radiogroup');
    for (let i = 0; i < 4; i++) {
      const radios = getRadios(groups[i]!);
      fireEvent.click(radios[QUIZ_QUESTIONS[i]!.correctIndex]!);
    }
    expect(screen.queryByRole('region', { name: /resultado/i })).toBeNull();
  });

  it('renders the score panel with the perfect score once all are answered correctly', () => {
    render(<Quiz />);
    const groups = screen.getAllByRole('radiogroup');
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const radios = getRadios(groups[i]!);
      fireEvent.click(radios[QUIZ_QUESTIONS[i]!.correctIndex]!);
    }

    const result = screen.getByRole('region', { name: /resultado/i });
    expect(within(result).getByTestId('quiz-score').textContent).toBe('5');
    expect(result.textContent).toMatch(/5\s*\/\s*5/);
  });

  it('reports a lower score when some answers are wrong', () => {
    render(<Quiz />);
    const groups = screen.getAllByRole('radiogroup');
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const radios = getRadios(groups[i]!);
      const correct = QUIZ_QUESTIONS[i]!.correctIndex;
      const choice = i < 3 ? correct : (correct + 1) % radios.length;
      fireEvent.click(radios[choice]!);
    }

    const result = screen.getByRole('region', { name: /resultado/i });
    expect(within(result).getByTestId('quiz-score').textContent).toBe('3');
  });

  it('clears the answers when the reset button is pressed', () => {
    render(<Quiz />);
    const groups = screen.getAllByRole('radiogroup');
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const radios = getRadios(groups[i]!);
      fireEvent.click(radios[QUIZ_QUESTIONS[i]!.correctIndex]!);
    }

    expect(screen.getByRole('region', { name: /resultado/i })).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reiniciar quiz/i });
    fireEvent.click(resetBtn);

    expect(screen.queryByRole('region', { name: /resultado/i })).toBeNull();
    expect(useCumbresStore.getState().quizAnswers).toEqual({});

    const radios = getRadios();
    for (const r of radios) {
      expect(r).toHaveAttribute('aria-checked', 'false');
    }
  });
});
