/**
 * Demo data for GitHub Pages / static export mode.
 * Used when NEXT_PUBLIC_STATIC_DEMO=1.
 */
import { ActionPlan, ConsultantNote, Insight, KPI, LLMRun, Recommendation } from './types';

export const MOCK_KPIS: KPI[] = [
  { metric_id: 'rev_mrr', name: 'MRR', value: 185000, target: 200000, unit: '€', trend: 0.08, period: '2025-11', domain: 'finance', status: 'warning' },
  { metric_id: 'cac', name: 'CAC', value: 1620, target: 1400, unit: '€', trend: 0.12, period: '2025-11', domain: 'marketing', status: 'critical' },
  { metric_id: 'nps', name: 'NPS', value: 42, target: 55, unit: 'pts', trend: -0.05, period: '2025-Q4', domain: 'operations', status: 'warning' },
  { metric_id: 'attrition', name: 'Attrition', value: 0.07, target: 0.05, unit: '%', trend: 0.02, period: '2025-Q4', domain: 'hr', status: 'critical' },
];

export const MOCK_INSIGHTS: Insight[] = [
  { id: 'insight-cac', title: 'Il CAC è cresciuto del 12%', summary: "L'aumento deriva da campagne paid con ROAS basso in UK.", impact_score: 0.78, priority: 'alta' },
  { id: 'insight-attrition', title: 'Aumento dimissioni team vendite', summary: 'Turnover 7%, superiore del 40% al benchmark SaaS.', impact_score: 0.72, priority: 'media' },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  { id: 'rec-1', title: 'Ribilancia budget marketing', description: 'Sposta 15% del budget paid verso campagne partner con CAC 35% inferiore.', driver_metric_id: 'cac', impact_score: 0.82, confidence: 0.74, priority: 'alta', status: 'proposed' },
  { id: 'rec-2', title: 'Programma retention vendite', description: 'Implementa bonus trimestrale legato a pipeline qualificata e coaching.', driver_metric_id: 'attrition', impact_score: 0.69, confidence: 0.66, priority: 'media', status: 'in_progress' },
];

export const MOCK_ACTION_PLANS: ActionPlan[] = [
  {
    id: 'plan-1',
    recommendation_id: 'rec-2',
    owner: 'sofia.rossi',
    status: 'in_progress',
    due_date: '2025-12-15',
    milestones: [
      { title: 'Disegnare bonus', status: 'done' },
      { title: 'Allineare HR', status: 'in_progress' },
    ],
  },
];

export const MOCK_NOTES: ConsultantNote[] = [
  {
    note_id: 'note-1',
    tenant_id: 'acme',
    author: 'consulente@firm.it',
    created_at: '2025-11-20T10:00:00Z',
    content: 'Clienti enterprise chiedono SLA più stringenti.',
  },
];

export const MOCK_LLM_RUN: LLMRun = {
  session_id: 'demo-session',
  focus_area: 'marketing',
  status: 'completed',
  steps: [
    { name: 'context_builder', output: 'KPI marketing in rallentamento vs target.' },
    { name: 'root_cause', output: 'ROAS UK sotto 2.5; pipeline partner non attivata.' },
    { name: 'action_plan', output: 'Priorità: riallocare 15% budget e lanciare programma partner.' },
  ],
};

// Mutable runtime state for demo interactions (write operations mutate these arrays)
export const demoState = {
  notes: [...MOCK_NOTES] as ConsultantNote[],
  plans: [...MOCK_ACTION_PLANS] as ActionPlan[],
  recommendations: [...MOCK_RECOMMENDATIONS] as Recommendation[],
};
