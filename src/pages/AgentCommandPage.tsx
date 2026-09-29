import React, { useState, useEffect } from 'react';
import { runAgentWorkflow, approveAgentRecommendation, rejectAgentRecommendation } from '../services/api';
import { AgentDecisionSupport } from '../types';
import {
  Bot,
  ShieldCheck,
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowDown,
  FileCheck,
  Database,
  Building,
  RefreshCw,
  Users,
} from 'lucide-react';

interface AgentCommandPageProps {
  patientId: string;
  initialAgentData?: AgentDecisionSupport;
  onRefreshState?: () => void;
}

export const AgentCommandPage: React.FC<AgentCommandPageProps> = ({
  patientId,
  initialAgentData,
  onRefreshState,
}) => {
  const [objective, setObjective] = useState(
    'Optimize targeted therapy and trial prioritization under organ toxicity constraints'
  );
  const [competePatientB, setCompetePatientB] = useState(true);
  const [agentData, setAgentData] = useState<AgentDecisionSupport | null>(initialAgentData || null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [clinicianNotes, setClinicianNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialAgentData) {
      setAgentData(initialAgentData);
    }
  }, [initialAgentData, patientId]);

  const handleRunAgent = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await runAgentWorkflow(
        patientId,
        objective,
        competePatientB ? 'PT-NSCLC-0208' : undefined
      );
      setAgentData(res);
      if (onRefreshState) onRefreshState();
    } catch (e: any) {
      setMessage(`Agent workflow error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!agentData?.run_id) return;
    setActionLoading(true);
    try {
      const res = await approveAgentRecommendation(
        agentData.run_id,
        clinicianNotes || 'Approved by multidisciplinary tumor board.'
      );
      setAgentData({
        ...agentData,
        status: 'Approved',
        clinician_action: {
          decision: 'Approved',
          approver: 'Dr. Thoracic Oncologist',
          notes: clinicianNotes || 'Approved by tumor board.',
          timestamp: new Date().toISOString(),
        },
      });
      setMessage('Recommendation Approved and logged to safety audit trail.');
      if (onRefreshState) onRefreshState();
    } catch (e: any) {
      setMessage(`Approval error: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!agentData?.run_id) return;
    setActionLoading(true);
    try {
      const res = await rejectAgentRecommendation(
        agentData.run_id,
        clinicianNotes || 'Rejected by attending physician.'
      );
      setAgentData({
        ...agentData,
        status: 'Rejected',
        clinician_action: {
          decision: 'Rejected',
          approver: 'Dr. Thoracic Oncologist',
          notes: clinicianNotes || 'Rejected by attending physician.',
          timestamp: new Date().toISOString(),
        },
      });
      setMessage('Recommendation Rejected and logged to safety audit trail.');
      if (onRefreshState) onRefreshState();
    } catch (e: any) {
      setMessage(`Rejection error: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Stage 6 — Agentic AI Command Center</h2>
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
                ReAct State Machine & Human Gate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous reasoning & multi-tool orchestration with mandatory human clinician approval gate.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-md"
        >
          <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running ReAct Loop...' : 'Execute Agent Workflow'}
        </button>
      </div>

      {/* Safety Policy Banner */}
      <div className="bg-rose-950/30 border border-rose-500/40 p-3.5 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-rose-300">Enforced Clinical Policy:</strong> The agent cannot autonomously prescribe drugs or enroll patients. All synthesized proposals remain strictly gated until signed off by a verified human oncologist.
        </div>
      </div>

      {message && (
        <div className="bg-teal-950/40 border border-teal-500/40 p-3 rounded-lg text-teal-300 text-xs">
          {message}
        </div>
      )}

      {/* Objective & Multi-Patient Simulator Setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-white">Agent Execution Context</h3>
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={competePatientB}
                onChange={(e) => setCompetePatientB(e.target.checked)}
                className="rounded accent-teal-500"
              />
              Simulate 2-Patient Competition for 1 Open Trial Slot (Patient A vs Patient B)
            </label>
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-xs block mb-1">Clinical Goal:</label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-sans"
          />
        </div>
      </div>

      {/* ReAct Execution Flow (Trace & Visual Pipeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step-by-Step Tool Trace */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-teal-400" />
            ReAct Reasoning & Tool Execution Log
          </h3>

          <div className="space-y-3">
            {agentData?.traces && agentData.traces.length > 0 ? (
              agentData.traces.map((trace) => (
                <div
                  key={trace.step}
                  className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-mono font-bold text-[10px]">
                        {trace.step}
                      </span>
                      <strong className="text-slate-200">{trace.tool}</strong>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {trace.latency_ms} ms
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px] text-slate-300">
                    <span className="text-slate-400 font-medium">Reasoning: </span>
                    {trace.reasoning}
                  </div>

                  <div className="bg-slate-900/50 p-2 rounded text-[10px] text-teal-300 font-mono overflow-x-auto max-h-24">
                    {JSON.stringify(trace.output, null, 2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Click "Execute Agent Workflow" to start the ReAct decision cycle.
              </div>
            )}
          </div>
        </div>

        {/* Human Approval Gate Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Human Approval Gate
              </h3>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  agentData?.status === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : agentData?.status === 'Rejected'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {agentData?.status || 'Awaiting Review'}
              </span>
            </div>

            {/* Recommendation Summary */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs space-y-2 mb-4">
              <span className="text-slate-400 font-medium block">Synthesized Proposal:</span>
              <p className="text-slate-200 font-sans leading-relaxed text-[11px] whitespace-pre-line">
                {agentData?.decision_support_summary ||
                  'Execute agent to generate evidence-backed trial and medication options.'}
              </p>
            </div>

            {/* Candidate Options */}
            {agentData?.recommended_trial && (
              <div className="bg-teal-950/30 border border-teal-500/30 p-3 rounded-lg text-xs mb-3">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <span className="text-teal-400 font-semibold text-[11px]">
                    Prioritized Trial Protocol:
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                    SIMULATED TRIAL — DEMONSTRATION ONLY
                  </span>
                </div>
                <p className="text-slate-200 text-[11px] font-medium">{agentData.recommended_trial.title}</p>
                <span className="text-[10px] text-teal-300 font-mono block mt-1">
                  Slots: {agentData.recommended_trial.available_slots} Open | Inclusion: Verified
                </span>
                <p className="text-[10px] text-amber-400 font-mono mt-1">
                  * SIMULATED TRIAL — DEMONSTRATION ONLY. Human Approval Gate mandatory.
                </p>
              </div>
            )}

            {/* Clinician Review Notes Input */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-400 font-medium">Attending Clinician Sign-Off Notes:</label>
              <textarea
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                placeholder="Enter tumor board consensus or dosing rationale..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Action Gate Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleApprove}
                disabled={actionLoading || !agentData}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !agentData}
                className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center font-mono">
              Action creates an immutable entry in the HIPAA audit ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
