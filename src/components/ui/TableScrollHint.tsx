/**
 * Aviso visual, solo para pantallas pequeñas, de que la tabla adyacente se
 * desplaza horizontalmente. Es una pista puramente visual (el contenedor con
 * overflow ya es alcanzable y desplazable), por lo que se oculta de los
 * lectores de pantalla con aria-hidden.
 */
export function TableScrollHint({ className }: { className?: string }) {
  return (
    <p
      aria-hidden="true"
      className={['mb-1 text-xs italic text-slate-500 sm:hidden', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      Desliza horizontalmente para ver toda la tabla →
    </p>
  );
}

export default TableScrollHint;
