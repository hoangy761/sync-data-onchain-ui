import type { ReactNode } from 'react';

export function Card({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-4 overflow-hidden rounded-lg border border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-[18px] py-3.5 text-[15px] font-semibold">
        <span>{title}</span>
        {badge}
      </div>
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = 'ok',
}: {
  children: ReactNode;
  tone?: 'ok' | 'bad' | 'muted';
}) {
  const toneClass =
    tone === 'ok'
      ? 'bg-emerald-50 text-ok'
      : tone === 'bad'
        ? 'bg-red-50 text-bad'
        : 'bg-slate-100 text-muted';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
}

export function Kv({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div className="grid grid-cols-1 text-sm md:grid-cols-[200px_1fr]">
      {rows.map(([label, value], index) => {
        const last = index === rows.length - 1;
        const border = last ? '' : 'border-b border-line';
        return (
          <div key={label} className="contents">
            <div className={`${border} bg-slate-50 px-[18px] py-3 text-muted`}>{label}</div>
            <div className={`${border} px-[18px] py-3`}>{value}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-bad">
      {children}
    </div>
  );
}

export function InlineSelect({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 items-center rounded-md border border-line bg-white focus-within:border-link">
      <span className="shrink-0 pl-3 text-[11px] font-semibold tracking-wide text-muted uppercase">
        {label}
      </span>
      <select
        aria-label={label}
        className="min-w-0 flex-1 truncate border-0 bg-transparent py-2.5 pr-2 pl-2 text-sm outline-none disabled:text-muted"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
