import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { PatientInputPage } from './pages/PatientInputPage';
import { MLRiskPage } from './pages/MLRiskPage';
import { DLAnalysisPage } from './pages/DLAnalysisPage';
import { NLPNotesPage } from './pages/NLPNotesPage';
import { SLMSummaryPage } from './pages/SLMSummaryPage';
import { GenAIScenariosPage } from './pages/GenAIScenariosPage';
import { AgentCommandPage } from './pages/AgentCommandPage';
import { ApprovalGatePage } from './pages/ApprovalGatePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ModelMetricsPage } from './pages/ModelMetricsPage';
import { SettingsPage } from './pages/SettingsPage';

import { fetchPatientState, fetchHealth, fetchPatients } from './services/api';
import { PatientState, HealthState } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [currentPatientId, setCurrentPatientId] = useState<string>('PT-NSCLC-0104');
  const [availablePatients, setAvailablePatients] = useState<string[]>([
    'PT-NSCLC-0104',
    'PT-NSCLC-0208',
  ]);
  const [patientState, setPatientState] = useState<PatientState | null>(null);
  const [health, setHealth] = useState<HealthState | null>(null);
  const [activeRole, setActiveRole] = useState<string>('Dr. Thoracic Oncologist');
  const [loading, setLoading] = useState<boolean>(true);

  const loadPatientState = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchPatientState(id);
      setPatientState(data);
    } catch (err) {
      console.error('Error fetching patient state:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemData = async () => {
    try {
      const [healthData, patientsData] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchPatients().catch(() => []),
      ]);
      if (healthData) setHealth(healthData);
      if (patientsData && patientsData.length > 0) {
        setAvailablePatients(patientsData.map((p: any) => p.patient_id));
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  useEffect(() => {
    loadPatientState(currentPatientId);
  }, [currentPatientId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Universal Top Header */}
      <Header
        currentPatientId={currentPatientId}
        onSelectPatient={setCurrentPatientId}
        availablePatients={availablePatients}
        health={health}
        activeRole={activeRole}
        onChangeRole={setActiveRole}
      />

      {/* Primary Navigation Across 12 Views */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingApprovalsCount={
          patientState?.agent_decision_support?.status === 'Approved' ? 0 : 1
        }
      />

      {/* Main View Port */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardPage
            state={patientState}
            loading={loading}
            onNavigate={setActiveTab}
            onRunPipeline={() => loadPatientState(currentPatientId)}
          />
        )}

        {activeTab === 'patient-input' && (
          <PatientInputPage
            onPatientSaved={(newId) => {
              if (!availablePatients.includes(newId)) {
                setAvailablePatients([...availablePatients, newId]);
              }
              setCurrentPatientId(newId);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'ml-risk' && (
          <MLRiskPage key={currentPatientId} initialData={patientState} />
        )}

        {activeTab === 'dl-analysis' && (
          <DLAnalysisPage key={currentPatientId} initialData={patientState} />
        )}

        {activeTab === 'nlp-notes' && (
          <NLPNotesPage
            key={currentPatientId}
            initialNote={patientState?.clinical_note}
            initialEntities={patientState?.nlp_entities}
          />
        )}

        {activeTab === 'slm-summary' && (
          <SLMSummaryPage
            key={currentPatientId}
            initialSummary={patientState?.slm_summary}
            initialEntities={patientState?.nlp_entities}
          />
        )}

        {activeTab === 'genai-scenarios' && (
          <GenAIScenariosPage
            key={currentPatientId}
            initialScenario={patientState?.genai_scenarios?.[0]}
          />
        )}

        {activeTab === 'agent-command' && (
          <AgentCommandPage
            key={currentPatientId}
            patientId={currentPatientId}
            initialAgentData={patientState?.agent_decision_support}
            onRefreshState={() => loadPatientState(currentPatientId)}
          />
        )}

        {activeTab === 'approval-gate' && (
          <ApprovalGatePage
            key={currentPatientId}
            currentPatientId={currentPatientId}
            agentData={patientState?.agent_decision_support}
            onRefreshState={() => loadPatientState(currentPatientId)}
          />
        )}

        {activeTab === 'audit-logs' && <AuditLogsPage />}

        {activeTab === 'metrics' && <ModelMetricsPage />}

        {activeTab === 'settings' && (
          <SettingsPage
            health={health}
            onRefreshHealth={loadSystemData}
          />
        )}
      </main>

      {/* Persistent Bottom Safety Notice */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 z-30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>OncoPrecision Integrated Prototype</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-300">
            Current Role: {activeRole}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px]">
          <span>ML: {patientState?.ml_risk?.model || 'Calibrated Classifier'}</span>
          <span>DL: CNN+BiLSTM (Demo)</span>
          <span>NLP: NegEx NER (Demo)</span>
          <span>SLM: SmolLM2-135M (Demo)</span>
          <span>GenAI: Gemini / Syn (Demo)</span>
          <span>Agent: ReAct (Simulation)</span>
        </div>
      </footer>
    </div>
  );
}
