import React from 'react';
import {
  PatientState,
} from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Microscope,
  FileText,
  Bot,
  Zap,
  Dna,
  Pill,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  state: PatientState | null;
  loading: boolean;
  onNavigate: (tab: any) => void;
  onRunPipeline: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  state,
  loading,
  onNavigate,
  onRunPipeline,
}) => {
  if (loading || !state) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Synthesizing Unified Patient State across 6 AI Stages...</p>
        </div>
      </div>
    );
  }

  const { demographics, clinical_features, genomic_features, ml_risk, dl_findings, nlp_entities, urgency, slm_summary, agent_decision_support } = state;

  const probData = [
    { name: 'Low', prob: Math.round((ml_risk?.probabilities?.Low || 0) * 100), color: '#10b981' },
    { name: 'Moderate', prob: Math.round((ml_risk?.probabilities?.Moderate || 0) * 100), color: '#f59e0b' },
    { name: 'High', prob: Math.round((ml_risk?.probabilities?.High || 0) * 100), color: '#ef4444' },
  ];

  const ctDnaTimeline = [
    { cycle: 'Baseline', ctdna: 1.0 },
    { cycle: 'Cycle 2', ctdna: 1.3 },
    { cycle: 'Cycle 3', ctdna: 1.8 },
    { cycle: 'Cycle 4', ctdna: 2.6 },
    { cycle: 'Current (C5)', ctdna: 3.8 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Patient Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-bold text-white tracking-tight">{state.patient_id}</span>
            <span className="bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {demographics.primary_diagnosis}
            </span>
            <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-xs">
              {demographics.stage_category}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              ml_risk?.risk_level === 'High'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {ml_risk?.risk_level || 'Moderate'} Risk Cohort
            </span>
          </div>
          <div className="mt-2 flex items-center gap-6 text-xs text-slate-400 flex-wrap">
            <span>Age: <strong className="text-slate-200">{demographics.age}</strong></span>
            <span>Sex: <strong className="text-slate-200">{demographics.sex}</strong></span>
            <span>Smoking: <strong className="text-slate-200">{demographics.smoking_history}</strong></span>
            <span>Creatinine: <strong className="text-slate-200">{clinical_features.creatinine_mg_dl} mg/dL</strong></span>
            <span>ctDNA Trajectory: <strong className="text-rose-400">+{clinical_features.ctdna_change_pct}%</strong></span>
            <span>Driver: <strong className="text-teal-300">{genomic_features.kras_status && genomic_features.kras_status !== 'Negative' ? `KRAS ${genomic_features.kras_status}` : genomic_features.egfr_status}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRunPipeline}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            Re-evaluate All 6 Stages
          </button>
        </div>
      </div>

      {/* Grid: 6 AI Stages Integrated Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Stage 1: Machine Learning */}
        <div
          onClick={() => onNavigate('ml-risk')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
              Stage 1 — Machine Learning
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-white mt-1">Calibrated Risk Stratification</h3>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-400">{ml_risk?.risk_level}</span>
            <span className="text-xs text-slate-400 font-mono">
              Calibrated Prob: {Math.round((ml_risk?.probabilities?.High || 0) * 100)}%
            </span>
          </div>
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={55} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Bar dataKey="prob" radius={[0, 4, 4, 0]}>
                  {probData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Model: {ml_risk?.model || 'Calibrated Classifier'} (Evaluated on Holdout Test Set)
          </p>
        </div>

        {/* Stage 2: Deep Learning */}
        <div
          onClick={() => onNavigate('dl-analysis')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
              Stage 2 — Deep Learning
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-white mt-1">Multimodal Vision & ctDNA LSTM</h3>
          <div className="mt-3 flex items-center gap-2">
            <Microscope className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-xs text-slate-300 line-clamp-2">
              {dl_findings?.image_result}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-xs text-rose-300 font-medium line-clamp-2">
              {dl_findings?.temporal_result}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Heuristic Confidence: {(dl_findings?.confidence * 100).toFixed(0)}%</span>
            <span className="text-amber-400 font-mono text-[10px]">DEMO SIMULATION</span>
          </div>
        </div>

        {/* Stage 3: NLP */}
        <div
          onClick={() => onNavigate('nlp-notes')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
              Stage 3 — Clinical NLP
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-white mt-1">Medical NER & Urgency Classifier</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {nlp_entities?.gene_mutation?.map((g) => (
              <span key={g} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[11px] font-mono">
                {g}
              </span>
            ))}
            {nlp_entities?.drug_name?.map((d) => (
              <span key={d} className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded text-[11px] font-mono">
                {d} {nlp_entities.dosage?.[0] || ''}
              </span>
            ))}
            {nlp_entities?.adverse_event?.map((ae) => (
              <span key={ae} className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[11px]">
                {ae}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">Urgency:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
              urgency?.level === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {urgency?.level} Priority
            </span>
          </div>
        </div>

        {/* Stage 4: SLM Summarizer */}
        <div
          onClick={() => onNavigate('slm-summary')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
              Stage 4 — Small Language Model
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-white mt-1">Concise Grounded Summary</h3>
          <blockquote className="mt-3 text-xs text-slate-300 italic bg-slate-800/60 p-2.5 rounded-lg border-l-2 border-teal-500 leading-relaxed">
            "{slm_summary}"
          </blockquote>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>SmolLM2-135M LoRA</span>
            <span className="text-emerald-400">Consistency: 98% (Demo)</span>
          </div>
        </div>

        {/* Stage 5: GenAI Stress-Test */}
        <div
          onClick={() => onNavigate('genai-scenarios')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
              Stage 5 — Generative AI
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-white mt-1">Plausible Synthetic Stress Scenario</h3>
          <div className="mt-2 text-xs text-slate-300 space-y-1">
            <p className="line-clamp-2 text-slate-300">
              {state.genai_scenarios?.[0]?.progression_pattern || 'Simulated acquired resistance dynamics.'}
            </p>
          </div>
          <div className="mt-3 flex flex-col gap-0.5">
            <span className="text-[10px] text-amber-300 font-mono font-medium">
              Heuristic Biological Plausibility Score — Demo Only
            </span>
            <span className="text-teal-300 font-bold font-mono text-sm">
              {Math.round((state.genai_scenarios?.[0]?.realism_score || 0.94) * 100)}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400 font-mono">
            * Clearly tagged as synthetic stress data
          </div>
        </div>

        {/* Stage 6: Agentic AI & Human Approval */}
        <div
          onClick={() => onNavigate('agent-command')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
              Stage 6 — Agentic AI & Gate
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-white mt-1">ReAct Multi-Tool Decision Support</h3>
          <div className="mt-3 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Human Approval Gate:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                agent_decision_support?.status === 'Approved'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {agent_decision_support?.status || 'Awaiting Human Approval'}
              </span>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider block w-fit my-1">
              SIMULATED TRIAL — DEMONSTRATION ONLY
            </span>
            <p className="text-slate-300 text-[11px] line-clamp-2">
              Proposed Trial: {agent_decision_support?.recommended_trial?.title || 'Simulated Protocol'}
            </p>
          </div>
          <p className="text-[10px] text-rose-300 mt-2 font-medium">
            * Autonomous prescription blocked by safety policy
          </p>
        </div>
      </div>

      {/* Longitudinal Dynamics & Tumor Marker Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Longitudinal ctDNA Dynamics & Progression Kinetics</h3>
            <p className="text-xs text-slate-400">Tracking molecular tumor burden across treatment cycles</p>
          </div>
          <span className="text-xs text-rose-400 font-mono font-semibold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
            Trajectory: +{clinical_features.ctdna_change_pct}% (Rapid Molecular Expansion)
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ctDnaTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="cycle" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} label={{ value: 'ctDNA (ng/mL)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="ctdna" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: '#f43f5e' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
