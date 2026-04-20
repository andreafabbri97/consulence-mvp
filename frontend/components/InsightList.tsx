import { Insight } from "@/lib/types";

export function InsightList({ insights }: { insights: Insight[] }) {
  if (!insights.length) {
    return <p className="text-sm text-slate-500">Nessun insight generato.</p>;
  }

  return (
    <ul className="space-y-3">
      {insights.map((insight) => (
        <li key={insight.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
            <span>Impatto {(insight.impact_score * 100).toFixed(0)}%</span>
            <span className="font-semibold text-brand-600">Priorità {insight.priority}</span>
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{insight.title}</p>
          <p className="mt-2 text-sm text-slate-600">{insight.summary}</p>
        </li>
      ))}
    </ul>
  );
}
