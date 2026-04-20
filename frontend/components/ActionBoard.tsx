import { ActionPlan } from "@/lib/types";
import { useLang } from "@/lib/i18n";

export function ActionBoard({ plans, onEdit }: { plans: ActionPlan[]; onEdit?: (plan: ActionPlan) => void }) {
  const t = useLang();
  if (!plans.length) {
    return <p className="text-sm text-slate-500">{t.noPlans}</p>;
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-600">{t.planOwnerPrefix} {plan.owner}</p>
              <p className="text-lg font-bold text-slate-900">{plan.recommendation_id}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p className="font-semibold">{t.planDuePrefix} {new Date(plan.due_date).toLocaleDateString("it-IT")}</p>
              <p className="capitalize">{plan.status.replace("_", " ")}</p>
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {plan.milestones.map((milestone) => (
              <li key={milestone.title} className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
                <span className="font-medium">{milestone.title}</span>
                <span className="text-xs uppercase text-slate-400">{milestone.status}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end gap-2">
            <button className="rounded-md bg-white/50 px-3 py-1 text-xs text-slate-600" onClick={() => onEdit && onEdit(plan)}>{t.planModifyBtn}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
