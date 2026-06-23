import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: ReadonlyArray<TabItem>;
  defaultTabId?: string;
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function Tabs({
  tabs,
  defaultTabId,
  value,
  onChange,
  className,
  ariaLabel,
}: TabsProps) {
  const baseId = useId();
  const initialId = defaultTabId ?? tabs[0]?.id ?? '';
  const [internalId, setInternalId] = useState<string>(initialId);
  const activeId = value ?? internalId;

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectIndex = useCallback(
    (index: number, focus: boolean): void => {
      const target = tabs[index];
      if (!target) return;
      if (value === undefined) setInternalId(target.id);
      onChange?.(target.id);
      if (focus) tabRefs.current[index]?.focus();
    },
    [tabs, value, onChange],
  );

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    const last = tabs.length - 1;
    if (last < 0) return;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next !== null) {
      e.preventDefault();
      selectIndex(next, true);
    }
  };

  useEffect(() => {
    // Keep internal state in range if tabs change
    if (!tabs.find((t) => t.id === activeId) && tabs[0]) {
      setInternalId(tabs[0].id);
    }
  }, [tabs, activeId]);

  const wrapperClasses = ['w-full', className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-1 border-b border-slate-200"
      >
        {tabs.map((tab, i) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectIndex(i, false)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={
                'rounded-t-md px-3 py-2 text-sm font-medium transition-colors ' +
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
                'focus-visible:ring-offset-2 focus-visible:ring-offset-white ' +
                (selected
                  ? 'border-b-2 border-blue-600 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={!selected}
            className="pt-4"
          >
            {selected && tab.content}
          </div>
        );
      })}
    </div>
  );
}

export default Tabs;
