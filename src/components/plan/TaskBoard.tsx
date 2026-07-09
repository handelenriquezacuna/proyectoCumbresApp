import { useState, useEffect, useCallback } from 'react';
import {
  MEMBERS,
  DEADLINE,
  CAT_LABEL,
  CAT_BADGE,
  type PlanTask,
  type TaskCat,
} from './planData';

const STORAGE_KEY = 'cumbres-plan-done-v1';

function loadDone(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set<string>(parsed as string[]);
  } catch {
    return new Set<string>();
  }
}

function saveDone(done: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  } catch {
    // ignore storage errors
  }
}

function getDaysLeft(): number {
  const diff = DEADLINE.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const MEMBER_AVATAR: Record<string, string> = {
  handel: 'bg-blue-100 text-blue-800',
  lizzy: 'bg-teal-100 text-teal-800',
  esteban: 'bg-amber-100 text-amber-800',
  ariatna: 'bg-violet-100 text-violet-800',
  diego: 'bg-rose-100 text-rose-800',
};

const MEMBER_RING: Record<string, string> = {
  handel: 'ring-blue-300 bg-blue-50',
  lizzy: 'ring-teal-300 bg-teal-50',
  esteban: 'ring-amber-300 bg-amber-50',
  ariatna: 'ring-violet-300 bg-violet-50',
  diego: 'ring-rose-300 bg-rose-50',
};

type GroupedTasks = Map<TaskCat, PlanTask[]>;

function groupByCategory(tasks: readonly PlanTask[]): GroupedTasks {
  const map = new Map<TaskCat, PlanTask[]>();
  for (const task of tasks) {
    const existing = map.get(task.cat);
    if (existing) {
      existing.push(task);
    } else {
      map.set(task.cat, [task]);
    }
  }
  return map;
}

const CAT_ORDER: TaskCat[] = ['fix', 'cap3a', 'cap3b', 'cap3c', 'cap4', 'ensamble'];

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const color =
    pct === 100
      ? 'bg-emerald-500'
      : pct >= 60
        ? 'bg-blue-500'
        : pct >= 30
          ? 'bg-amber-400'
          : 'bg-slate-300';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium text-slate-600">
        {value}/{total}
      </span>
    </div>
  );
}

function TaskItem({
  task,
  done,
  onToggle,
}: {
  task: PlanTask;
  done: boolean;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="group">
      <div className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
        <input
          type="checkbox"
          id={task.id}
          checked={done}
          onChange={() => onToggle(task.id)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          aria-label={task.label}
        />
        <div className="min-w-0 flex-1">
          <label
            htmlFor={task.id}
            className={`block cursor-pointer text-sm leading-snug ${
              done ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}
          >
            {task.label}
          </label>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${CAT_BADGE[task.cat]}`}
            >
              {CAT_LABEL[task.cat]}
            </span>
            {task.ref && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600 ring-1 ring-red-200">
                Comentario {task.ref}
              </span>
            )}
            {task.note && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-blue-600 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
              >
                {expanded ? 'Ocultar nota' : 'Ver nota'}
              </button>
            )}
          </div>

          {expanded && task.note && (
            <div className="mt-2 rounded-md border border-blue-100 bg-blue-50/60 p-2.5 text-xs leading-relaxed text-blue-900">
              {task.note}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function TaskBoard() {
  const [done, setDone] = useState<Set<string>>(() => new Set<string>());
  const [activeTab, setActiveTab] = useState<string>(() => MEMBERS[0]?.id ?? '');
  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    setDone(loadDone());
    setDaysLeft(getDaysLeft());
    const timer = setInterval(() => setDaysLeft(getDaysLeft()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set<string>(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveDone(next);
      return next;
    });
  }, []);

  const activeMember =
    MEMBERS.find((m) => m.id === activeTab) ?? MEMBERS[0];

  if (!activeMember) return null;

  const grouped = groupByCategory(activeMember.tasks);
  const memberDone = activeMember.tasks.filter((t) => done.has(t.id)).length;
  const memberTotal = activeMember.tasks.length;

  const totalDone = MEMBERS.flatMap((m) => m.tasks).filter((t) =>
    done.has(t.id),
  ).length;
  const totalTasks = MEMBERS.flatMap((m) => m.tasks).length;

  const urgencyColor =
    daysLeft <= 3 ? 'bg-red-100 text-red-700' : daysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';

  return (
    <div className="space-y-6">
      {/* Global header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Avance 2 · Entrega
          </p>
          <p className="text-lg font-bold text-slate-900">
            Lunes 27 de julio de 2026
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            Progreso global: {totalDone} de {totalTasks} tareas completadas
          </p>
        </div>
        <div className={`rounded-lg px-4 py-2 text-center ${urgencyColor}`}>
          <p className="text-2xl font-bold leading-none">{daysLeft}</p>
          <p className="text-xs font-medium">días restantes</p>
        </div>
      </div>

      {/* Member summary row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {MEMBERS.map((m) => {
          const mDone = m.tasks.filter((t) => done.has(t.id)).length;
          const isActive = m.id === activeTab;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveTab(m.id)}
              className={`rounded-lg p-2.5 text-left ring-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? `ring-2 ${MEMBER_RING[m.id] ?? 'ring-slate-200 bg-slate-50'}`
                  : 'bg-white ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${MEMBER_AVATAR[m.id] ?? 'bg-slate-100 text-slate-700'}`}
                >
                  {m.initials}
                </span>
                <span className="min-w-0 truncate text-xs font-medium text-slate-800">
                  {m.shortName}
                </span>
              </div>
              <ProgressBar value={mDone} total={m.tasks.length} />
            </button>
          );
        })}
      </div>

      {/* Active member detail */}
      <div className="rounded-xl border border-slate-200 bg-white">
        {/* Member header */}
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${MEMBER_AVATAR[activeMember.id] ?? 'bg-slate-100 text-slate-700'}`}
            >
              {activeMember.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{activeMember.name}</p>
              <p className="text-xs text-slate-500">{activeMember.role}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{memberDone}/{memberTotal}</p>
              <p className="text-xs text-slate-500">tareas</p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={memberDone} total={memberTotal} />
          </div>
        </div>

        {/* Task list grouped by category */}
        <div className="divide-y divide-slate-100">
          {CAT_ORDER.map((cat) => {
            const tasks = grouped.get(cat);
            if (!tasks || tasks.length === 0) return null;
            const catDone = tasks.filter((t) => done.has(t.id)).length;
            return (
              <div key={cat} className="px-5 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${CAT_BADGE[cat]}`}
                  >
                    {CAT_LABEL[cat]}
                  </span>
                  <span className="text-xs text-slate-400">
                    {catDone}/{tasks.length}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      done={done.has(task.id)}
                      onToggle={toggleTask}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Categorías:</span>
        {CAT_ORDER.map((cat) => (
          <span key={cat} className={`rounded px-1.5 py-0.5 ${CAT_BADGE[cat]}`}>
            {CAT_LABEL[cat]}
          </span>
        ))}
        <span className="ml-auto text-slate-400">
          Progreso guardado automáticamente en este navegador
        </span>
      </div>
    </div>
  );
}

export default TaskBoard;
