import { CheckCircle2, AlertOctagon, AlertTriangle, CircleHelp, Loader2 } from 'lucide-react';

export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const labelClass = 'block text-[13px] font-medium text-slate-700';

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-[0_1px_1px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-500';

export const textareaClass = `${inputClass} resize-y leading-relaxed`;

export const helperClass = 'mt-1.5 text-xs leading-relaxed text-slate-500';

const badgeTones = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  review: 'border-sky-200 bg-sky-50 text-sky-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  outline: 'border-slate-200 bg-white text-slate-500',
};

export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-[0.01em]',
        badgeTones[tone] || badgeTones.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

const severityTone = { Critical: 'critical', Warning: 'warning', Review: 'review' };
const severityDot = { Critical: 'bg-rose-500', Warning: 'bg-amber-500', Review: 'bg-sky-500' };
const severityIcon = { Critical: AlertOctagon, Warning: AlertTriangle, Review: CircleHelp };

export function SeverityBadge({ severity, withIcon = false, className = '' }) {
  const Icon = severityIcon[severity];
  return (
    <Badge tone={severityTone[severity] || 'neutral'} className={className}>
      {withIcon && Icon ? (
        <Icon className="h-3 w-3" strokeWidth={2.2} />
      ) : (
        <span className={cx('h-1.5 w-1.5 rounded-full', severityDot[severity] || 'bg-slate-400')} />
      )}
      {severity}
    </Badge>
  );
}

const consistencyTone = {
  Consistent: 'success',
  Inconsistent: 'warning',
  'Needs Review': 'review',
};

export function ConsistencyBadge({ status, className = '' }) {
  return (
    <Badge tone={consistencyTone[status] || 'neutral'} className={className}>
      {status === 'Consistent' ? (
        <CheckCircle2 className="h-3 w-3" strokeWidth={2.4} />
      ) : (
        <span
          className={cx(
            'h-1.5 w-1.5 rounded-full',
            status === 'Inconsistent' ? 'bg-amber-500' : 'bg-sky-500'
          )}
        />
      )}
      {status}
    </Badge>
  );
}

const buttonVariants = {
  primary:
    'bg-indigo-600 text-white shadow-[0_1px_2px_rgba(49,46,129,0.25)] hover:bg-indigo-700 focus-visible:ring-indigo-500/30 disabled:bg-indigo-300',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-[0_1px_1px_rgba(15,23,42,0.03)] hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400/20 disabled:text-slate-400',
  soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400/20',
  danger:
    'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-500/20',
};

const buttonSizes = {
  sm: 'h-8 gap-1.5 rounded-lg px-2.5 text-xs',
  md: 'h-10 gap-2 rounded-xl px-3.5 text-[13px]',
  lg: 'h-11 gap-2 rounded-xl px-5 text-sm',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex select-none items-center justify-center font-medium transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed',
        buttonVariants[variant] || buttonVariants.primary,
        buttonSizes[size] || buttonSizes.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Spinner({ className = 'h-4 w-4' }) {
  return <Loader2 className={cx('animate-spin', className)} strokeWidth={2.4} />;
}

export function Card({ children, className = '', ...props }) {
  return (
    <section
      className={cx(
        'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const statAccent = {
  indigo: 'bg-indigo-50 text-indigo-600',
  slate: 'bg-slate-100 text-slate-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
};

export function StatCard({ icon: Icon, label, value, hint, accent = 'indigo' }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium leading-snug text-slate-500">{label}</p>
        {Icon ? (
          <span
            className={cx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              statAccent[accent] || statAccent.indigo
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-slate-900">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[11.5px] leading-snug text-slate-500">{hint}</p> : null}
    </Card>
  );
}

export function ProgressBar({ value = 0, tone = 'bg-indigo-500', className = '', trackClass = 'bg-slate-100' }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full', trackClass, className)}>
      <div
        className={cx('h-full rounded-full transition-all duration-500', tone)}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={cx('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {Icon ? (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
      ) : null}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Divider({ className = '' }) {
  return <div className={cx('h-px w-full bg-slate-100', className)} />;
}
