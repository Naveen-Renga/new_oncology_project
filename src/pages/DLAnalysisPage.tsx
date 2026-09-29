import React, { useState } from 'react';
import { runDLAnalyze } from '../services/api';
import { DLPrediction } from '../types';
import { Microscope, Layers, AlertTriangle, RefreshCw, Activity, Sparkles, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DLAnalysisPageProps {
  initialData?: any;
}

export const DLAnalysisPage: React.FC<DLAnalysisPageProps> = ({ initialData }) => {
  const [imageType, setImageType] = useState<'histopathology' | 'radiological_ct'>('histopathology');
  const [ctdnaSeries, setCtdnaSeries] = useState<number[]>([1.2, 1.5, 2.1, 3.4, 4.8]);
  const [analysis, setAnalysis] = useState<DLPrediction | null>(initialData?.dl_findings || null);
  const [loading, setLoading] = useState(false);

  const handleRunDL = async () => {
    setLoading(true);
    try {
      const res = await runDLAnalyze({
        image_type: imageType,
        time_series_ctdna: ctdnaSeries,
      });
      setAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { cycle: 'Baseline', ctDNA: ctdnaSeries[0] || 1.2, CEA: 4.1 },
    { cycle: 'Cycle 2', ctDNA: ctdnaSeries[1] || 1.5, CEA: 4.5 },
    { cycle: 'Cycle 3', ctDNA: ctdnaSeries[2] || 2.1, CEA: 5.8 },
    { cycle: 'Cycle 4', ctDNA: ctdnaSeries[3] || 3.4, CEA: 8.2 },
    { cycle: 'Cycle 5', ctDNA: ctdnaSeries[4] || 4.8, CEA: 11.5 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Stage 2 — Multimodal Deep Learning Analysis</h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
                DEMONSTRATION ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Vision CNN histopathology/radiology feature extraction coupled with BiLSTM longitudinal ctDNA dynamics.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunDL}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running Neural Models...' : 'Re-run Multimodal Inference'}
        </button>
      </div>

      {/* Mandatory Disclaimer Callout */}
      <div className="bg-amber-950/30 border border-amber-500/40 p-3.5 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Educational Prototype Notice:</strong> Demonstrates multimodal vision & temporal neural architectures. This is synthetic research benchmarking and is NOT clinically validated for patient diagnostics.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component A: Visual Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Microscope className="w-4 h-4 text-teal-400" />
              A. Vision Neural Model (Lightweight CNN)
            </h3>
            <div className="flex gap-1.5 bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setImageType('histopathology')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  imageType === 'histopathology' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                H&E Histology
              </button>
              <button
                onClick={() => setImageType('radiological_ct')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  imageType === 'radiological_ct' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Thoracic CT
              </button>
            </div>
          </div>

          {/* Visual Canvas Simulation */}
          <div className="relative h-48 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full border border-teal-500/40 bg-teal-500/10 flex items-center justify-center text-teal-400 animate-pulse">
                <Microscope className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono text-slate-300 block">
                {imageType === 'histopathology'
                  ? 'Tile Specimen #4829 — High Grade Invasive Adenocarcinoma'
                  : 'Axial CT Slice #104 — 3.2cm RUL Primary with Pleural Abutment'}
              </span>
              <span className="text-[10px] text-teal-400 font-mono">
                Tensor: [1, 3, 224, 224] | Normalization: ImageNet Stds
              </span>
            </div>
          </div>

          {/* Vision Finding */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 block mb-1 font-medium">Neural Finding:</span>
            <p className="text-slate-200 leading-relaxed font-sans">{analysis?.image_result}</p>
          </div>

          {/* Conceptual CNN Pipeline */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">CNN Pipeline Trace</span>
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
              <div className="bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
                Input<br />224x224
              </div>
              <div className="bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
                Conv2D<br />ReLU
              </div>
              <div className="bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
                MaxPool<br />Stride 2
              </div>
              <div className="bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
                Bottleneck<br />512-dim
              </div>
              <div className="bg-teal-950/60 p-2 rounded border border-teal-500/40 text-teal-300 font-bold">
                Softmax<br />93% Conf
              </div>
            </div>
          </div>
        </div>

        {/* Component B: Temporal Biomarker Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              B. Temporal BiLSTM (Longitudinal ctDNA Kinetics)
            </h3>
            <span className="text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
              Molecular Progression
            </span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="cycle" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="ctDNA" stroke="#f43f5e" strokeWidth={2.5} name="ctDNA (ng/mL)" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CEA" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3 3" name="CEA (ng/mL)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Temporal Finding */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 block mb-1 font-medium">LSTM Recurrent Readout:</span>
            <p className="text-rose-300 leading-relaxed font-sans">{analysis?.temporal_result}</p>
          </div>

          {/* Interactive Trajectory Adjuster */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Simulate Current Cycle ctDNA Surge:</span>
              <span className="font-mono text-rose-400">{ctdnaSeries[4]} ng/mL (+{Math.round(((ctdnaSeries[4] - ctdnaSeries[0]) / ctdnaSeries[0]) * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.1"
              value={ctdnaSeries[4]}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCtdnaSeries([ctdnaSeries[0], ctdnaSeries[1], ctdnaSeries[2], ctdnaSeries[3], val]);
              }}
              className="w-full accent-teal-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
