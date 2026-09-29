import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from '../services/api';
import { AuditLogItem } from '../types';
import { ClipboardList, Filter, Download, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(stageFilter === 'All' ? undefined : stageFilter);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [stageFilter]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oncoprecision_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Clinical Safety & Decision Audit Trail</h2>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                Immutable Ledger
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chronological provenance tracking inputs, model inferences, uncertainty bounds, and human approvals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Ledger
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium">
          <Filter className="w-3.5 h-3.5" /> Filter Stage:
        </span>
        {['All', 'ML', 'DL', 'NLP', 'SLM', 'GenAI', 'Agent', 'Agent Approval'].map((st) => (
          <button
            key={st}
            onClick={() => setStageFilter(st)}
            className={`px-3 py-1 rounded-lg transition-all font-mono text-[11px] ${
              stageFilter === st
                ? 'bg-teal-600 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Input Ref</th>
                <th className="p-3">Model / Engine</th>
                <th className="p-3">Conf</th>
                <th className="p-3">Status</th>
                <th className="p-3">Summary</th>
                <th className="p-3">Approval Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-mono">
                    <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {log.stage}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-teal-300 text-[11px]">{log.input_reference}</td>
                  <td className="p-3 font-sans text-slate-300">{log.model_name}</td>
                  <td className="p-3 font-mono text-slate-300">
                    {log.confidence ? `${Math.round(log.confidence * 100)}%` : '—'}
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {log.validation_status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200 max-w-xs truncate" title={log.output_summary}>
                    {log.output_summary}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.approval_status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : log.approval_status === 'Pending'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.approval_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
