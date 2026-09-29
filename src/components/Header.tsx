import React from 'react';
import { Activity, ShieldAlert, User, Cpu, Sparkles } from 'lucide-react';
import { HealthState } from '../types';

interface HeaderProps {
  currentPatientId: string;
  onSelectPatient: (id: string) => void;
  availablePatients: string[];
  health: HealthState | null;
  activeRole: string;
  onChangeRole: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPatientId,
  onSelectPatient,
  availablePatients,
  health,
  activeRole,
  onChangeRole,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Prominent Clinical Disclaimer Banner */}
      <div className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold tracking-wide uppercase text-[11px] text-amber-400">
            Research Simulation & Clinical Decision Support Prototype
          </span>
          <span className="hidden md:inline text-amber-300/80">
            — Does NOT diagnose cancer, prescribe medications, or replace clinician judgment. All outputs require affirmative human review.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
            NSCLC Target Cohort
          </span>
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
            {health?.demo_mode ? 'DEMO MODE (OFFLINE)' : 'ONLINE INFERENCE'}
          </span>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white">OncoPrecision</h1>
              <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized Precision Medicine for Oncology Treatment Optimization
            </p>
          </div>
        </div>

        {/* Global Controls: Patient Switcher & Role Switcher */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Patient Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Selected Cohort Subject:</span>
            <select
              value={currentPatientId}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-teal-300 font-mono text-xs focus:outline-none focus:border-teal-500"
            >
              {availablePatients.map((pid) => (
                <option key={pid} value={pid}>
                  {pid}{' '}
                  {pid === 'PT-NSCLC-0104'
                    ? '(EGFR Exon 19 del / High Risk)'
                    : pid === 'PT-NSCLC-0208'
                    ? '(KRAS G12C / Moderate Risk)'
                    : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Clinician Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeRole}
              onChange={(e) => onChangeRole(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value="Dr. Thoracic Oncologist">Dr. Thoracic Oncologist (Attending)</option>
              <option value="Dr. Molecular Pathologist">Dr. Molecular Pathologist</option>
              <option value="Clinical Oncology Pharmacist">Clinical Oncology Pharmacist</option>
              <option value="Translational Cancer Researcher">Translational Cancer Researcher</option>
            </select>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px]">All 6 AI Stages Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
