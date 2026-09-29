import React, { useState, useEffect } from 'react';
import { runNLPAnalyze } from '../services/api';
import { NLPEntities } from '../types';
import { FileText, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface NLPNotesPageProps {
  initialNote?: string;
  initialEntities?: NLPEntities;
}

export const NLPNotesPage: React.FC<NLPNotesPageProps> = ({ initialNote, initialEntities }) => {
  const [noteText, setNoteText] = useState(
    initialNote ||
      'Patient with EGFR Exon 19 deletion is receiving Osimertinib 80mg. Patient developed severe fatigue, shortness of breath, and denies chest pain. Urgent review recommended.'
  );
  const [entities, setEntities] = useState<NLPEntities | null>(initialEntities || null);
  const [loading, setLoading] = useState(false);
  const [showDeidentified, setShowDeidentified] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setNoteText(initialNote);
    }
    if (initialEntities) {
      setEntities(initialEntities);
    }
  }, [initialNote, initialEntities]);

  const sampleNotes = [
    {
      label: 'EGFR Exon 19 del High Urgency',
      text: 'Patient with EGFR Exon 19 deletion is receiving Osimertinib 80mg. Patient developed severe fatigue and shortness of breath. Urgent review recommended.',
    },
    {
      label: 'KRAS G12C Negation Example',
      text: 'Patient with confirmed KRAS G12C mutation is receiving Sotorasib 960mg daily following progression. Presents with mild fatigue, denies chest pain, stable performance status.',
    },
    {
      label: 'Complex De-identification Sample',
      text: 'Patient Jane Doe (MRN: 94820194, phone 555-019-2834) with ALK rearrangement receiving Alectinib 600mg presented with severe fatigue. Evaluated by Dr. Smith on 2024-05-12.',
    },
  ];

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await runNLPAnalyze(noteText);
      setEntities(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Stage Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Stage 3 — Clinical NLP & Note Analyzer</h2>
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
                Dictionary + NegEx Baseline
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Extracts Gene Mutations, Drug Names, Dosages, Adverse Events, Negation, and Urgency with automated de-identification.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 text-right">
          <span className="text-emerald-400 font-mono text-[11px] block">Transparent Rule Baseline</span>
          <span>Plug-and-play architecture for transformer replacement</span>
        </div>
      </div>

      {/* Preset Note Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">Load Research Presets:</span>
        {sampleNotes.map((sample) => (
          <button
            key={sample.label}
            onClick={() => setNoteText(sample.text)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
          >
            {sample.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Note Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Unstructured Clinical Note</h3>
            <button
              onClick={() => setShowDeidentified(!showDeidentified)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-all"
            >
              {showDeidentified ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showDeidentified ? 'Show Raw' : 'Preview De-identified'}
            </button>
          </div>

          <textarea
            value={showDeidentified ? entities?.deidentified_note || noteText : noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={7}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-teal-500"
            placeholder="Paste clinical progress note here..."
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Extracting Entities...' : 'Run NLP Extraction & Negation Analysis'}
          </button>
        </div>

        {/* Structured Entities Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Extracted Structured Entities</h3>
            {entities && (
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${
                entities.urgency === 'High'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {entities.urgency} Urgency
              </span>
            )}
          </div>

          {entities ? (
            <div className="space-y-3.5 text-xs">
              {/* Genes */}
              <div>
                <span className="text-slate-400 block mb-1">Gene Mutations:</span>
                <div className="flex flex-wrap gap-1.5">
                  {entities.gene_mutation.length > 0 ? (
                    entities.gene_mutation.map((g) => (
                      <span key={g} className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded font-mono">
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Drugs & Dosages */}
              <div>
                <span className="text-slate-400 block mb-1">Antineoplastic Drugs & Dosages:</span>
                <div className="flex flex-wrap gap-1.5">
                  {entities.drug_name.length > 0 ? (
                    entities.drug_name.map((d, i) => (
                      <span key={d} className="bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2.5 py-1 rounded font-mono">
                        {d} {entities.dosage[i] || entities.dosage[0] || ''}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Adverse Events */}
              <div>
                <span className="text-slate-400 block mb-1">Active Adverse Events:</span>
                <div className="flex flex-wrap gap-1.5">
                  {entities.adverse_event.length > 0 ? (
                    entities.adverse_event.map((ae) => (
                      <span key={ae} className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded">
                        {ae}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No positive adverse events</span>
                  )}
                </div>
              </div>

              {/* Negated Entities */}
              <div>
                <span className="text-slate-400 block mb-1">Negated / Ruled-Out Mentions (NegEx Filtered):</span>
                <div className="flex flex-wrap gap-1.5">
                  {entities.negated_entities.length > 0 ? (
                    entities.negated_entities.map((neg) => (
                      <span key={neg} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded line-through font-mono">
                        {neg}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No negated entities</span>
                  )}
                </div>
              </div>

              {/* Misinterpretation Audit Warnings */}
              {entities.warnings && entities.warnings.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-lg text-amber-200">
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    Misinterpretation Audit:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {entities.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Click "Run NLP Extraction" to parse clinical entities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
