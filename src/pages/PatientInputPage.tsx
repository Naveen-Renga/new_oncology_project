import React, { useState } from 'react';
import { savePatient } from '../services/api';
import { UserPlus, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface PatientInputPageProps {
  onPatientSaved: (patientId: string) => void;
}

export const PatientInputPage: React.FC<PatientInputPageProps> = ({ onPatientSaved }) => {
  const [formData, setFormData] = useState({
    patient_id: 'PT-NSCLC-0309',
    demographics: {
      age: 62,
      sex: 'Male',
      smoking_history: 'Former',
      primary_diagnosis: 'Non-Small Cell Lung Cancer (Adenocarcinoma)',
      stage_category: 'Stage IV',
    },
    clinical_features: {
      creatinine_mg_dl: 1.2,
      alt_u_l: 35.0,
      ast_u_l: 30.0,
      platelets_k_ul: 215.0,
      anc_k_ul: 3.4,
      tmb_mut_mb: 9.8,
      ctdna_change_pct: 16.5,
    },
    genomic_features: {
      egfr_status: 'Exon 19 del',
      alk_status: 'Negative',
      kras_status: 'Negative',
      pdl1_tps_pct: 45.0,
    },
    clinical_note:
      'Patient with advanced EGFR Exon 19 del adenocarcinoma on Osimertinib. Tolerating with mild rash, no dyspnea.',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend validation test for demo bounds (e.g. age = 120 must be rejected)
    if (formData.demographics.age > 105 || formData.demographics.age < 18) {
      setError(`Age is outside configured demo range [18 - 105]. Got ${formData.demographics.age}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await savePatient(formData);
      setSuccess(`Patient ${res.patient.patient_id} registered successfully!`);
      onPatientSaved(res.patient.patient_id);
    } catch (err: any) {
      setError(err.message || 'Error saving patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Patient Registry & Clinical Profile Input</h2>
            <p className="text-xs text-slate-400">
              Register de-identified oncology patient profiles with clinical bounds validation.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-500/40 p-4 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div>
            <strong>Input Validation Error:</strong> {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">1. De-identified Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Patient ID (De-identified):</label>
              <input
                type="text"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Age (Valid Range 18 - 105):</label>
              <input
                type="number"
                value={formData.demographics.age}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: { ...formData.demographics, age: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Sex:</label>
              <select
                value={formData.demographics.sex}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: { ...formData.demographics, sex: e.target.value },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">2. Laboratory Markers & Organ Reserve</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Serum Creatinine (mg/dL):</label>
              <input
                type="number"
                step="0.05"
                value={formData.clinical_features.creatinine_mg_dl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clinical_features: {
                      ...formData.clinical_features,
                      creatinine_mg_dl: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">ALT Transaminase (U/L):</label>
              <input
                type="number"
                value={formData.clinical_features.alt_u_l}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clinical_features: {
                      ...formData.clinical_features,
                      alt_u_l: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">ctDNA Dynamics Trajectory (%):</label>
              <input
                type="number"
                step="0.5"
                value={formData.clinical_features.ctdna_change_pct}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clinical_features: {
                      ...formData.clinical_features,
                      ctdna_change_pct: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-rose-300 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">3. Unstructured Clinical Progress Note</h3>
          <textarea
            value={formData.clinical_note}
            onChange={(e) => setFormData({ ...formData, clinical_note: e.target.value })}
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-mono leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-2.5 rounded-lg text-xs transition-all shadow-md disabled:opacity-50"
        >
          {loading ? 'Validating...' : 'Register Patient & Compile Unified State'}
        </button>
      </form>
    </div>
  );
};
