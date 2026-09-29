import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Cpu,
  Layers,
  FileText,
  FileCode,
  Sparkles,
  Bot,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Settings,
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'patient-input'
  | 'ml-risk'
  | 'dl-analysis'
  | 'nlp-notes'
  | 'slm-summary'
  | 'genai-scenarios'
  | 'agent-command'
  | 'approval-gate'
  | 'audit-logs'
  | 'metrics'
  | 'settings';

interface NavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  pendingApprovalsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  pendingApprovalsCount = 1,
}) => {
  const navItems: Array<{ id: TabKey; label: string; icon: React.ReactNode; badge?: string; stage?: string }> = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'patient-input', label: 'Patient Registry', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'ml-risk', label: '1. ML Risk Model', icon: <Cpu className="w-4 h-4" />, stage: 'Stage 1' },
    { id: 'dl-analysis', label: '2. DL Multimodal', icon: <Layers className="w-4 h-4" />, stage: 'Stage 2' },
    { id: 'nlp-notes', label: '3. Clinical NLP', icon: <FileText className="w-4 h-4" />, stage: 'Stage 3' },
    { id: 'slm-summary', label: '4. SLM Summarizer', icon: <FileCode className="w-4 h-4" />, stage: 'Stage 4' },
    { id: 'genai-scenarios', label: '5. GenAI Stress-Test', icon: <Sparkles className="w-4 h-4" />, stage: 'Stage 5' },
    { id: 'agent-command', label: '6. Agent Command Center', icon: <Bot className="w-4 h-4 text-teal-400" />, stage: 'Stage 6' },
    {
      id: 'approval-gate',
      label: 'Human Approval Gate',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action Needed` : undefined,
    },
    { id: 'audit-logs', label: 'Audit Trail', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'metrics', label: 'Model Benchmarks', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'System Health & Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 px-6 overflow-x-auto scrollbar-thin">
      <div className="flex items-center space-x-1 min-w-max py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
