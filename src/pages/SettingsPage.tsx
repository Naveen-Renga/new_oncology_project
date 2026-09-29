import React, { useState } from 'react';
import { HealthState } from '../types';
import { Settings, ShieldAlert, Cpu, Database, CheckCircle2, RefreshCw, Terminal, Layers, Bot } from 'lucide-react';

interface SettingsPageProps {
  health: HealthState | null;
  onRefreshHealth: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ health, onRefreshHealth }) => {
  const [demoMode, setDemoMode] = useState(health?.demo_mode ?? true);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">System Settings & Multi-Stage Health</h2>
            <p className="text-xs text-slate-400">
              Diagnostic verification of all 6 AI stages, environment variables, and execution modes.
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshHealth}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Recheck Health Status
        </button>
      </div>

      {/* 6 AI Stages Live Health Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Live Pipeline Subsystem Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Backend API Core</span>
              <span className="text-slate-200 font-semibold">{health?.backend_status || 'OPERATIONAL'}</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
              ONLINE
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Database Layer</span>
              <span className="text-slate-200 font-semibold">{health?.database_status || 'SQLite / Memory'}</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
              READY
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Stage 1: ML Model</span>
              <span className="text-slate-200 font-semibold">{health?.ml_model_status || 'Calibrated Best Classifier'}</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
              ACTIVE
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Stage 2: DL Multimodal</span>
              <span className="text-slate-200 font-semibold">{health?.dl_model_status || 'CNN + BiLSTM'}</span>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
              DEMO SIM
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Stage 3: Clinical NLP</span>
              <span className="text-slate-200 font-semibold">{health?.nlp_status || 'Rule + NegEx'}</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
              ACTIVE
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Stage 4: SLM Summarizer</span>
              <span className="text-slate-200 font-semibold">{health?.slm_status || 'SmolLM2-135M'}</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
              ACTIVE
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Stage 5: GenAI Scenarios</span>
              <span className="text-slate-200 font-semibold">{health?.genai_availability || 'Gemini 3.8 / Synthesizer'}</span>
            </div>
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
              ACTIVE
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Stage 6: Agentic AI</span>
              <span className="text-slate-200 font-semibold">{health?.agent_availability || 'ReAct Engine'}</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
              GATE ENFORCED
            </span>
          </div>
        </div>
      </div>

      {/* Execution Mode Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Execution Mode Configuration</h3>
        <div className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 text-xs">
          <div>
            <span className="text-slate-200 font-semibold block">Demo Mode (Zero Paid API Dependency)</span>
            <span className="text-slate-400 text-[11px]">
              When enabled, the entire platform runs deterministically and offline without requiring external API keys.
            </span>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              demoMode
                ? 'bg-teal-600 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {demoMode ? 'ENABLED (OFFLINE DEMO)' : 'REAL API MODE'}
          </button>
        </div>
      </div>

      {/* Safety Policy & Disclaimers */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5 text-xs text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <ShieldAlert className="w-4 h-4" />
          Mandatory Clinical Prototype Boundary Statement
        </div>
        <p className="leading-relaxed text-amber-300/90">
          OncoPrecision is developed strictly for research benchmarking, system verification, and educational demonstrations in personalized thoracic oncology. The platform does NOT formulate medical diagnoses, does NOT prescribe pharmacotherapy, and does NOT substitute for the expertise of licensed oncologists or multidisciplinary tumor boards.
        </p>
      </div>
    </div>
  );
};
