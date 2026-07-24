import type { ReactNode } from 'react';

export interface StoryBridgeProps {
  /** id (sin "#") de la sección destino, p. ej. "metodos". */
  to: string;
  /** Etiqueta visible de la sección destino, p. ej. "Métodos". */
  label: string;
  /** Frase narrativa corta que conecta la sección anterior con la siguiente. */
  children: ReactNode;
}

/**
 * Conector narrativo entre secciones. Muestra una frase corta centrada y un
 * enlace "Siguiente: …" que ancla a la sección que viene. Es deliberadamente
 * sutil (texto pequeño, tonos slate, borde superior tenue) para guiar la
 * lectura sin competir con el contenido de las secciones.
 */
export function StoryBridge({ to, label, children }: StoryBridgeProps) {
  return (
    <div className="border-t border-slate-200 py-6 text-center">
      <p className="mx-auto max-w-2xl px-4 text-sm text-slate-500">
        {children}{' '}
        <a
          href={`#${to}`}
          className="whitespace-nowrap font-medium text-slate-700 underline-offset-4 transition-colors hover:text-slate-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Siguiente: {label} <span aria-hidden="true">↓</span>
        </a>
      </p>
    </div>
  );
}

export default StoryBridge;
