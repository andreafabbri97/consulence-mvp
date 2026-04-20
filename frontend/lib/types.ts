export type Domain = "marketing" | "operations" | "finance" | "hr";
export type Status = "healthy" | "warning" | "critical";

export interface KPI {
  metric_id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  period: string;
  domain: Domain;
  status: Status;
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  impact_score: number;
  priority: "bassa" | "media" | "alta";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  driver_metric_id: string;
  impact_score: number;
  confidence: number;
  priority: "bassa" | "media" | "alta";
  status: "proposed" | "in_progress" | "accepted";
}

export interface Milestone {
  title: string;
  status: "todo" | "in_progress" | "done";
}

export interface ActionPlan {
  id: string;
  recommendation_id: string;
  owner: string;
  status: "planned" | "in_progress" | "blocked" | "done";
  due_date: string;
  milestones: Milestone[];
}

export interface ConsultantNote {
  note_id: string;
  tenant_id: string;
  author: string;
  created_at: string;
  content: string;
}

export interface LLMRun {
  session_id: string;
  focus_area: string;
  status: "running" | "completed";
  steps: { name: string; output: string }[];
}
