import { createContext, useContext } from 'react';

export type Lang = 'it' | 'en';

export interface Translations {
  // Header
  tenantLabel: string;
  manageBtn: string;
  appTitle: string;
  appSubtitle: string;
  refreshBtn: string;
  copilotBtn: string;
  copilotLoadingBtn: string;
  // Tenant manager
  manageTenantsTitle: string;
  closeBtn: string;
  newTenantPlaceholder: string;
  addBtn: string;
  saveBtn: string;
  cancelBtn: string;
  editBtn: string;
  deleteBtn: string;
  // Diagnostic bar
  schedulerRunning: string;
  schedulerStopped: string;
  // Errors
  errCannotReachBackend: string;
  errInvalidTenantName: string;
  errTenantExists: string;
  errNameInvalid: string;
  errNameExists: string;
  errAcceptRec: string;
  errSavePlan: string;
  errDeletePlan: string;
  errStartScheduler: string;
  errStopScheduler: string;
  errRunOnce: string;
  errCopilot: string;
  errImportKpi: string;
  errManualKpi: string;
  // Loading
  loadingData: string;
  // KPI section
  kpiTitle: string;
  kpiLastUpdate: string;
  kpiAddManualTitle: string;
  kpiAddManualDesc: string;
  kpiAddRow: string;
  kpiSendBtn: string;
  kpiSendingBtn: string;
  kpiBulkNote: string;
  kpiBulkTitle: string;
  kpiBulkDesc: string;
  kpiImportBtn: string;
  kpiImportingBtn: string;
  kpiRemoveRow: string;
  // KPI help modal
  kpiHelpTitle: string;
  kpiHelpSubtitle: string;
  kpiHelpMetricIdDesc: string;
  kpiHelpNameDesc: string;
  kpiHelpValueTargetDesc: string;
  kpiHelpUnitDesc: string;
  kpiHelpTrendDesc: string;
  kpiHelpPeriodDesc: string;
  kpiHelpDomainDesc: string;
  kpiHelpStatusDesc: string;
  kpiHelpRulesTitle: string;
  kpiHelpRule1: string;
  kpiHelpRule2: string;
  kpiHelpRule3: string;
  kpiHelpRule4: string;
  kpiHelpExamplesTitle: string;
  kpiHelpUxTitle: string;
  kpiHelpUxDesc: string;
  // Insights
  insightsTitle: string;
  insightsSubtitle: string;
  noInsights: string;
  insightImpact: string;
  insightPriority: string;
  // Recommendations
  recsTitle: string;
  recsSubtitle: string;
  noRecs: string;
  recDetailTitle: string;
  recDetailId: string;
  acceptBtn: string;
  detailsBtn: string;
  recMetricLabel: string;
  recConfidenceLabel: string;
  recPriorityLabel: string;
  recStatusLabel: string;
  // Scheduler help
  schedulerHelpTitle: string;
  schedulerHelpSubtitle: string;
  schedulerHelpWhat: string;
  schedulerHelpFreq: string;
  schedulerHelpPersists: string;
  schedulerHelpScope: string;
  schedulerHelpControl: string;
  schedulerHelpNote: string;
  // Action plans
  plansTitle: string;
  plansSubtitle: string;
  newPlanBtn: string;
  runSchedulerOnceBtn: string;
  editPlanTitle: string;
  newPlanTitle: string;
  planRecLabel: string;
  planOwnerLabel: string;
  planDueLabel: string;
  planMilestonesLabel: string;
  planSaveBtn: string;
  noPlans: string;
  planOwnerPrefix: string;
  planDuePrefix: string;
  planModifyBtn: string;
  // Delete confirm
  deleteConfirmTitle: string;
  deleteConfirmPre: string;
  deleteConfirmPost: string;
  deleteConfirmBtn: string;
  // Consultant Desk
  deskTitle: string;
  deskSubtitle: string;
  deskPlaceholder: string;
  deskSaveBtn: string;
  deskSavingBtn: string;
  noNotes: string;
  // Copilot session
  copilotSessionTitle: string;
  copilotSessionLabel: string;
  // KpiCard
  kpiVsPrev: string;
  kpiTarget: string;
  kpiStatusHealthy: string;
  kpiStatusWarning: string;
  kpiStatusCritical: string;
  kpiReasonAboveTarget: string;
  kpiReasonNearTarget: string;
  kpiReasonBelowTarget: string;
  kpiReasonNegTrend: string;
  kpiReasonPosTrend: string;
}

const it: Translations = {
  tenantLabel: 'Tenant ·',
  manageBtn: 'Gestisci',
  appTitle: 'Console di consulenza intelligente',
  appSubtitle: 'Insight live, automazioni e area privata per il consulente.',
  refreshBtn: 'Aggiorna dati',
  copilotBtn: 'Chiedi al Copilot',
  copilotLoadingBtn: 'Copilot in corso...',
  manageTenantsTitle: 'Gestisci tenant',
  closeBtn: 'Chiudi ✕',
  newTenantPlaceholder: 'Nuovo tenant',
  addBtn: 'Aggiungi',
  saveBtn: 'Salva',
  cancelBtn: 'Annulla',
  editBtn: 'Modifica',
  deleteBtn: 'Elimina',
  schedulerRunning: 'running',
  schedulerStopped: 'stopped',
  errCannotReachBackend: 'Impossibile contattare il backend.',
  errInvalidTenantName: 'Inserisci un nome valido',
  errTenantExists: 'Tenant già esistente',
  errNameInvalid: 'Nome non valido',
  errNameExists: 'Nome già esistente',
  errAcceptRec: 'Impossibile accettare la raccomandazione.',
  errSavePlan: 'Impossibile salvare il piano.',
  errDeletePlan: 'Eliminazione fallita',
  errStartScheduler: 'Impossibile avviare lo scheduler',
  errStopScheduler: 'Impossibile fermare lo scheduler',
  errRunOnce: 'Run-once fallito',
  errCopilot: 'Copilot non disponibile.',
  errImportKpi: 'Import KPI fallita. Controlla formato.',
  errManualKpi: 'Invio KPI manuale fallito.',
  loadingData: 'Caricamento dati...',
  kpiTitle: 'KPI chiave',
  kpiLastUpdate: 'Ultimo aggiornamento realtime',
  kpiAddManualTitle: 'Aggiungi KPI manualmente (multipli)',
  kpiAddManualDesc: 'Aggiungi più righe e invia tutte insieme. Lo status viene calcolato automaticamente.',
  kpiAddRow: 'Aggiungi riga',
  kpiSendBtn: 'Invia KPI',
  kpiSendingBtn: 'Invio...',
  kpiBulkNote: "Puoi anche usare l'area Importa KPI (bulk) per CSV/XLSX.",
  kpiBulkTitle: 'Importa KPI (bulk)',
  kpiBulkDesc: 'Incolla CSV (prima riga headers) oppure carica file CSV / XLSX.',
  kpiImportBtn: 'Importa KPI',
  kpiImportingBtn: 'Import in corso...',
  kpiRemoveRow: 'Rimuovi',
  kpiHelpTitle: "Guida all'inserimento KPI",
  kpiHelpSubtitle: 'Consigli e regole per inserire correttamente i KPI nel sistema.',
  kpiHelpMetricIdDesc: 'Identificatore univoco e stabile del KPI. Formato consigliato: lowercase, underscore o kebab (es. rev_mrr, active_users). Evita di cambiarlo dopo la creazione: serve per la cronologia.',
  kpiHelpNameDesc: 'Etichetta leggibile per gli utenti (es. Monthly Recurring Revenue). Può essere aggiornata senza perdere dati storici.',
  kpiHelpValueTargetDesc: 'Valori numerici. value è l\'ultimo valore misurato; target è il valore obiettivo. Il sistema confronta value vs target per calcolare lo status.',
  kpiHelpUnitDesc: "Unità di misura visuale (es. €, pts, %). Influisce solo sulla formattazione della visualizzazione.",
  kpiHelpTrendDesc: 'Variazione rispetto al periodo precedente come decimale (es. 0.05 = +5%, -0.02 = -2%).',
  kpiHelpPeriodDesc: 'Periodo di riferimento del KPI (es. 2025-11, 2025-Q4). Serve per la timeline e i confronti storici.',
  kpiHelpDomainDesc: 'Categoria o area aziendale (es. marketing, finance, hr). Aiuta a raggruppare KPI.',
  kpiHelpStatusDesc: 'Calcolato automaticamente dal server. Non inserire manualmente; il sistema assegna healthy, warning o critical.',
  kpiHelpRulesTitle: 'Regole e validazione',
  kpiHelpRule1: 'metric_id deve essere unico — il frontend segnalerà duplicati.',
  kpiHelpRule2: 'value/target devono essere numeri; trend è decimale.',
  kpiHelpRule3: 'period dovrebbe seguire pattern YYYY-MM o YYYY-Qn.',
  kpiHelpRule4: 'status è gestito dal server e non deve essere fornito dal CSV o dal form.',
  kpiHelpExamplesTitle: 'Esempi rapidi',
  kpiHelpUxTitle: 'Consigli UX',
  kpiHelpUxDesc: 'Usa name per spiegazioni e abbreviazioni; lascia metric_id come chiave stabile.',
  insightsTitle: 'Insight AI',
  insightsSubtitle: 'LLM + Algoritmi',
  noInsights: 'Nessun insight generato.',
  insightImpact: 'Impatto',
  insightPriority: 'Priorità',
  recsTitle: 'Raccomandazioni',
  recsSubtitle: 'Priorità automatiche',
  noRecs: 'Nessuna raccomandazione attiva.',
  recDetailTitle: 'Dettaglio raccomandazione',
  recDetailId: 'ID:',
  acceptBtn: 'Accetta',
  detailsBtn: 'Dettagli',
  recMetricLabel: 'Metric',
  recConfidenceLabel: 'Confidence / Impact',
  recPriorityLabel: 'Priority',
  recStatusLabel: 'Status',
  schedulerHelpTitle: "Cos'è lo Scheduler?",
  schedulerHelpSubtitle: 'Breve guida operativa',
  schedulerHelpWhat: 'lo scheduler esegue periodicamente il "Copilot" per ciascun tenant — cioè lancia la catena LLM che crea sessioni, insight e raccomandazioni automaticamente.',
  schedulerHelpFreq: "l'intervallo è configurabile via variabile d'ambiente SCHEDULER_INTERVAL_MIN (default 60 minuti) oppure avviato manualmente con Run once.",
  schedulerHelpPersists: 'ogni esecuzione salva una LLMSession, può generare InsightRecord e più RecommendationRecord nel DB.',
  schedulerHelpScope: 'lo scheduler itera sui tenant che hanno KPI registrati e lancia il processo per ciascuno; non esegue azioni destructive automaticamente.',
  schedulerHelpControl: 'usa i pulsanti Start/Stop per abilitare/disabilitare il worker in background o Run once per un\'esecuzione immediata.',
  schedulerHelpNote: 'Nota: puoi disabilitare lo scheduler impostando variabile o fermandolo dalla UI; gli errori sono loggati nel backend.',
  plansTitle: "Piani d'azione",
  plansSubtitle: 'Workflow',
  newPlanBtn: 'Nuovo piano',
  runSchedulerOnceBtn: 'Run scheduler (once)',
  editPlanTitle: 'Modifica piano',
  newPlanTitle: 'Nuovo piano',
  planRecLabel: 'Raccomandazione',
  planOwnerLabel: 'Owner',
  planDueLabel: 'Scadenza',
  planMilestonesLabel: 'Milestones (una per riga)',
  planSaveBtn: 'Salva piano',
  noPlans: 'Nessun piano attivo.',
  planOwnerPrefix: 'Owner',
  planDuePrefix: 'Scadenza',
  planModifyBtn: 'Modifica',
  deleteConfirmTitle: 'Conferma eliminazione',
  deleteConfirmPre: 'Sei sicuro di voler eliminare il piano',
  deleteConfirmPost: '? Questa azione è irreversibile.',
  deleteConfirmBtn: 'Elimina definitivamente',
  deskTitle: 'Desk Consulente',
  deskSubtitle: 'Note private e workflow',
  deskPlaceholder: 'Aggiungi insight o to-do...',
  deskSaveBtn: 'Salva nota',
  deskSavingBtn: 'Salvataggio...',
  noNotes: 'Ancora nessuna nota salvata.',
  copilotSessionTitle: 'Copilot',
  copilotSessionLabel: 'Sessione',
  kpiVsPrev: 'vs periodo precedente',
  kpiTarget: 'target',
  kpiStatusHealthy: 'healthy',
  kpiStatusWarning: 'warning',
  kpiStatusCritical: 'critical',
  kpiReasonAboveTarget: 'Valore >= target — KPI dentro obiettivo.',
  kpiReasonNearTarget: "Sotto target, ma vicino all'obiettivo.",
  kpiReasonBelowTarget: 'Sotto target — possibile area critica.',
  kpiReasonNegTrend: 'Trend negativo significativo',
  kpiReasonPosTrend: 'Trend positivo',
};

const en: Translations = {
  tenantLabel: 'Tenant ·',
  manageBtn: 'Manage',
  appTitle: 'Intelligent Advisory Console',
  appSubtitle: 'Live insights, automations and private workspace for the consultant.',
  refreshBtn: 'Refresh data',
  copilotBtn: 'Ask Copilot',
  copilotLoadingBtn: 'Copilot running...',
  manageTenantsTitle: 'Manage tenants',
  closeBtn: 'Close ✕',
  newTenantPlaceholder: 'New tenant',
  addBtn: 'Add',
  saveBtn: 'Save',
  cancelBtn: 'Cancel',
  editBtn: 'Edit',
  deleteBtn: 'Delete',
  schedulerRunning: 'running',
  schedulerStopped: 'stopped',
  errCannotReachBackend: 'Unable to reach the backend.',
  errInvalidTenantName: 'Enter a valid name',
  errTenantExists: 'Tenant already exists',
  errNameInvalid: 'Invalid name',
  errNameExists: 'Name already exists',
  errAcceptRec: 'Unable to accept the recommendation.',
  errSavePlan: 'Unable to save the plan.',
  errDeletePlan: 'Deletion failed',
  errStartScheduler: 'Unable to start the scheduler',
  errStopScheduler: 'Unable to stop the scheduler',
  errRunOnce: 'Run-once failed',
  errCopilot: 'Copilot not available.',
  errImportKpi: 'KPI import failed. Check format.',
  errManualKpi: 'Manual KPI submission failed.',
  loadingData: 'Loading data...',
  kpiTitle: 'Key KPIs',
  kpiLastUpdate: 'Last update realtime',
  kpiAddManualTitle: 'Add KPIs manually (multiple)',
  kpiAddManualDesc: 'Add multiple rows and submit them all at once. Status is calculated automatically.',
  kpiAddRow: 'Add row',
  kpiSendBtn: 'Submit KPIs',
  kpiSendingBtn: 'Submitting...',
  kpiBulkNote: 'You can also use the Import KPIs (bulk) area for CSV/XLSX.',
  kpiBulkTitle: 'Import KPIs (bulk)',
  kpiBulkDesc: 'Paste CSV (first row headers) or upload a CSV / XLSX file.',
  kpiImportBtn: 'Import KPIs',
  kpiImportingBtn: 'Importing...',
  kpiRemoveRow: 'Remove',
  kpiHelpTitle: 'KPI entry guide',
  kpiHelpSubtitle: 'Tips and rules for correctly entering KPIs into the system.',
  kpiHelpMetricIdDesc: 'Unique and stable KPI identifier. Recommended format: lowercase, underscore or kebab (e.g. rev_mrr, active_users). Avoid changing it after creation: it is used for history and linking recommendations.',
  kpiHelpNameDesc: 'Human-readable label for users (e.g. Monthly Recurring Revenue). Can be updated without losing historical data.',
  kpiHelpValueTargetDesc: 'Numeric values. value is the last measured value; target is the goal. The system compares value vs target to calculate status.',
  kpiHelpUnitDesc: 'Display unit (e.g. €, pts, %). Only affects visual formatting.',
  kpiHelpTrendDesc: 'Change from previous period as a decimal (e.g. 0.05 = +5%, -0.02 = -2%).',
  kpiHelpPeriodDesc: 'Reference period for the KPI (e.g. 2025-11, 2025-Q4). Used for timeline and historical comparisons.',
  kpiHelpDomainDesc: 'Business category or area (e.g. marketing, finance, hr). Helps group KPIs.',
  kpiHelpStatusDesc: 'Automatically calculated by the server. Do not enter manually; the system assigns healthy, warning or critical.',
  kpiHelpRulesTitle: 'Rules and validation',
  kpiHelpRule1: 'metric_id must be unique — the frontend will flag duplicates.',
  kpiHelpRule2: 'value/target must be numbers; trend is a decimal.',
  kpiHelpRule3: 'period should follow the pattern YYYY-MM or YYYY-Qn.',
  kpiHelpRule4: 'status is managed by the server and must not be provided in the CSV or form.',
  kpiHelpExamplesTitle: 'Quick examples',
  kpiHelpUxTitle: 'UX tips',
  kpiHelpUxDesc: 'Use name for descriptions and abbreviations; keep metric_id as a stable key.',
  insightsTitle: 'AI Insights',
  insightsSubtitle: 'LLM + Algorithms',
  noInsights: 'No insights generated.',
  insightImpact: 'Impact',
  insightPriority: 'Priority',
  recsTitle: 'Recommendations',
  recsSubtitle: 'Auto-prioritised',
  noRecs: 'No active recommendations.',
  recDetailTitle: 'Recommendation detail',
  recDetailId: 'ID:',
  acceptBtn: 'Accept',
  detailsBtn: 'Details',
  recMetricLabel: 'Metric',
  recConfidenceLabel: 'Confidence / Impact',
  recPriorityLabel: 'Priority',
  recStatusLabel: 'Status',
  schedulerHelpTitle: 'What is the Scheduler?',
  schedulerHelpSubtitle: 'Quick operational guide',
  schedulerHelpWhat: 'the scheduler periodically runs the "Copilot" for each tenant — it launches the LLM chain that automatically creates sessions, insights and recommendations.',
  schedulerHelpFreq: 'the interval is configurable via the SCHEDULER_INTERVAL_MIN environment variable (default 60 minutes) or started manually with Run once.',
  schedulerHelpPersists: 'each run saves a LLMSession and can generate InsightRecord and multiple RecommendationRecord entries in the DB.',
  schedulerHelpScope: 'the scheduler iterates over tenants that have registered KPIs and runs the process for each; it does not perform destructive actions automatically.',
  schedulerHelpControl: 'use the Start/Stop buttons to enable/disable the background worker or Run once for an immediate execution.',
  schedulerHelpNote: 'Note: you can disable the scheduler by setting the variable or stopping it from the UI; errors are logged in the backend.',
  plansTitle: 'Action Plans',
  plansSubtitle: 'Workflow',
  newPlanBtn: 'New plan',
  runSchedulerOnceBtn: 'Run scheduler (once)',
  editPlanTitle: 'Edit plan',
  newPlanTitle: 'New plan',
  planRecLabel: 'Recommendation',
  planOwnerLabel: 'Owner',
  planDueLabel: 'Due date',
  planMilestonesLabel: 'Milestones (one per line)',
  planSaveBtn: 'Save plan',
  noPlans: 'No active plans.',
  planOwnerPrefix: 'Owner',
  planDuePrefix: 'Due',
  planModifyBtn: 'Edit',
  deleteConfirmTitle: 'Confirm deletion',
  deleteConfirmPre: 'Are you sure you want to delete the plan',
  deleteConfirmPost: '? This action is irreversible.',
  deleteConfirmBtn: 'Delete permanently',
  deskTitle: 'Consultant Desk',
  deskSubtitle: 'Private notes and workflow',
  deskPlaceholder: 'Add an insight or to-do...',
  deskSaveBtn: 'Save note',
  deskSavingBtn: 'Saving...',
  noNotes: 'No notes saved yet.',
  copilotSessionTitle: 'Copilot',
  copilotSessionLabel: 'Session',
  kpiVsPrev: 'vs previous period',
  kpiTarget: 'target',
  kpiStatusHealthy: 'healthy',
  kpiStatusWarning: 'warning',
  kpiStatusCritical: 'critical',
  kpiReasonAboveTarget: 'Value >= target — KPI within goal.',
  kpiReasonNearTarget: 'Below target, but close to goal.',
  kpiReasonBelowTarget: 'Below target — possible critical area.',
  kpiReasonNegTrend: 'Significant negative trend',
  kpiReasonPosTrend: 'Positive trend',
};

export const translations: Record<Lang, Translations> = { it, en };

export const LangContext = createContext<Translations>(it);

export function useLang(): Translations {
  return useContext(LangContext);
}
