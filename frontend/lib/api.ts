import { ActionPlan, ConsultantNote, Insight, KPI, LLMRun, Recommendation } from "./types";

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
  const data = await request<{ tenant_id: string; kpis: KPI[] }>(`/tenants/${tenantId}/kpis`);
  return data.kpis;
}

export async function fetchInsights(tenantId: string): Promise<Insight[]> {
  return request(`/tenants/${tenantId}/insights`);
}

export async function fetchRecommendations(tenantId: string): Promise<Recommendation[]> {
  return request(`/tenants/${tenantId}/recommendations`);
}

export async function fetchActionPlans(tenantId: string): Promise<ActionPlan[]> {
  return request(`/tenants/${tenantId}/action-plans`);
}

export async function fetchNotes(tenantId: string): Promise<ConsultantNote[]> {
  return request(`/consultant/notes?tenant_id=${tenantId}`);
}

export async function postKpis(tenantId: string, kpis: any[]): Promise<{ inserted: number }> {
  return request(`/tenants/${tenantId}/kpis`, {
    method: 'POST',
    body: JSON.stringify(kpis),
  });
}

export async function uploadKpis(tenantId: string, file: File): Promise<{ inserted: number }> {
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
  return request(`/consultant/notes`, {
    method: "POST",
    body: JSON.stringify({ tenant_id: tenantId, author, content }),
  });
}

export async function runLLMSession(tenantId: string, focusArea: string): Promise<LLMRun> {
  return request(`/llm/session`, {
    method: "POST",
    body: JSON.stringify({ tenant_id: tenantId, focus_area: focusArea }),
  });
}

export async function acceptRecommendation(recId: string) {
  return request(`/recommendations/${recId}/accept`, { method: 'POST' });
}

export async function createActionPlan(plan: ActionPlan) {
  return request(`/action-plans`, { method: 'POST', body: JSON.stringify(plan) });
}

export async function updateActionPlan(planId: string, patch: any) {
  return request(`/action-plans/${planId}`, { method: 'PUT', body: JSON.stringify(patch) });
}

export async function deleteActionPlan(planId: string) {
  // use fetch directly because delete returns 204
  const url = API_BASE ? `${API_BASE}/action-plans/${planId}` : `/api/action-plans/${planId}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed ${res.status}`);
  return { deleted: true };
}

export async function schedulerStatus() {
  return request(`/automation/status`);
}

export async function schedulerStart(intervalMin?: number) {
  return request(`/automation/start`, { method: 'POST', body: JSON.stringify({ interval_min: intervalMin || undefined }) });
}

export async function schedulerStop() {
  return request(`/automation/stop`, { method: 'POST' });
}

export async function schedulerRunOnce() {
  return request(`/automation/run-once`, { method: 'POST' });
}
