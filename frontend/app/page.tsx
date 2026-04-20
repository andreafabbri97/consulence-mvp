'use client';

import { useEffect, useState } from 'react';

import { ActionBoard } from '@/components/ActionBoard';
import { ConsultantDesk } from '@/components/ConsultantDesk';
import { InsightList } from '@/components/InsightList';
import { KpiCard } from '@/components/KpiCard';
import { RecommendationList } from '@/components/RecommendationList';
import {
  createNote,
  fetchActionPlans,
  fetchInsights,
  fetchKpis,
  fetchNotes,
  fetchRecommendations,
  runLLMSession,
  postKpis,
  uploadKpis,
  acceptRecommendation,
  createActionPlan,
  updateActionPlan,
  deleteActionPlan,
  schedulerStatus,
  schedulerStart,
  schedulerStop,
  schedulerRunOnce,
} from '@/lib/api';
import { ActionPlan, ConsultantNote, Insight, KPI, LLMRun, Recommendation } from '@/lib/types';

const DEFAULT_TENANTS = ['acme', 'contoso', 'globex'];


export default function HomePage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [notes, setNotes] = useState<ConsultantNote[]>([]);
  const [llmRun, setLlmRun] = useState<LLMRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ActionPlan modal / edit state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);
  const [planOwner, setPlanOwner] = useState('');
  const [planDueDate, setPlanDueDate] = useState('');
  const [planRecommendationId, setPlanRecommendationId] = useState('');
  const [planMilestonesText, setPlanMilestonesText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Recommendation details modal
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [showRecModal, setShowRecModal] = useState(false);

  // Scheduler state
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [schedulerInterval, setSchedulerInterval] = useState<number | null>(null);
  const [showSchedulerHelp, setShowSchedulerHelp] = useState(false);

  // tenant list persisted in localStorage (frontend-only management)
  const [tenantList, setTenantList] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('advisor_tenants');
      return raw ? JSON.parse(raw) : DEFAULT_TENANTS;
    } catch (e) {
      return DEFAULT_TENANTS;
    }
  });
  const [tenantId, setTenantId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('advisor_selected_tenant');
      return saved || DEFAULT_TENANTS[0];
    } catch (e) {
      return DEFAULT_TENANTS[0];
    }
  });
  const [showTenantManager, setShowTenantManager] = useState<boolean>(false);
  const [newTenantName, setNewTenantName] = useState<string>('');
  const [editingTenant, setEditingTenant] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const CONSULTANT_EMAIL = 'consulente@firm.it';

  useEffect(() => {
    void bootstrap();
  }, [tenantId]);

  // diagnostic state for debug badge
  const [diagApi, setDiagApi] = useState<string>('—');
  const [diagHealth, setDiagHealth] = useState<string>('—');
  const [diagKpi, setDiagKpi] = useState<string | number>('—');

  useEffect(() => {
    // lazy-check backend reachable using resolved API base
    import('@/lib/api').then(({ API_BASE_RESOLVED }) => {
      // API_BASE_RESOLVED === '' means use same-origin proxy -> map to '/api'
      const debugBase = API_BASE_RESOLVED || '/api';
      setDiagApi(API_BASE_RESOLVED || '(proxy /api)');
      fetch(`${debugBase}/health`)
        .then((r) => (r.ok ? setDiagHealth('OK') : setDiagHealth(`HTTP ${r.status}`)))
        .catch(() => setDiagHealth('ERR'));
      fetch(`${debugBase}/tenants/${tenantId}/kpis`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((js) => {
          // API returns either an array (legacy) or { tenant_id, kpis: [] }
          if (Array.isArray(js)) return setDiagKpi(js.length);
          if (js && Array.isArray((js as any).kpis)) return setDiagKpi((js as any).kpis.length);
          return setDiagKpi('—');
        })
        .catch(() => setDiagKpi('ERR'));

      // scheduler status
      schedulerStatus()
        .then((s) => {
          const ss: any = s;
          setSchedulerRunning(Boolean(ss?.running));
          setSchedulerInterval(ss?.interval_min || null);
        })
        .catch(() => {
          /* ignore */
        });
    });
  }, [tenantId]);

  // persist tenant list + selected tenant in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('advisor_tenants', JSON.stringify(tenantList));
    } catch (e) {
      /* ignore */
    }
  }, [tenantList]);

  useEffect(() => {
    try {
      localStorage.setItem('advisor_selected_tenant', tenantId);
    } catch (e) {
      /* ignore */
    }
  }, [tenantId]);

  async function bootstrap() {
    try {
      setLoading(true);
      const [kpiData, insightData, recData, planData, noteData] = await Promise.all([
        fetchKpis(tenantId),
        fetchInsights(tenantId),
        fetchRecommendations(tenantId),
        fetchActionPlans(tenantId),
        fetchNotes(tenantId),
      ]);
      setKpis(kpiData);
      setInsights(insightData);
      setRecommendations(recData);
      setPlans(planData);
      setNotes(noteData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Impossibile contattare il backend.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote(content: string) {
    await createNote(tenantId, CONSULTANT_EMAIL, content);
    const refreshedNotes = await fetchNotes(tenantId);
    setNotes(refreshedNotes);
  }

  // multi-kpi ingestion (textarea JSON/CSV or file upload)
  const [kpiBulkText, setKpiBulkText] = useState('metric_id,name,value,target,unit,trend,period,domain\nrev_mrr,MRR,185000,200000,€,0.08,2025-11,finance');
  const [kpiFile, setKpiFile] = useState<File | null>(null);
  const [kpiUploading, setKpiUploading] = useState(false);

  // manual multi-row KPI editor state
  const [manualKpis, setManualKpis] = useState<Array<any>>([
    { metric_id: '', name: '', value: '', target: '', unit: '', trend: 0, period: '', domain: 'marketing' },
  ]);
  const [showKpiHelp, setShowKpiHelp] = useState<boolean>(false);

  function addManualRow() {
    setManualKpis(prev => [...prev, { metric_id: '', name: '', value: '', target: '', unit: '', trend: 0, period: '', domain: 'marketing' }]);
  }
  function removeManual(idx: number) {
    setManualKpis(prev => prev.filter((_, i) => i !== idx));
  }
  function updateManual(idx: number, key: string, value: any) {
    setManualKpis(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  }

  async function submitManualKpis() {
    setKpiUploading(true);
    try {
      const payload = manualKpis.map(r => ({
        metric_id: String(r.metric_id),
        name: String(r.name || r.metric_id),
        value: Number(r.value) || 0,
        target: Number(r.target) || 0,
        unit: String(r.unit || ''),
        trend: Number(r.trend) || 0,
        period: String(r.period || ''),
        domain: String(r.domain || 'marketing'),
        // status calcolato dal backend automaticamente
      }));
      const res = await postKpis(tenantId, payload);
      console.debug('manual post', res);
      await bootstrap();
      setManualKpis([{ metric_id: '', name: '', value: '', target: '', unit: '', trend: 0, period: '', domain: 'marketing' }]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Invio KPI manuale fallito.');
    } finally {
      setKpiUploading(false);
    }
  }

  async function handleSubmitKpis() {
    setKpiUploading(true);
    try {
      // If a file is chosen, upload it; otherwise parse textarea as CSV
      if (kpiFile) {
        const res = await uploadKpis(tenantId, kpiFile);
        console.debug('upload result', res);
      } else {
        // parse CSV from textarea
        const lines = kpiBulkText.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(l => {
          const cols = l.split(',');
          const obj: any = {};
          headers.forEach((h, i) => { obj[h] = cols[i]; });
          // ensure numeric conversion
          obj.value = Number(obj.value);
          obj.target = Number(obj.target);
          obj.trend = Number(obj.trend || 0);
          return obj;
        });
        const res = await postKpis(tenantId, rows);
        console.debug('post kpis', res);
      }
      await bootstrap();
      setError(null);
      setKpiFile(null);
    } catch (err) {
      console.error(err);
      setError('Import KPI fallita. Controlla formato.');
    } finally {
      setKpiUploading(false);
    }
  }

  async function handleRunCopilot() {
    setCopilotLoading(true);
    try {
      const session = await runLLMSession(tenantId, 'marketing');
      setLlmRun(session);
    } catch (err) {
      console.error(err);
      setError('Copilot non disponibile.');
    } finally {
      setCopilotLoading(false);
    }
  }

  async function handleAcceptRecommendation(id: string) {
    try {
      await acceptRecommendation(id);
      const [recs, plansResp] = await Promise.all([fetchRecommendations(tenantId), fetchActionPlans(tenantId)]);
      setRecommendations(recs);
      setPlans(plansResp);
    } catch (err) {
      console.error(err);
      setError('Impossibile accettare la raccomandazione.');
    }
  }

  function openNewPlanModal() {
    setEditingPlan(null);
    setPlanOwner('sofia.rossi');
    setPlanDueDate(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10));
    setPlanRecommendationId(recommendations[0]?.id || '');
    setPlanMilestonesText('');
    setShowPlanModal(true);
  }

  function openEditPlanModal(plan: ActionPlan) {
    setEditingPlan(plan);
    setPlanOwner(plan.owner);
    setPlanDueDate(plan.due_date);
    setPlanRecommendationId(plan.recommendation_id);
    setPlanMilestonesText(plan.milestones.map(m => m.title).join('\n'));
    setShowDeleteConfirm(false);
    setShowPlanModal(true);
  }

  async function submitPlan() {
    try {
      const milestones = planMilestonesText.split(/\r?\n/).filter(Boolean).map(t => ({ title: t, status: 'todo' }));
      if (editingPlan) {
        await updateActionPlan(editingPlan.id, { owner: planOwner, due_date: planDueDate, milestones: milestones as any });
      } else {
        const id = `plan-${Math.random().toString(36).slice(2, 9)}`;
        await createActionPlan({ id, recommendation_id: planRecommendationId, owner: planOwner, status: 'planned', due_date: planDueDate, milestones: milestones as any });
      }
      const refreshed = await fetchActionPlans(tenantId);
      setPlans(refreshed);
      setShowPlanModal(false);
    } catch (err) {
      console.error(err);
      setError('Impossibile salvare il piano.');
    }
  }

  async function handleSchedulerStart() {
    try {
      await schedulerStart();
      const s = await schedulerStatus();
      const ss: any = s;
      setSchedulerRunning(Boolean(ss?.running));
      setSchedulerInterval(ss?.interval_min || null);
    } catch (err) {
      console.error(err);
      setError('Impossibile avviare lo scheduler');
    }
  }

  async function handleSchedulerStop() {
    try {
      await schedulerStop();
      const s: any = await schedulerStatus();
      setSchedulerRunning(Boolean(s?.running));
    } catch (err) {
      console.error(err);
      setError('Impossibile fermare lo scheduler');
    }
  }

  async function handleSchedulerRunOnce() {
    try {
      await schedulerRunOnce();
      await bootstrap();
    } catch (err) {
      console.error(err);
      setError('Run-once fallito');
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-900 p-8 text-white lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm uppercase tracking-widest text-white/70">Tenant ·</p>
            <div className="relative">
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="rounded-md bg-white px-2 py-1 text-sm"
                style={{ color: '#0f172a', backgroundColor: 'white' }}
              >
                {tenantList.map(t => (
                  <option key={t} value={t} style={{ color: '#0f172a', backgroundColor: 'white' }}>{t}</option>
                ))}
              </select>
              <button
                onClick={() => setShowTenantManager(v => !v)}
                title="Gestisci tenant"
                className="ml-2 absolute right-[-86px] top-0 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80"
              >
                Gestisci
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-semibold">Console di consulenza intelligente</h1>
          <p className="mt-2 text-white/80">Insight live, automazioni e area privata per il consulente.</p>

          {showTenantManager && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowTenantManager(false)} />
              <div className="relative w-[min(90%,520px)] rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-900">Gestisci tenant</h4>
                  <button className="text-sm text-slate-500" onClick={() => setShowTenantManager(false)}>Chiudi ✕</button>
                </div>

                <div className="mb-3 flex gap-2">
                  <input className="flex-1 rounded-md border px-2 py-1 text-sm text-slate-900 bg-white" placeholder="Nuovo tenant" value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} />
                  <button className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-white" onClick={() => {
                    const name = (newTenantName || '').trim();
                    if (!name) return setError('Inserisci un nome valido');
                    if (tenantList.includes(name)) return setError('Tenant già esistente');
                    const next = [...tenantList, name];
                    setTenantList(next);
                    setTenantId(name);
                    setNewTenantName('');
                  }}>Aggiungi</button>
                </div>

                <ul className="space-y-2 max-h-56 overflow-auto">
                  {tenantList.map(t => (
                    <li key={t} className="flex items-center justify-between gap-2 border-b pb-2">
                      {editingTenant === t ? (
                        <div className="flex gap-2 w-full">
                          <input className="flex-1 rounded-md border px-2 py-1 text-sm text-slate-900" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                          <button className="text-xs text-emerald-600" onClick={() => {
                            const newName = (editingName || '').trim();
                            if (!newName) return setError('Nome non valido');
                            if (tenantList.includes(newName) && newName !== t) return setError('Nome già esistente');
                            setTenantList(tenantList.map(x => x === t ? newName : x));
                            if (tenantId === t) setTenantId(newName);
                            setEditingTenant(null);
                          }}>Salva</button>
                          <button className="text-xs text-slate-400" onClick={() => setEditingTenant(null)}>Annulla</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-1">
                            <span className={(t === tenantId ? 'font-semibold ' : '') + 'text-slate-900'}>{t}</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-xs text-slate-600" onClick={() => { setEditingTenant(t); setEditingName(t); }}>Modifica</button>
                            <button className="text-xs text-rose-500" onClick={() => {
                              const next = tenantList.filter(x => x !== t);
                              setTenantList(next);
                              if (tenantId === t) setTenantId(next[0] || '');
                            }}>Elimina</button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-end gap-2">
                  <button className="rounded-md px-3 py-1 text-sm" onClick={() => setShowTenantManager(false)}>Chiudi</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void bootstrap()}
            className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30"
          >
            Aggiorna dati
          </button>
          <button
            onClick={() => { console.debug('Copilot click'); void handleRunCopilot(); }}
            disabled={copilotLoading}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60 shadow-sm"
            style={{ border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer' }}
          >
            {copilotLoading ? 'Copilot in corso...' : 'Chiedi al Copilot'}
          </button>
        </div>
      </header>

      {/* diagnostic badge */}
      <div className="mb-4 flex gap-3 items-center">
        <div className="rounded-full bg-slate-50 px-3 py-1 text-xs border">API: <span className="font-mono">{diagApi}</span></div>
        <div className="rounded-full bg-slate-50 px-3 py-1 text-xs border">Health: <strong className="ml-1">{diagHealth}</strong></div>
        <div className="rounded-full bg-slate-50 px-3 py-1 text-xs border">KPI items: <strong className="ml-1">{diagKpi}</strong></div>
        <div className="rounded-full bg-slate-50 px-3 py-1 text-xs border ml-4">Scheduler: <strong className="ml-1">{schedulerRunning ? 'running' : 'stopped'}</strong></div>
        <div className="ml-2 flex gap-2 items-center">
          <button className="text-xs rounded-md bg-white/20 px-2 py-1" onClick={() => void handleSchedulerStart()}>Start</button>
          <button className="text-xs rounded-md bg-white/20 px-2 py-1" onClick={() => void handleSchedulerStop()}>Stop</button>
          <button className="text-xs rounded-md bg-white/20 px-2 py-1" onClick={() => void handleSchedulerRunOnce()}>Run once</button>
          <button title="Guida scheduler" aria-label="Guida scheduler" className="ml-2 h-6 w-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center" onClick={() => setShowSchedulerHelp(true)}>?</button>
        </div>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="text-center text-sm text-slate-500">Caricamento dati...</p>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">KPI chiave</h2>
              <span className="text-sm text-slate-500">Ultimo aggiornamento realtime</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.metric_id} kpi={kpi} />
              ))}
            </div>

            {/* Manual multi-KPI form */}
            <div className="mt-6 rounded-2xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold">Aggiungi KPI manualmente (multipli)</h3>
                <button
                  title="Guida inserimento KPI"
                  aria-label="Mostra guida per inserimento KPI"
                  onClick={() => setShowKpiHelp(true)}
                  className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center"
                >
                  ?
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Aggiungi più righe e invia tutte insieme. <strong>Lo `status` viene calcolato automaticamente dal sistema</strong> (non inserirlo).</p>

              <div className="mt-3 space-y-2">
                <div className="flex gap-2 items-center text-xs text-slate-500 mb-2">
                  <span className="w-28">metric_id</span>
                  <span className="w-36">name</span>
                  <span className="w-20">value</span>
                  <span className="w-20">target</span>
                  <span className="w-20">unit</span>
                  <span className="w-20">trend</span>
                  <span className="w-28">period</span>
                  <span className="w-28">domain</span>
                  <span className="w-12" />
                </div>

                {manualKpis.map((row, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input className="w-28 rounded-md border p-1 text-sm text-slate-900" value={row.metric_id} onChange={(e) => updateManual(idx, 'metric_id', e.target.value)} placeholder="metric_id (es. rev_mrr)" />
                    <input className="w-36 rounded-md border p-1 text-sm text-slate-900" value={row.name} onChange={(e) => updateManual(idx, 'name', e.target.value)} placeholder="name (es. MRR)" />
                    <input className="w-20 rounded-md border p-1 text-sm text-slate-900" value={row.value} onChange={(e) => updateManual(idx, 'value', e.target.value)} placeholder="value" />
                    <input className="w-20 rounded-md border p-1 text-sm text-slate-900" value={row.target} onChange={(e) => updateManual(idx, 'target', e.target.value)} placeholder="target" />
                    <input className="w-20 rounded-md border p-1 text-sm text-slate-900" value={row.unit} onChange={(e) => updateManual(idx, 'unit', e.target.value)} placeholder="unit" />
                    <input className="w-20 rounded-md border p-1 text-sm text-slate-900" value={row.trend} onChange={(e) => updateManual(idx, 'trend', e.target.value)} placeholder="trend (e.g. 0.05)" />
                    <input className="w-28 rounded-md border p-1 text-sm text-slate-900" value={row.period} onChange={(e) => updateManual(idx, 'period', e.target.value)} placeholder="period (YYYY-MM)" />
                    <select className="w-28 rounded-md border p-1 text-sm text-slate-900" value={row.domain} onChange={(e) => updateManual(idx, 'domain', e.target.value)}>
                      <option value="marketing">marketing</option>
                      <option value="operations">operations</option>
                      <option value="finance">finance</option>
                      <option value="hr">hr</option>
                    </select>
                    <button className="text-xs text-rose-600" onClick={() => removeManual(idx)}>Rimuovi</button>
                  </div>
                ))}

                <div className="flex gap-3 mt-2">
                  <button className="rounded-full bg-white/20 px-3 py-1 text-sm" onClick={addManualRow}>Aggiungi riga</button>
                  <button className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => void submitManualKpis()} disabled={kpiUploading}>{kpiUploading ? 'Invio...' : 'Invia KPI'}</button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Puoi anche usare l'area <em>Importa KPI (bulk)</em> per CSV/XLSX.</p>
              </div>
            </div>

            {/* KPI help modal */}
            {showKpiHelp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowKpiHelp(false)} />
                <div className="relative w-[min(92%,720px)] max-h-[85vh] overflow-auto overscroll-contain rounded-2xl bg-white p-6 shadow-lg text-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Guida all'inserimento KPI</h3>
                      <p className="text-sm text-slate-500 mt-1">Consigli e regole per inserire correttamente i KPI nel sistema.</p>
                    </div>
                    <button onClick={() => setShowKpiHelp(false)} className="text-sm text-slate-500">Chiudi ✕</button>
                  </div>

                  <hr className="my-4" />

                  <section className="space-y-3 text-sm">
                    <div>
                      <strong>metric_id (ID tecnico)</strong>
                      <p className="text-slate-600 mt-1">Identificatore univoco e stabile del KPI. Formato consigliato: lowercase, underscore o kebab (es. <code>rev_mrr</code>, <code>active_users</code>). Evita di cambiarlo dopo la creazione: serve per la cronologia e per collegare raccomandazioni o azioni.</p>
                    </div>

                    <div>
                      <strong>name (etichetta)</strong>
                      <p className="text-slate-600 mt-1">Etichetta leggibile per gli utenti (es. <em>Monthly Recurring Revenue (MRR)</em>). Può essere aggiornata per chiarezza o traduzione senza perdere dati storici.</p>
                    </div>

                    <div>
                      <strong>value & target</strong>
                      <p className="text-slate-600 mt-1">Valori numerici. <em>value</em> è l'ultimo valore misurato; <em>target</em> è il valore obiettivo. Entrambi devono essere numeri (decimali consentiti). Il sistema confronta value vs target per calcolare lo status.</p>
                    </div>

                    <div>
                      <strong>unit</strong>
                      <p className="text-slate-600 mt-1">Unità di misura visuale (es. <code>€</code>, <code>pts</code>, <code>%</code>). Influisce solo sulla formattazione della visualizzazione.</p>
                    </div>

                    <div>
                      <strong>trend</strong>
                      <p className="text-slate-600 mt-1">Variazione rispetto al periodo precedente espressa come decimale (es. <code>0.05</code> = +5%, <code>-0.02</code> = -2%). Viene usato per arricchire la valutazione dello status (trend fortemente negativo può peggiorare lo stato).</p>
                    </div>

                    <div>
                      <strong>period</strong>
                      <p className="text-slate-600 mt-1">Periodo di riferimento del KPI (es. <code>2025-11</code>, <code>2025-Q4</code>). Serve per associarlo alla timeline e ai confronti storici.</p>
                    </div>

                    <div>
                      <strong>domain</strong>
                      <p className="text-slate-600 mt-1">Categoria o area aziendale (es. marketing, finance, hr). Aiuta a raggruppare KPI e a generare insight specifici per area.</p>
                    </div>

                    <div>
                      <strong>status</strong>
                      <p className="text-slate-600 mt-1">Calcolato automaticamente dal server in base a value/target e trend. Non inserire manualmente; il sistema assegna <em>healthy</em>, <em>warning</em> o <em>critical</em>.</p>
                    </div>

                    <div>
                      <strong>Regole e validazione</strong>
                      <ul className="list-disc ml-5 text-slate-600 mt-1">
                        <li>metric_id deve essere unico — il frontend segnalerà duplicati.</li>
                        <li>value/target devono essere numeri; trend è decimale.</li>
                        <li>period dovrebbe seguire pattern YYYY-MM o YYYY-Qn.</li>
                        <li>status è gestito dal server e non deve essere fornito dal CSV o dal form.</li>
                      </ul>
                    </div>

                    <div>
                      <strong>Esempi rapidi</strong>
                      <p className="text-slate-600 mt-1"><code>rev_mrr,Monthly Recurring Revenue (MRR),185000,200000,€,0.08,2025-11,finance</code></p>
                    </div>

                    <div>
                      <strong>Consigli UX</strong>
                      <p className="text-slate-600 mt-1">Usa lo <em>name</em> per spiegazioni e abbreviazioni; lascia lo <em>metric_id</em> come chiave stabile. Se non sei sicuro del metric_id, usa il nome e poi lascia che il sistema suggerisca uno slug (posso aggiungere questa funzione se vuoi).</p>
                    </div>
                  </section>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border bg-white p-4">
              <h3 className="text-sm font-semibold">Importa KPI (bulk)</h3>
              <p className="text-xs text-slate-500 mt-2">Incolla CSV (prima riga headers) oppure carica file CSV / XLSX.</p>
              <textarea
                value={kpiBulkText}
                onChange={(e) => setKpiBulkText(e.target.value)}
                className="mt-2 w-full rounded-md border p-2 text-sm font-mono"
                rows={4}
                placeholder="metric_id,name,value,target,unit,trend,period,domain"
              />
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={(e) => setKpiFile(e.target.files?.[0] ?? null)}
                />
                <button
                  onClick={() => void handleSubmitKpis()}
                  disabled={kpiUploading}
                  className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {kpiUploading ? 'Import in corso...' : 'Importa KPI'}
                </button>
                <span className="text-xs text-slate-400">{kpiFile ? kpiFile.name : ''}</span>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Insight AI</h2>
                <span className="text-xs uppercase text-slate-400">LLM + Algoritmi</span>
              </div>
              <div className="mt-3">
                <InsightList insights={insights} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Raccomandazioni</h2>
                <span className="text-xs uppercase text-slate-400">Priorità automatiche</span>
              </div>
              <div className="mt-3">
                <RecommendationList items={recommendations} onAccept={handleAcceptRecommendation} onDetails={(r) => { setSelectedRec(r); setShowRecModal(true); }} />
              </div>

              {showRecModal && selectedRec && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowRecModal(false)} />
                  <div className="relative w-[min(92%,720px)] rounded-2xl bg-white p-6 shadow-lg text-slate-900">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Dettaglio raccomandazione</h3>
                        <p className="text-sm text-slate-500 mt-1">ID: {selectedRec.id}</p>
                      </div>
                      <button onClick={() => setShowRecModal(false)} className="text-sm text-slate-500">Chiudi ✕</button>
                    </div>

                    <hr className="my-4" />
                    <h4 className="text-sm font-semibold">{selectedRec.title}</h4>
                    <p className="text-sm text-slate-600 mt-2">{selectedRec.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Metric</strong><div className="text-slate-600">{selectedRec.driver_metric_id}</div></div>
                      <div><strong>Confidence / Impact</strong><div className="text-slate-600">{Math.round(selectedRec.confidence*100)}% / {Math.round(selectedRec.impact_score*100)}%</div></div>
                      <div><strong>Priority</strong><div className="text-slate-600">{selectedRec.priority}</div></div>
                      <div><strong>Status</strong><div className="text-slate-600">{selectedRec.status}</div></div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      {selectedRec.status === 'proposed' && <button className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-semibold text-white" onClick={async () => { await handleAcceptRecommendation(selectedRec.id); setShowRecModal(false); }}>Accetta</button>}
                      <button className="rounded-md bg-white/20 px-3 py-1 text-sm" onClick={() => setShowRecModal(false)}>Chiudi</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduler help modal */}
              {showSchedulerHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowSchedulerHelp(false)} />
                  <div className="relative w-[min(92%,720px)] rounded-2xl bg-white p-6 shadow-lg text-slate-900">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Cos'è lo Scheduler?</h3>
                        <p className="text-sm text-slate-500 mt-1">Breve guida operativa</p>
                      </div>
                      <button onClick={() => setShowSchedulerHelp(false)} className="text-sm text-slate-500">Chiudi ✕</button>
                    </div>

                    <hr className="my-4" />
                    <div className="space-y-3 text-sm text-slate-700">
                      <p><strong>Che cosa fa:</strong> lo scheduler esegue periodicamente il "Copilot" per ciascun tenant — cioè lancia la catena LLM che crea sessioni, insight e raccomandazioni automaticamente.</p>
                      <p><strong>Frequenza:</strong> l'intervallo è configurabile via variabile d'ambiente <code>SCHEDULER_INTERVAL_MIN</code> (default 60 minuti) oppure avviato manualmente con <em>Run once</em>.</p>
                      <p><strong>Cosa persiste:</strong> ogni esecuzione salva una LLMSession, può generare InsightRecord e più RecommendationRecord nel DB.</p>
                      <p><strong>Ambito:</strong> lo scheduler itera sui tenant che hanno KPI registrati e lancia il processo per ciascuno; non esegue azioni destructive automaticamente.</p>
                      <p><strong>Controllo:</strong> usa i pulsanti <em>Start</em>/<em>Stop</em> per abilitare/disabilitare il worker in background o <em>Run once</em> per un'esecuzione immediata.</p>
                      <p className="text-xs text-slate-500">Nota: puoi disabilitare lo scheduler impostando variabile o fermandolo dalla UI; gli errori sono loggati nel backend.</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button className="rounded-md bg-white/20 px-3 py-1 text-sm" onClick={() => setShowSchedulerHelp(false)}>OK</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Piani d&apos;azione</h2>
                <span className="text-xs uppercase text-slate-400">Workflow</span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Piani d'azione</h3>
                <div>
                  <button className="mr-2 rounded-md bg-white/20 px-3 py-1 text-xs" onClick={() => openNewPlanModal()}>Nuovo piano</button>
                  <button className="rounded-md bg-white/20 px-3 py-1 text-xs" onClick={() => void handleSchedulerRunOnce()}>Run scheduler (once)</button>
                </div>
              </div>
              <ActionBoard plans={plans} onEdit={openEditPlanModal} />

              {showPlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowPlanModal(false)} />
                  <div className="relative w-[min(90%,680px)] rounded-2xl bg-white p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-slate-900">{editingPlan ? 'Modifica piano' : 'Nuovo piano'}</h4>
                      <button className="text-sm text-slate-500" onClick={() => setShowPlanModal(false)}>Chiudi ✕</button>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-xs text-slate-600">Raccomandazione</label>
                      <select className="w-full rounded-md border px-2 py-1 text-sm" value={planRecommendationId} onChange={(e) => setPlanRecommendationId(e.target.value)}>
                        {recommendations.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </select>

                      <label className="block text-xs text-slate-600">Owner</label>
                      <input className="w-full rounded-md border px-2 py-1 text-sm" value={planOwner} onChange={(e) => setPlanOwner(e.target.value)} />

                      <label className="block text-xs text-slate-600">Scadenza</label>
                      <input type="date" className="w-full rounded-md border px-2 py-1 text-sm" value={planDueDate} onChange={(e) => setPlanDueDate(e.target.value)} />

                      <label className="block text-xs text-slate-600">Milestones (una per riga)</label>
                      <textarea className="w-full rounded-md border px-2 py-2 text-sm" rows={5} value={planMilestonesText} onChange={(e) => setPlanMilestonesText(e.target.value)} />

                      <div className="flex justify-end gap-2">
                        {editingPlan && (
                          <button className="rounded-md bg-rose-100 text-rose-700 px-3 py-1 text-sm" onClick={async () => setShowDeleteConfirm(true)}>Elimina</button>
                        )}
                        <button className="rounded-md bg-white/20 px-3 py-1 text-sm" onClick={() => setShowPlanModal(false)}>Annulla</button>
                        <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => void submitPlan()}>Salva piano</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete confirmation modal */}
              {showDeleteConfirm && editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
                  <div className="relative w-[min(90%,420px)] rounded-2xl bg-white p-6 shadow-lg">
                    <h4 className="text-sm font-semibold">Conferma eliminazione</h4>
                    <p className="text-sm text-slate-600 mt-2">Sei sicuro di voler eliminare il piano <strong>{editingPlan.recommendation_id}</strong>? Questa azione è irreversibile.</p>
                    <div className="mt-4 flex justify-end gap-2">
                      <button className="rounded-md bg-white/20 px-3 py-1 text-sm" onClick={() => setShowDeleteConfirm(false)}>Annulla</button>
                      <button className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white" onClick={async () => {
                        try {
                          await deleteActionPlan(editingPlan.id);
                          const refreshed = await fetchActionPlans(tenantId);
                          setPlans(refreshed);
                          setShowDeleteConfirm(false);
                          setShowPlanModal(false);
                        } catch (err) {
                          console.error(err);
                          setError('Eliminazione fallita');
                        }
                      }}>Elimina definitivamente</button>
                    </div>
                  </div>
                </div>
              )}

            </div>
            <ConsultantDesk notes={notes} onAdd={(content) => handleAddNote(content)} />
          </section>

          {llmRun && (
            <section className="rounded-3xl border border-brand-100 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Copilot</h2>
                <span className="text-xs uppercase text-brand-600">Sessione {llmRun.session_id}</span>
              </div>
              <ol className="mt-4 space-y-3">
                {llmRun.steps.map((step) => (
                  <li key={step.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase text-slate-500">{step.name}</p>
                    <p className="mt-1 text-sm text-slate-700">{step.output}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
