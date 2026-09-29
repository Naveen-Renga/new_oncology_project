import React, { useState } from 'react';
import { approveAgentRecommendation, rejectAgentRecommendation } from '../services/api';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Clock, UserCheck, FileText } from 'lucide-react';

interface ApprovalGatePageProps {
  currentPatientId: string;
  agentData: any;
  onRefreshState: () => void;
}

export const ApprovalGatePage: React.FC<ApprovalGatePageProps> = ({
  currentPatientId,
  agentData,
  onRefreshState,
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isPending = agentData?.status === 'Awaiting Human Approval' || !agentData?.status;
  const runId = agentData?.run_id || 'RUN-CURRENT';

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveAgentRecommendation(runId, notes || 'Approved by multidisciplinary tumor board.');
      setFeedback('Recommendation officially APPROVED and registered in the safety audit log.');
      onRefreshState();
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectAgentRecommendation(runId, notes || 'Rejected by attending physician.');
      setFeedback('Recommendation REJECTED and recorded in safety audit log.');
      onRefreshState();
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Human Approval Gate</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                isPending ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {agentData?.status || 'Awaiting Review'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mandatory clinical sign-off gate preventing autonomous prescription or trial enrollment.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-teal-950/40 border border-teal-500/40 p-4 rounded-xl text-teal-300 text-xs">
          {feedback}
        </div>
      )}

      {/* Pending Decision Proposal */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-slate-400">Action Reference: {runId}</span>
            <h3 className="text-sm font-bold text-white mt-0.5">
              Subject: {currentPatientId} — Targeted Therapy & Clinical Trial Prioritization
            </h3>
          </div>
          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs font-mono">
            Requires MD / Oncologist Sign-off
          </span>
        </div>

        {/* Evidence Synthesis */}
        <div className="space-y-3 text-xs">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <span className="text-slate-400 font-semibold block">Decision-Support Proposal Synthesis:</span>
            <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {agentData?.decision_support_summary ||
                `1. Patient ${currentPatientId} identified with high-risk molecular kinetics.\n2. Guideline evidence indicates targeted TKI combination standard.\n3. Proposed Trial: FLAURA2 Phase III expansion slot 1 verified for organ tolerance.\n4. Standard medication Osimertinib 80mg confirmed in-stock under formulary Tier 4.\nRecommendation requires independent clinician sign-off prior to patient consultation.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                <span className="text-slate-400 font-medium text-[11px]">Recommended Trial Protocol:</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  SIMULATED TRIAL — DEMONSTRATION ONLY
                </span>
              </div>
              <p className="text-teal-300 font-semibold text-xs">
                {agentData?.recommended_trial?.title || 'Phase III Trial: Targeted Therapy Escalation'}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Slots: {agentData?.recommended_trial?.available_slots ?? 1} Open | Inclusion Criteria: Met
              </span>
              <p className="text-[10px] text-amber-400/90 font-mono mt-1">
                * SIMULATED TRIAL — DEMONSTRATION ONLY. Requires human oncologist approval.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Recommended Formulation:</span>
              <p className="text-sky-300 font-semibold">
                {agentData?.recommended_therapy?.drug || 'Standard Targeted Regimen'}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Formulary: Tier 4 Specialty | Prior Auth: Required
              </span>
            </div>
          </div>
        </div>

        {/* Clinician Review & Decision Form */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Multidisciplinary Review Notes / Dosing Modifications:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document rationale, patient discussion summary, or required dose modification..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg text-xs transition-all shadow-md disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Clinical Proposal
            </button>

            <button
              onClick={handleReject}
              disabled={loading}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-2.5 rounded-lg text-xs transition-all shadow-md disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
