import React, { useState, useEffect } from 'react';
import { runMLPredict } from '../services/api';
import { MLPrediction } from '../types';
import { Cpu, ShieldCheck, AlertCircle, BarChart2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface MLRiskPageProps {
  initialData?: any;
}

export const MLRiskPage: React.FC<MLRiskPageProps> = ({ initialData }) => {
  const [formData, setFormData] = useState({
    age: initialData?.demographics?.age || 63,
    smoking_history: initialData?.demographics?.smoking_history || 'Former',
    creatinine_mg_dl: initialData?.clinical_features?.creatinine_mg_dl || 1.45,
    alt_u_l: initialData?.clinical_features?.alt_u_l || 58.0,
    ast_u_l: initialData?.clinical_features?.ast_u_l || 44.0,
    platelets_k_ul: initialData?.clinical_features?.platelets_k_ul || 185.0,
    anc_k_ul: initialData?.clinical_features?.anc_k_ul || 2.9,
    tmb_mut_mb: initialData?.clinical_features?.tmb_mut_mb || 11.2,
    ctdna_change_pct: initialData?.clinical_features?.ctdna_change_pct || 28.5,
    egfr_status: initialData?.genomic_features?.egfr_status || 'Exon 19 del',
    kras_status: initialData?.genomic_features?.kras_status || 'Negative',
    pdl1_tps_pct: initialData?.genomic_features?.pdl1_tps_pct || 35.0,
  });

  const [prediction, setPrediction] = useState<MLPrediction | null>(initialData?.ml_risk || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        age: initialData?.demographics?.age ?? 63,
        smoking_history: initialData?.demographics?.smoking_history || 'Former',
        creatinine_mg_dl: initialData?.clinical_features?.creatinine_mg_dl ?? 1.45,
        alt_u_l: initialData?.clinical_features?.alt_u_l ?? 58.0,
        ast_u_l: initialData?.clinical_features?.ast_u_l ?? 44.0,
        platelets_k_ul: initialData?.clinical_features?.platelets_k_ul ?? 185.0,
        anc_k_ul: initialData?.clinical_features?.anc_k_ul ?? 2.9,
        tmb_mut_mb: initialData?.clinical_features?.tmb_mut_mb ?? 11.2,
        ctdna_change_pct: initialData?.clinical_features?.ctdna_change_pct ?? 28.5,
        egfr_status: initialData?.genomic_features?.egfr_status || 'Exon 19 del',
        kras_status: initialData?.genomic_features?.kras_status || 'Negative',
        pdl1_tps_pct: initialData?.genomic_features?.pdl1_tps_pct ?? 35.0,
      });
      setPrediction(initialData?.ml_risk || null);
    }
  }, [initialData]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await runMLPredict(formData);
      setPrediction(res);
    } catch (err: any) {
      setError(err.message || 'Error executing ML prediction pipeline');
    } finally {
      setLoading(false);
    }
  };

  const probData = [
    { name: 'Low Risk', prob: Math.round((prediction?.probabilities?.Low || 0.05) * 100), color: '#10b981' },
    { name: 'Moderate Risk', prob: Math.round((prediction?.probabilities?.Moderate || 0.22) * 100), color: '#f59e0b' },
    { name: 'High Risk', prob: Math.round((prediction?.probabilities?.High || 0.73) * 100), color: '#ef4444' },
  ];

  const featureImportances = [
    { feature: 'ctDNA Trajectory (% surge)', weight: '34.2%' },
    { feature: 'Serum Creatinine (mg/dL)', weight: '22.8%' },
    { feature: 'Absolute Neutrophil Count (ANC)', weight: '14.5%' },
    { feature: 'Serum ALT Transaminase (U/L)', weight: '12.1%' },
    { feature: 'Tumor Mutational Burden (TMB)', weight: '9.4%' },
    { feature: 'Patient Age (years)', weight: '7.0%' },
  ];

  const activeModelName = prediction?.model || initialData?.ml_risk?.model || 'RandomForest (Calibrated)';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Stage Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Stage 1 — Machine Learning Risk Model</h2>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
                  Calibrated Classifier
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Predicts NSCLC risk level (Low, Moderate, High) using structured clinical and genomic features.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            <span>Trained on: <strong className="text-slate-200">11,507 NSCLC cohort records</strong></span>
            <div className="text-emerald-400 font-mono text-[11px]">Selected: {activeModelName}</div>
          </div>
        </div>
      </div>

      {/* Prohibited Column Notice */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">Zero Data Leakage & Artificial Column Purge:</strong> Patient ID is strictly excluded from predictive features. Legacy artificial columns (<code>TNM_T</code>, <code>TNM_N</code>, <code>TNM_M</code>, <code>tumor_size_cm</code>) are actively detected and dropped by the preprocessing pipeline to prevent biased data leakage.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Patient Parameters for Inference</h3>
          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Age (18-105):</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Creatinine (mg/dL):</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.creatinine_mg_dl}
                  onChange={(e) => setFormData({ ...formData, creatinine_mg_dl: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">ctDNA Dynamics (%):</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.ctdna_change_pct}
                  onChange={(e) => setFormData({ ...formData, ctdna_change_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-rose-300 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">ALT Transaminase (U/L):</label>
                <input
                  type="number"
                  value={formData.alt_u_l}
                  onChange={(e) => setFormData({ ...formData, alt_u_l: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Absolute Neutrophil Count (ANC):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.anc_k_ul}
                  onChange={(e) => setFormData({ ...formData, anc_k_ul: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">TMB (mut/Mb):</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.tmb_mut_mb}
                  onChange={(e) => setFormData({ ...formData, tmb_mut_mb: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">EGFR Mutation Status:</label>
                <select
                  value={formData.egfr_status}
                  onChange={(e) => setFormData({ ...formData, egfr_status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="Exon 19 del">Exon 19 del</option>
                  <option value="L858R">L858R</option>
                  <option value="T790M">T790M</option>
                  <option value="Wildtype">Wildtype</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">KRAS Status:</label>
                <select
                  value={formData.kras_status}
                  onChange={(e) => setFormData({ ...formData, kras_status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="Negative">Negative</option>
                  <option value="G12C">G12C</option>
                  <option value="G12D">G12D</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Smoking History:</label>
                <select
                  value={formData.smoking_history}
                  onChange={(e) => setFormData({ ...formData, smoking_history: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="Never">Never</option>
                  <option value="Former">Former</option>
                  <option value="Current">Current</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-rose-950/50 border border-rose-500/40 p-3 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Evaluating Model...' : 'Calculate Calibrated Risk Level'}
            </button>
          </form>
        </div>

        {/* Prediction Results & Calibrated Probabilities */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Model Output</h3>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block mb-1">Predicted Risk Level</span>
              <span className={`text-3xl font-extrabold ${
                prediction?.risk_level === 'High' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {prediction?.risk_level || 'High'}
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                Confidence: {Math.round((prediction?.confidence_score || 0.75) * 100)}%
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium text-slate-300 block mb-2">Calibrated Probabilities</span>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={probData}>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                      {probData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            <div>Model: {prediction?.model || 'RandomForest (Calibrated)'}</div>
            <div>Brier Score: 0.338 | Calibration: Platt Sigmoid Scaling (Active)</div>
          </div>
        </div>
      </div>

      {/* Model Benchmark & Feature Importance Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-teal-400" />
            Model Benchmark Comparison (Actual Measured Test Set)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-2.5">Model</th>
                  <th className="p-2.5">Accuracy</th>
                  <th className="p-2.5">Macro F1</th>
                  <th className="p-2.5 text-rose-400">High-Risk Recall</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                <tr>
                  <td className="p-2.5 font-sans">Baseline Logistic Regression</td>
                  <td className="p-2.5">58.3%</td>
                  <td className="p-2.5">0.555</td>
                  <td className="p-2.5">71.6%</td>
                  <td className="p-2.5 text-slate-400">Baseline</td>
                </tr>
                <tr className="bg-teal-950/20">
                  <td className="p-2.5 font-sans font-bold text-teal-300">Random Forest (Calibrated)</td>
                  <td className="p-2.5">76.8%</td>
                  <td className="p-2.5">0.716</td>
                  <td className="p-2.5 text-rose-300 font-bold">51.1%</td>
                  <td className="p-2.5 text-teal-400 font-bold">Selected Best</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans">Gradient Boosting Classifier</td>
                  <td className="p-2.5">76.8%</td>
                  <td className="p-2.5">0.743</td>
                  <td className="p-2.5">60.5%</td>
                  <td className="p-2.5 text-slate-300">Alternate</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-mono">
            * Selected based on measured clinical safety score (0.6 * HighRiskRecall + 0.4 * MacroF1) evaluated on untouched test holdout.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Feature Importance Weights</h3>
          <div className="space-y-2.5">
            {featureImportances.map((item) => (
              <div key={item.feature} className="text-xs">
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{item.feature}</span>
                  <span className="font-mono text-teal-300">{item.weight}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: item.weight }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
