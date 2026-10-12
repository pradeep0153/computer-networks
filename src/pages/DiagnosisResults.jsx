import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SubnetVisualizer } from '../components/diagnosis/SubnetVisualizer.jsx';
import { LocalityCard } from '../components/diagnosis/LocalityCard.jsx';
import { FindingCard } from '../components/diagnosis/FindingCard.jsx';
import { ActionChecklist } from '../components/reports/ActionChecklist.jsx';
import { ExportModal } from '../components/reports/ExportModal.jsx';
import { SeverityBadge, BasisBadge } from '../components/common/Badge.jsx';
import {
  RotateCcw,
  Edit3,
  Download,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Laptop,
  Layers,
  Wrench,
  Filter,
  ShieldCheck,
  Info,
} from 'lucide-react';

export function DiagnosisResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const diagnosis = location.state?.diagnosis;

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  if (!diagnosis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">No Diagnosis Active</h2>
        <p className="text-xs text-slate-500">
          No active diagnostic result was found. Run a new diagnosis or select an item from your history.
        </p>
        <Link
          to="/diagnose"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-network-600 text-white font-semibold text-xs shadow-sm"
        >
          <span>Start New Diagnosis</span>
        </Link>
      </div>
    );
  }

  const {
    id,
    timestamp,
    deviceName,
    overallStatus,
    diagnosticBasis,
    stats = {},
    subnetInfo,
    destLocality,
    inputConfig = {},
    findings = [],
    checklist = [],
  } = diagnosis;

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    if (severityFilter === 'ALL') return true;
    return f.severity === severityFilter;
  });

  const handleEditConfig = () => {
    navigate('/diagnose', { state: { editConfig: inputConfig } });
  };

  const handleRunAgain = () => {
    navigate('/diagnose', { state: { editConfig: inputConfig } });
  };

  const statusStyles = {
    Healthy: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      title: 'Healthy / Valid Configuration',
      desc: 'All analyzed IPv4 parameters and bitwise subnet calculations are logically consistent.',
    },
    Warning: {
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      title: 'Potential Issues Identified',
      desc: 'Configuration has anomalies or user observations indicate partial connectivity degradation.',
    },
    'Needs Attention': {
      bg: 'bg-orange-50 border-orange-300 text-orange-950',
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      title: 'Configuration Inconsistencies',
      desc: 'Non-fatal warnings or routing ambiguities were discovered.',
    },
    Critical: {
      bg: 'bg-rose-50 border-rose-300 text-rose-950',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
      title: 'Critical Configuration / Link Failure',
      desc: 'Severe errors detected (invalid syntax, off-subnet gateway, or unreachable physical link). Communication cannot occur.',
    },
    Incomplete: {
      bg: 'bg-slate-100 border-slate-300 text-slate-900',
      badge: 'bg-slate-200 text-slate-800 border-slate-400',
      icon: Info,
      iconColor: 'text-slate-600',
      title: 'Incomplete Parameters',
      desc: 'Essential parameters (Host IPv4 or Subnet Mask) were left blank.',
    },
  };

  const currentStatusConfig = statusStyles[overallStatus] || statusStyles.Warning;
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Report ID: {id}
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(timestamp).toLocaleString()}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Diagnosis Results: {deviceName}
          </h1>
        </div>

        {/* Buttons: Edit, Run Again, Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleEditConfig}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Configuration</span>
          </button>

          <button
            type="button"
            onClick={handleRunAgain}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Run Again</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-network-600 hover:bg-network-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className={`p-6 rounded-2xl border ${currentStatusConfig.bg} shadow-sm space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <div className={`p-2.5 rounded-xl bg-white shadow-sm shrink-0 ${currentStatusConfig.iconColor}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{currentStatusConfig.title}</h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${currentStatusConfig.badge}`}>
                  {overallStatus}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">{currentStatusConfig.desc}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Diagnostic Basis:</span>
            <BasisBadge basis={diagnosticBasis} />
          </div>
        </div>

        {/* Severity Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-black/5 text-xs">
          <div className="p-2.5 bg-white/80 rounded-xl border border-black/5">
            <span className="text-slate-500 text-[11px] block">Critical Errors</span>
            <span className="text-base font-bold text-rose-700">{stats.critical || 0}</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-black/5">
            <span className="text-slate-500 text-[11px] block">High Severity</span>
            <span className="text-base font-bold text-orange-700">{stats.high || 0}</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-black/5">
            <span className="text-slate-500 text-[11px] block">Medium Issues</span>
            <span className="text-base font-bold text-amber-700">{stats.medium || 0}</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-black/5">
            <span className="text-slate-500 text-[11px] block">Low / Notices</span>
            <span className="text-base font-bold text-blue-700">{stats.low || 0}</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-black/5">
            <span className="text-slate-500 text-[11px] block">Informational</span>
            <span className="text-base font-bold text-emerald-700">{stats.informational || 0}</span>
          </div>
        </div>
      </div>

      {/* Validated Configuration Parameters Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
            <Laptop className="w-4 h-4 text-network-600" />
            <span>Validated Configuration Parameters</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Layer 3 / 4 / 7</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Host IPv4</span>
            <span className="font-mono font-bold text-slate-900">{inputConfig.ip || 'None'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Subnet Mask</span>
            <span className="font-mono font-bold text-slate-900">{inputConfig.mask || 'None'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Default Gateway</span>
            <span className="font-mono font-bold text-slate-900">{inputConfig.gateway || 'Not set'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Primary DNS</span>
            <span className="font-mono font-bold text-slate-900">{inputConfig.primaryDns || 'Not set'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Secondary DNS</span>
            <span className="font-mono font-bold text-slate-900">{inputConfig.secondaryDns || 'Not set'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Destination Host</span>
            <span className="font-mono font-bold text-slate-900 truncate block">
              {inputConfig.destinationHostname || inputConfig.destinationIp || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Subnet Visualizer Component */}
      <SubnetVisualizer subnetInfo={subnetInfo} />

      {/* Destination Locality Card */}
      {destLocality && (
        <LocalityCard
          destLocality={destLocality}
          destinationIp={inputConfig.destinationIp}
          gateway={inputConfig.gateway}
        />
      )}

      {/* Troubleshooting Findings List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed Diagnostic Findings ({filteredFindings.length})
            </h3>
            <p className="text-xs text-slate-500">
              Each finding explains root cause reasoning, input evidence, and relevant networking concepts.
            </p>
          </div>

          {/* Severity Filter Tabs */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs">
            {['ALL', 'Critical', 'High', 'Medium', 'Informational'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSeverityFilter(filter)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  severityFilter === filter
                    ? 'bg-network-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No findings matching the selected filter ({severityFilter}).
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                defaultExpanded={finding.severity === 'Critical' || finding.severity === 'High'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Checklist */}
      <ActionChecklist initialChecklist={checklist} />

      {/* Academic Truth Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">
          ⚠️ Important Distinction Between Configuration Analysis and Physical Link State:
        </p>
        <p className="leading-relaxed">
          This application analyzes mathematical validity, RFC standards, and user-supplied connectivity reports. A valid configuration does not guarantee that physical switch ports, carrier transceivers, or remote servers are operational. For full physical testing, verify physical link LEDs and operating system CLI diagnostics (e.g., <code className="font-mono text-network-700">ping</code>, <code className="font-mono text-network-700">tracert / traceroute</code>, and <code className="font-mono text-network-700">nslookup</code>).
        </p>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        diagnosis={diagnosis}
      />
    </div>
  );
}
