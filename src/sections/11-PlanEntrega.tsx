import { SectionAnchor } from '@/components/layout/SectionAnchor';
import { TaskBoard } from '@/components/plan/TaskBoard';

export function PlanEntrega() {
  return (
    <SectionAnchor id="plan" accent="plan">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-plan">
          Avance 2 · Equipo
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Plan de trabajo
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Tareas divididas por integrante — cada una es independiente, sin bloqueos entre personas.
          Las notas incluyen los valores precalculados que necesitás para no esperar a nadie.
        </p>
      </header>

      <TaskBoard />
    </SectionAnchor>
  );
}

export default PlanEntrega;
