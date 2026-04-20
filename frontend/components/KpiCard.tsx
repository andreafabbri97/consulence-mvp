import { KPI } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import classNames from "classnames";

const statusToColor: Record<KPI["status"], string> = {
  healthy: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-rose-100 text-rose-800",
};

export function KpiCard({ kpi }: { kpi: KPI }) {
  const t = useLang();
  const ratio = kpi.target ? kpi.value / kpi.target : 1;
  const trendPct = (kpi.trend || 0) * 100;
  let reason = '';
  if (kpi.value >= kpi.target) {
    reason = t.kpiReasonAboveTarget;
  } else {
    if (ratio >= 0.95) reason = t.kpiReasonNearTarget;
    else reason = t.kpiReasonBelowTarget;
  }
  if (trendPct < -5) {
    reason += ` ${t.kpiReasonNegTrend} (${trendPct.toFixed(1)}%).`;
  } else if (trendPct > 5) {
    reason += ` ${t.kpiReasonPosTrend} (${trendPct.toFixed(1)}%).`;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{kpi.domain.toUpperCase()}</span>
        <span
          className={classNames("rounded-full px-2 py-0.5 text-xs font-semibold", statusToColor[kpi.status])}
          title={reason}
          aria-label={`Status: ${kpi.status}. ${reason}`}
        >
          {kpi.status}
        </span>
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-800">{kpi.name}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-900">
          {kpi.unit}
          {kpi.value.toLocaleString("it-IT")}
        </span>
        <span className="text-sm text-slate-500">{t.kpiTarget} {kpi.target.toLocaleString("it-IT")}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={kpi.trend >= 0 ? "text-emerald-600" : "text-rose-600"}>
          {kpi.trend >= 0 ? "+" : ""}
          {(kpi.trend * 100).toFixed(1)}% {t.kpiVsPrev}
        </span>
        <span className="text-slate-500">{kpi.period}</span>
      </div>
    </div>
  );
}
