import { ActionPlan, ConsultantNote, Insight, KPI, LLMRun, Recommendation } from "./types";
import { MOCK_KPIS, MOCK_INSIGHTS, MOCK_LLM_RUN, demoState } from "./mockData";

const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === '1';

// If NEXT_PUBLIC_API_BASE is set to 'PROXY' or empty, use the frontend origin + /api proxy
const API_BASE = (() => {
  const envBase = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.NEXT_PUBLIC_API_BASE;
  if (envBase && envBase !== 'PROXY') {
    if (typeof window !== 'undefined' && /^:\d+$/.test(envBase)) {
      return `${window.location.protocol}//${window.location.hostname}${envBase}`;
    }
    return envBase;
  }

  // default: use same-origin proxy (Next rewrites /api/* -> backend)
  return '';
})();


// DEBUG: expose resolved base for troubleshooting network issues in LAN
// (will appear in browser console on page load)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.debug('API_BASE resolved to', API_BASE);
}

// Export resolved base so UI components can display it for debugging
export const API_BASE_RESOLVED = API_BASE;

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const url = API_BASE ? `${API_BASE}${input}` : `/api${input}`; // when API_BASE is '', use Next proxy
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

export async function fetchKpis(tenantId: string): Promise<KPI[]> {
  if (STATIC_DEMO) return MOCK_KPIS;
  const data = await request<{ tenant_id: string; kpis: KPI[] }>(`/tenants/${tenantId}/kpis`);
  return data.kpis;
}

export async function fetchInsights(tenantId: string): Promise<Insight[]> {
  if (STATIC_DEMO) return MOCK_INSIGHTS;
  return request(`/tenants/${tenantId}/insights`);
}

export async function fetchRecommendations(tenantId: string): Promise<Recommendation[]> {
  if (STATIC_DEMO) return [...demoState.recommendations];
  return request(`/tenants/${tenantId}/recommendations`);
}

export async function fetchActionPlans(tenantId: string): Promise<ActionPlan[]> {
  if (STATIC_DEMO) return [...demoState.plans];
  return request(`/tenants/${tenantId}/action-plans`);
}

export async function fetchNotes(tenantId: string): Promise<ConsultantNote[]> {
  if (STATIC_DEMO) return [...demoState.notes];
  return request(`/consultant/notes?tenant_id=${tenantId}`);
}

export async function postKpis(tenantId: string, kpis: any[]): Promise<{ inserted: number }> {
  if (STATIC_DEMO) return { inserted: 0 };
  return request(`/tenants/${tenantId}/kpis`, {
    method: 'POST',
    body: JSON.stringify(kpis),
  });
}

export async function uploadKpis(tenantId: string, file: File): Promise<{ inserted: number }> {
  if (STATIC_DEMO) return { inserted: 0 };
  const form = new FormData();
  form.append('file', file, file.name);
  const res = await fetch(`${API_BASE ? `${API_BASE}` : ''}/api/tenants/${tenantId}/kpis/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed ${res.status}`);
  return res.json();
}

export async function createNote(tenantId: string, author: string, content: string): Promise<ConsultantNote> {
  if (STATIC_DEMO) {
    const note: ConsultantNote = { note_id: `note-${Date.now()}`, tenant_id: tenantId, author, created_at: new Date().toISOString(), content };
    demoState.notes.push(note);
    return note;
  }
  return request(`/consultant/notes`, {
    method: "POST",
    body: JSON.stringify({ tenant_id: tenantId, author, content }),
  });
}

export async function runLLMSession(tenantId: string, focusArea: string): Promise<LLMRun> {
  if (STATIC_DEMO) return { ...MOCK_LLM_RUN, focus_area: focusArea };
  return request(`/llm/session`, {
    method: "POST",
    body: JSON.stringify({ tenant_id: tenantId, focus_area: focusArea }),
  });
}

export async function acceptRecommendation(recId: string) {
  if (STATIC_DEMO) {
    const rec = demoState.recommendations.find(r => r.id === recId);
    if (rec) rec.status = 'accepted';
    return { ok: true };
  }
  return request(`/recommendations/${recId}/accept`, { method: 'POST' });
}

export async function createActionPlan(plan: ActionPlan) {
  if (STATIC_DEMO) {
    demoState.plans.push(plan);
    return plan;
  }
  return request(`/action-plans`, { method: 'POST', body: JSON.stringify(plan) });
}

export async function updateActionPlan(planId: string, patch: any) {
  if (STATIC_DEMO) {
    const idx = demoState.plans.findIndex(p => p.id === planId);
    if (idx !== -1) demoState.plans[idx] = { ...demoState.plans[idx], ...patch };
    return demoState.plans[idx] ?? {};
  }
  return request(`/action-plans/${planId}`, { method: 'PUT', body: JSON.stringify(patch) });
}

export async function deleteActionPlan(planId: string) {
  if (STATIC_DEMO) {
    demoState.plans = demoState.plans.filter(p => p.id !== planId);
    return { deleted: true };
  }
  // use fetch directly because delete returns 204
  const url = API_BASE ? `${API_BASE}/action-plans/${planId}` : `/api/action-plans/${planId}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed ${res.status}`);
  return { deleted: true };
}

export async function schedulerStatus() {
  if (STATIC_DEMO) return { running: false, interval_min: null };
  return request(`/automation/status`);
}

export async function schedulerStart(intervalMin?: number) {
  if (STATIC_DEMO) return { running: true };
  return request(`/automation/start`, { method: 'POST', body: JSON.stringify({ interval_min: intervalMin || undefined }) });
}

export async function schedulerStop() {
  if (STATIC_DEMO) return { running: false };
  return request(`/automation/stop`, { method: 'POST' });
}

export async function schedulerRunOnce() {
  if (STATIC_DEMO) return { ok: true };
  return request(`/automation/run-once`, { method: 'POST' });
}
