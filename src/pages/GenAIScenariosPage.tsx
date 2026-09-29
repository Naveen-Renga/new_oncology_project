import React, { useState, useEffect } from 'react';
import { runGenAIGenerate } from '../services/api';
import { GenAIScenario } from '../types';
import { Sparkles, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Terminal } from 'lucide-react';

interface GenAIScenariosPageProps {
  initialScenario?: GenAIScenario;
}

export const GenAIScenariosPage: React.FC<GenAIScenariosPageProps> = ({ initialScenario }) => {
  const [scenarioType, setScenarioType] = useState<'Mild' | 'Moderate' | 'Severe' | 'Wildcard'>(
    initialScenario?.scenario_type || 'Severe'
  );
  const [tmb, setTmb] = useState(initialScenario?.genomic_profile?.tmb_mut_mb || 15.0);
  const [ctdnaTrend, setCtdnaTrend] = useState('rising >20% per cycle');
  const [renalFunction, setRenalFunction] = useState(
    initialScenario?.clinical_profile?.renal_status || 'impaired'
  );
  const [organInvolvement, setOrganInvolvement] = useState(
    initialScenario?.clinical_profile?.metastatic_sites?.join(', ') || 'Bilateral Pleura, Bone'
  );
  const [mutations, setMutations] = useState(
    initialScenario?.genomic_profile?.primary_driver || 'EGFR Exon 19 del'
  );

  const [scenario, setScenario] = useState<GenAIScenario | null>(initialScenario || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialScenario) {
      setScenario(initialScenario);
      setScenarioType(initialScenario.scenario_type || 'Severe');
      if (initialScenario.genomic_profile) {
        setTmb(initialScenario.genomic_profile.tmb_mut_mb || 15.0);
        const allMutations = [
          initialScenario.genomic_profile.primary_driver,
          ...(initialScenario.genomic_profile.secondary_alterations || []),
        ].filter(Boolean);
        setMutations(allMutations.join(', '));
      }
      if (initialScenario.clinical_profile) {
        setRenalFunction(initialScenario.clinical_profile.renal_status || 'impaired');
        if (initialScenario.clinical_profile.metastatic_sites) {
          setOrganInvolvement(initialScenario.clinical_profile.metastatic_sites.join(', '));
        }
      }
    }
  }, [initialScenario]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await runGenAIGenerate({
        scenario_type: scenarioType,
        tmb_threshold: tmb,
        ctdna_trend: ctdnaTrend,
        renal_function: renalFunction,
        organ_involvement: organInvolvement,
        genomic_mutations: mutations.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setScenario(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Stage 5 — Generative AI Stress-Test Generator</h2>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
                Gemini 3.8 Flash / Synthesizer
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generates plausible synthetic oncology stress-test scenarios from clean seed conditions for clinical decision benchmark testing.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Synthesizing Scenario...' : 'Generate Stress Scenario'}
        </button>
      </div>

      {/* Critical Synthetic Isolation Banner */}
      <div className="bg-purple-950/40 border border-purple-500/40 p-3.5 rounded-xl text-xs text-purple-200 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong>Synthetic Data Separation:</strong> Generated stress scenarios are isolated from real clinical patient records. They serve solely to test edge-case agent reasoning and clinical protocol constraints.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seed Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Seed Condition Knobs</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Scenario Category:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Mild', 'Moderate', 'Severe', 'Wildcard'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setScenarioType(cat)}
                    className={`py-1.5 px-2 rounded text-xs font-medium border transition-all ${
                      scenarioType === cat
                        ? 'bg-teal-600 border-teal-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>TMB Threshold:</span>
                <span className="text-teal-300 font-mono">{tmb} mut/Mb</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={tmb}
                onChange={(e) => setTmb(parseFloat(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">ctDNA Dynamics:</label>
              <select
                value={ctdnaTrend}
                onChange={(e) => setCtdnaTrend(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="rising >20% per cycle">rising &gt;20% per cycle (Rapid Acceleration)</option>
                <option value="stable +/-5% drift">stable +/-5% drift</option>
                <option value="falling >30% (molecular response)">falling &gt;30% (molecular response)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Renal Clearance:</label>
              <select
                value={renalFunction}
                onChange={(e) => setRenalFunction(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="impaired">Impaired (Stage 3 CKD)</option>
                <option value="mild impairment">Mild Impairment</option>
                <option value="normal">Normal Clearance</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Organ Involvement Sites:</label>
              <input
                type="text"
                value={organInvolvement}
                onChange={(e) => setOrganInvolvement(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Genomic Drivers:</label>
              <input
                type="text"
                value={mutations}
                onChange={(e) => setMutations(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Output Scenario View */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Generated Stress Scenario</h3>
            {scenario && (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-amber-300 font-mono font-medium">
                  Heuristic Biological Plausibility Score — Demo Only
                </span>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-2.5 py-0.5 rounded font-mono font-bold">
                  {Math.round(scenario.realism_score * 100)}%
                </span>
              </div>
            )}
          </div>

          {scenario ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    {scenario.scenario_type} Oncology Challenge
                  </span>
                  <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                    SYNTHETIC SIMULATION
                  </span>
                </div>
                <div className="text-slate-300 grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-700">
                  <div>Primary Driver: <strong className="text-teal-300 font-mono">{scenario.genomic_profile.primary_driver}</strong></div>
                  <div>Secondary: <strong className="text-purple-300 font-mono">{scenario.genomic_profile.secondary_alterations?.join(', ') || 'None'}</strong></div>
                  <div>Renal Status: <strong className="text-slate-200">{scenario.clinical_profile.renal_status}</strong></div>
                  <div>Creatinine: <strong className="text-slate-200">{scenario.clinical_profile.creatinine_mg_dl} mg/dL</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Progression Pattern:</span>
                  <p className="text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                    {scenario.progression_pattern}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Toxicity Pattern:</span>
                  <p className="text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                    {scenario.toxicity_pattern}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Clinical Rationale & Stress Context:</span>
                  <p className="text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans italic">
                    {scenario.rationale}
                  </p>
                </div>
              </div>

              {/* JSON Payload Inspector */}
              <details className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <summary className="text-slate-400 cursor-pointer font-mono text-[11px] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  View Structured JSON Output
                </summary>
                <pre className="mt-2 text-[10px] text-teal-300 font-mono overflow-x-auto max-h-48 p-2 bg-slate-900 rounded">
                  {JSON.stringify(scenario, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Click "Generate Stress Scenario" to construct synthetic oncology test cases.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
