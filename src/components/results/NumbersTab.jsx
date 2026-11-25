import {
  AlertTriangle,
  ArrowRight,
  Check,
  Hash,
  Info,
  PlusCircle,
  Sigma,
  X,
} from 'lucide-react';
import { Badge, Card, CardHeader, EmptyState, cx } from '../ui.jsx';

const cellMeta = {
  match: { label: 'preserved', className: 'text-emerald-700', Icon: Check },
  altered: { label: 'value changed', className: 'text-rose-600', Icon: ArrowRight },
  'unit-change': { label: 'unit changed', className: 'text-amber-600', Icon: AlertTriangle },
  missing: { label: 'not found', className: 'text-rose-600', Icon: X },
};

function NumericCell({ cell }) {
  const meta = cellMeta[cell?.status] || cellMeta.missing;
  if (!cell || cell.status === 'missing') {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-rose-600">
        <X className="h-3.5 w-3.5" strokeWidth={2.4} />
        Not found
      </span>
    );
  }
  const Icon = meta.Icon;
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span
        className={cx(
          'inline-flex items-center gap-1 text-[12px] font-medium',
          meta.className
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        {cell.value}
        {cell.unit === '%' ? '%' : null}
        {cell.unit && cell.unit !== '%' ? (
          <span className="font-normal text-slate-400"> {cell.unit}</span>
        ) : null}
      </span>
      <span className="text-[9.5px] uppercase tracking-wide text-slate-400">{meta.label}</span>
    </span>
  );
}

export default function NumbersTab({ analysis }) {
  const { rows, limitations, translations } = analysis.numeric;
  const failed = rows.filter((row) => row.status === 'fail').length;
  const extras = (translations || []).filter((translation) => translation.extras?.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Source values checked',
            value: rows.length,
            hint: 'Numbers, percentages, decimals, date components and units',
            icon: Sigma,
            tone: 'text-slate-900',
          },
          {
            label: 'Values preserved',
            value: rows.length - failed,
            hint: 'Exact token and unit match in both translations',
            icon: Check,
            tone: 'text-emerald-700',
          },
          {
            label: 'Mismatches detected',
            value: failed,
            hint: 'Altered, missing or unit-changed values',
            icon: AlertTriangle,
            tone: 'text-rose-600',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11.5px] font-medium text-slate-500">{item.label}</p>
                <Icon className="h-4 w-4 text-slate-400" strokeWidth={2} />
              </div>
              <p className={cx('mt-2 text-[24px] font-semibold leading-none', item.tone)}>
                {item.value}
              </p>
              <p className="mt-1.5 text-[10.5px] leading-snug text-slate-400">{item.hint}</p>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader
          icon={Hash}
          title="Numerical value validation"
          description="Exact comparison of numeric tokens and their associated units."
          action={<Badge tone="outline">{failed} mismatch{failed === 1 ? '' : 'es'}</Badge>}
        />
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-[0.07em] text-slate-500">
                  <th className="px-5 py-2.5 font-semibold">English source value</th>
                  <th className="px-4 py-2.5 font-semibold">Translation 1</th>
                  <th className="px-4 py-2.5 font-semibold">Translation 2</th>
                  <th className="px-5 py-2.5 font-semibold">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top transition hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[13px] font-medium text-slate-900">
                          {row.sourceRaw}
                        </span>
                        {row.unit ? <Badge tone="outline">unit: {row.unit}</Badge> : null}
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Source sentence {row.sentenceIndex + 1}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <NumericCell cell={row.cells[0]} />
                    </td>
                    <td className="px-4 py-3">
                      <NumericCell cell={row.cells[1]} />
                    </td>
                    <td className="px-5 py-3">
                      {row.status === 'pass' ? (
                        <Badge tone="success">
                          <Check className="h-3 w-3" strokeWidth={2.6} />
                          Preserved
                        </Badge>
                      ) : (
                        <Badge tone="critical">
                          <X className="h-3 w-3" strokeWidth={2.6} />
                          Mismatch
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Sigma}
            title="No numeric values found"
            description="This passage contains no digits, percentages or measurement values to validate."
          />
        )}
      </Card>

      {extras.length ? (
        <Card>
          <CardHeader
            icon={PlusCircle}
            title="Values without a source counterpart"
            description="Numbers that appear only in a translation."
          />
          <ul className="divide-y divide-slate-100">
            {extras.map((translation) => (
              <li key={translation.label} className="flex flex-wrap items-center gap-2 px-5 py-3">
                <span className="text-[11.5px] font-medium text-slate-700">
                  {translation.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {translation.extras.map((extra, index) => (
                    <span
                      key={`${extra.raw}-${index}`}
                      className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] text-amber-800"
                    >
                      {extra.raw}
                      {extra.unit ? ` ${extra.unit}` : ''}
                    </span>
                  ))}
                </div>
                <span className="ml-auto text-[10.5px] text-slate-400">Flagged as Warning</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <div className="flex items-start gap-2 px-5 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
          <div>
            <p className="text-[11.5px] font-medium text-slate-700">Validation limits</p>
            <ul className="mt-1.5 space-y-1">
              {limitations.map((limitation) => (
                <li key={limitation} className="text-[11px] leading-relaxed text-slate-500">
                  · {limitation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
