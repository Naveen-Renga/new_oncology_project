import {
  PatientState,
  MLPrediction,
  DLPrediction,
  NLPEntities,
  SLMSummary,
  GenAIScenario,
  AgentDecisionSupport,
  AuditLogItem,
  HealthState
} from '../types';

const BASE_URL = '';

export async function fetchHealth(): Promise<HealthState> {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchPatients(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/api/patient`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function fetchPatientState(patientId: string): Promise<PatientState> {
  const res = await fetch(`${BASE_URL}/api/patient/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch state for patient ${patientId}`);
  return res.json();
}

export async function savePatient(payload: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/patient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.error || 'Validation error saving patient');
  }
  return res.json();
}

export async function runMLPredict(payload: any): Promise<MLPredictResponse> {
  const res = await fetch(`${BASE_URL}/api/ml/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.error || 'ML prediction failed');
  }
  return res.json();
}

export interface MLPredictResponse extends MLPrediction {}

export async function runDLAnalyze(payload: any): Promise<DLPrediction> {
  const res = await fetch(`${BASE_URL}/api/dl/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('DL analysis failed');
  return res.json();
}

export async function runNLPAnalyze(clinicalNote: string, patientId?: string): Promise<NLPEntities> {
  const res = await fetch(`${BASE_URL}/api/nlp/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clinical_note: clinicalNote, patient_id: patientId })
  });
  if (!res.ok) throw new Error('NLP analysis failed');
  return res.json();
}

export async function runSLMSummarize(payload: any): Promise<SLMSummary> {
  const res = await fetch(`${BASE_URL}/api/slm/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('SLM summarization failed');
  return res.json();
}

export async function runGenAIGenerate(payload: any): Promise<GenAIScenario> {
  const res = await fetch(`${BASE_URL}/api/genai/generate-scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('GenAI scenario generation failed');
  return res.json();
}

export async function runAgentWorkflow(patientId: string, objective: string, candidateBId?: string): Promise<AgentDecisionSupport> {
  const res = await fetch(`${BASE_URL}/api/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: patientId,
      clinical_objective: objective,
      candidate_patient_b_id: candidateBId
    })
  });
  if (!res.ok) throw new Error('Agent run failed');
  return res.json();
}

export async function approveAgentRecommendation(runId: string, notes?: string, approver?: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/agent/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_run_id: runId,
      clinician_notes: notes,
      approver_username: approver || 'Dr. OncoClinician'
    })
  });
  if (!res.ok) throw new Error('Approval action failed');
  return res.json();
}

export async function rejectAgentRecommendation(runId: string, notes?: string, approver?: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/agent/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_run_id: runId,
      clinician_notes: notes,
      approver_username: approver || 'Dr. OncoClinician'
    })
  });
  if (!res.ok) throw new Error('Rejection action failed');
  return res.json();
}

export async function fetchAuditLogs(stage?: string): Promise<AuditLogItem[]> {
  const url = stage ? `${BASE_URL}/api/audit?stage=${stage}` : `${BASE_URL}/api/audit`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchMetrics(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}
