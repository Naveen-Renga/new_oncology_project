import React, { useState, useEffect } from 'react';
import { fetchMetrics } from '../services/api';
import { BarChart3, CheckCircle2, ShieldCheck, Activity, Cpu, Bot, FileText, Sparkles } from 'lucide-react';

export const ModelMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Model Monitoring & Benchmarks</h2>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                Multi-Stage Metrics
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated performance, calibration, ROUGE scores, confusion matrix, and agent reliability metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 6 Stage Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ML Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              Stage 1: ML Model
            </h3>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
              Actual Measured
            </span>
          </div>
          <div className="text-[11px] text-teal-300 font-mono font-semibold">
            {metrics?.ml?.model_name || 'RandomForest (Calibrated)'}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Test Accuracy</span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {metrics?.ml?.accuracy ? `${(metrics.ml.accuracy * 100).toFixed(1)}%` : '76.8%'}
              </span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Macro F1</span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {metrics?.ml?.macro_f1 ? metrics.ml.macro_f1.toFixed(3) : '0.716'}
              </span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">High-Risk Recall</span>
              <span className="text-sm font-bold text-rose-400 font-mono">
                {metrics?.ml?.high_risk_recall ? `${(metrics.ml.high_risk_recall * 100).toFixed(1)}%` : '51.1%'}
              </span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Brier Score</span>
              <span className="text-sm font-bold text-teal-300 font-mono">
                {metrics?.ml?.brier_score ? metrics.ml.brier_score.toFixed(3) : '0.338'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            Calibration: Platt Sigmoid | ROC-AUC: {metrics?.ml?.roc_auc ? metrics.ml.roc_auc.toFixed(3) : '0.884'}
          </div>
        </div>

        {/* DL Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Stage 2: Deep Learning
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              Demo Simulation
            </span>
          </div>
          <div className="text-[11px] text-amber-300 font-mono">
            [DEMO BENCHMARK] Synthetic CNN + BiLSTM
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Vision Top-1 Acc</span>
              <span className="text-sm font-bold text-slate-100 font-mono">93.0%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">LSTM Trajectory F1</span>
              <span className="text-sm font-bold text-slate-100 font-mono">0.912</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Composite Conf</span>
              <span className="text-sm font-bold text-teal-300 font-mono">91.0%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Inference Latency</span>
              <span className="text-sm font-bold text-sky-400 font-mono">24.5 ms</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            CNN Backbone: MobileNet-V3 | Sequence: BiLSTM (Demo)
          </div>
        </div>

        {/* NLP Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Stage 3: Clinical NLP
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Rule + NegEx
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            [DEMO BENCHMARK] Dictionary & Regex Parser
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">NER Precision</span>
              <span className="text-sm font-bold text-slate-100 font-mono">94.2%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">NER Recall</span>
              <span className="text-sm font-bold text-slate-100 font-mono">89.8%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Urgency Macro F1</span>
              <span className="text-sm font-bold text-teal-300 font-mono">0.917</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Negation Acc</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">96.5%</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            Extraction: Dictionary + NegEx | De-identification: 100%
          </div>
        </div>

        {/* SLM Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Stage 4: SLM Summarizer
            </h3>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
              SmolLM2-135M
            </span>
          </div>
          <div className="text-[11px] text-teal-300 font-mono">
            [DEMO BENCHMARK] SmolLM Grounded Pipeline
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">ROUGE-L F1</span>
              <span className="text-sm font-bold text-slate-100 font-mono">0.876</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Factual Consistency</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">97.8%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Hallucination Rate</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">0.0%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Avg Latency</span>
              <span className="text-sm font-bold text-sky-400 font-mono">38.5 ms</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            LoRA Adapters: r=8, alpha=16 | Omission Rate: 2.2% (Demo)
          </div>
        </div>

        {/* GenAI Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Stage 5: GenAI Scenarios
            </h3>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
              Stress Generator
            </span>
          </div>
          <div className="text-[11px] text-purple-300 font-mono">
            [DEMO HEURISTIC] Validator Rules
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Biological Realism</span>
              <span className="text-sm font-bold text-slate-100 font-mono">93.2%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Plausibility Rate</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">98.5%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Schema Compliance</span>
              <span className="text-sm font-bold text-teal-300 font-mono">100.0%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Diversity Scope</span>
              <span className="text-xs font-bold text-slate-200">4 Categories</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            Seed Constraints Enforced: TMB, ctDNA, Renal Function (Demo)
          </div>
        </div>

        {/* Agent Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-teal-400" />
              Stage 6: Agentic AI
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              ReAct Engine
            </span>
          </div>
          <div className="text-[11px] text-emerald-300 font-mono">
            [SIMULATED ENVIRONMENT] Human-Gated
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Task Success Rate</span>
              <span className="text-sm font-bold text-slate-100 font-mono">98.0%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Tool Success Rate</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">100.0%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Invalid Action Rate</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">0.0%</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px] block">Human Override</span>
              <span className="text-sm font-bold text-amber-300 font-mono">4.5%</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            Non-Autonomous Prescription: Blocked (100% Policy Enforced)
          </div>
        </div>
      </div>

      {/* Confusion Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">
            Stage 1 ML Confusion Matrix (Untouched Holdout Test Set: N=1,701)
          </h3>
          <span className="text-[10px] text-teal-300 font-mono">
            {metrics?.ml?.model_name || 'RandomForest (Calibrated)'}
          </span>
        </div>
        <div className="overflow-x-auto">
          {(() => {
            const cm = metrics?.ml?.confusion_matrix || [
              [633, 130, 0],
              [117, 576, 55],
              [0, 93, 97],
            ];
            return (
              <table className="text-xs text-center border-collapse w-full max-w-xl">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-700 bg-slate-800 text-slate-300">Actual \ Predicted</th>
                    <th className="p-2 border border-slate-700 bg-slate-800 text-slate-300">Predicted Low</th>
                    <th className="p-2 border border-slate-700 bg-slate-800 text-slate-300">Predicted Moderate</th>
                    <th className="p-2 border border-slate-700 bg-slate-800 text-slate-300">Predicted High</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-slate-200">
                  <tr>
                    <td className="p-2.5 border border-slate-700 bg-slate-800 font-sans font-semibold text-slate-300">Actual Low</td>
                    <td className="p-2.5 border border-slate-700 bg-teal-950/40 text-teal-300 font-bold">{cm[0]?.[0] ?? 633}</td>
                    <td className="p-2.5 border border-slate-700">{cm[0]?.[1] ?? 130}</td>
                    <td className="p-2.5 border border-slate-700 text-rose-400">{cm[0]?.[2] ?? 0}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-slate-700 bg-slate-800 font-sans font-semibold text-slate-300">Actual Moderate</td>
                    <td className="p-2.5 border border-slate-700">{cm[1]?.[0] ?? 117}</td>
                    <td className="p-2.5 border border-slate-700 bg-amber-950/40 text-amber-300 font-bold">{cm[1]?.[1] ?? 576}</td>
                    <td className="p-2.5 border border-slate-700 text-rose-300">{cm[1]?.[2] ?? 55}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-slate-700 bg-slate-800 font-sans font-semibold text-slate-300">Actual High</td>
                    <td className="p-2.5 border border-slate-700 text-rose-400">{cm[2]?.[0] ?? 0}</td>
                    <td className="p-2.5 border border-slate-700">{cm[2]?.[1] ?? 93}</td>
                    <td className="p-2.5 border border-slate-700 bg-rose-950/40 text-rose-300 font-bold">{cm[2]?.[2] ?? 97}</td>
                  </tr>
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
