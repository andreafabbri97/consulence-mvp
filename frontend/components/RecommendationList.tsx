import { Recommendation } from "@/lib/types";
import { useLang } from "@/lib/i18n";

export function RecommendationList({ items, onAccept, onDetails }: { items: Recommendation[]; onAccept?: (id: string) => void; onDetails?: (rec: Recommendation) => void }) {
  const t = useLang();
  if (!items.length) {
    return <p className="text-sm text-slate-500">{t.noRecs}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((rec) => (
        <li key={rec.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
            <span>Metric {rec.driver_metric_id}</span>
            <span className="font-semibold text-brand-600">{rec.priority}</span>
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{rec.title}</p>
          <p className="mt-2 text-sm text-slate-600">{rec.description}</p>
          <p className="mt-2 text-xs text-slate-500">
            Confidence {(rec.confidence * 100).toFixed(0)}% · Impact {(rec.impact_score * 100).toFixed(0)}%
          </p>
          <div className="mt-3 flex gap-2">
            {rec.status === 'proposed' && (
              <button className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-white" onClick={() => onAccept && onAccept(rec.id)}>
                {t.acceptBtn}
              </button>
            )}
            <button className="rounded-md bg-white/50 px-3 py-1 text-xs text-slate-600" onClick={() => onDetails && onDetails(rec)}>{t.detailsBtn}</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
