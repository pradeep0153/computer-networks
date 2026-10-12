import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDiagnosisHistory } from '../utils/storage.js';
import { StatCard } from '../components/common/StatCard.jsx';
import { SeverityBadge, BasisBadge } from '../components/common/Badge.jsx';
import { ScenarioPickerModal } from '../components/forms/ScenarioPickerModal.jsx';
import {
  Activity,
  PlusCircle,
  Sparkles,
  History,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Network,
  ArrowRight,
  ShieldCheck,
  Server,
  Layers,
  Info,
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  useEffect(() => {
    setHistory(getDiagnosisHistory());
  }, []);

  // Compute actual metrics from user's history
  const totalChecks = history.length;
  let totalIssuesFound = 0;
  let totalCritical = 0;
  let totalHealthy = 0;

  history.forEach((diag) => {
    if (diag.overallStatus === 'Healthy') {
      totalHealthy += 1;
    }
    if (diag.findings) {
      totalIssuesFound += diag.findings.filter(
        (f) => f.severity === 'Critical' || f.severity === 'High' || f.severity === 'Medium'
      ).length;
      totalCritical += diag.findings.filter((f) => f.severity === 'Critical').length;
    }
  });

  const handleSelectScenario = (scenario) => {
    navigate('/diagnose', { state: { scenarioData: scenario.data } });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-network-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-network-500/20 text-network-300 border border-network-500/30 text-xs font-semibold mb-4">
            <Activity className="w-3.5 h-3.5 text-network-400" />
            <span>Academic Computer Networks Lab Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Network Connectivity Troubleshooting Assistant
          </h1>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
            Diagnose IPv4 misconfigurations, calculate contiguous CIDR subnet boundaries, detect off-subnet default gateways, and isolate DNS resolution failures across OSI Layers 1 through 7.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/diagnose"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-network-600 hover:bg-network-500 text-white font-semibold text-xs shadow-md shadow-network-600/30 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch New Diagnosis</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsScenarioModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-network-400" />
              <span>Load Benchmark Scenario</span>
            </button>

            <Link
              to="/about"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Diagnostic Scope & Caveats</span>
            </Link>
          </div>
        </div>

        {/* Diagnostic Basis Notice */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              Diagnostic Engine Mode: <strong>Deterministic RFC Rule Base</strong> (Zero simulated latency or fabricated statistics)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Calculations executed 100% locally in browser memory
          </span>
        </div>
      </div>

      {/* Real Statistics Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Activity & Diagnostic Statistics
          </h2>
          <span className="text-xs text-slate-400">Calculated from your local session records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Analyses Run"
            value={totalChecks}
            subtitle={totalChecks === 0 ? 'Start your first diagnosis' : 'Stored in browser history'}
            icon={Activity}
            color="indigo"
          />
          <StatCard
            title="Total Issues Identified"
            value={totalIssuesFound}
            subtitle="Flagged by deterministic rules"
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            title="Critical Issues"
            value={totalCritical}
            subtitle="Halt communication or routing"
            icon={AlertCircle}
            color="rose"
          />
          <StatCard
            title="Clean / Healthy Validations"
            value={totalHealthy}
            subtitle="Passed all parameter checks"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      </div>

      {/* Capabilities Overview & Educational Pillars */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Supported Diagnostic Capabilities
        </h3>
        <p className="text-xs text-slate-600">
          NetPulse evaluates the complete network configuration pipeline according to core Computer Networks principles:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">
                L3
              </div>
              <h4 className="text-xs font-bold text-slate-900">IPv4 & Subnet Mask Analysis</h4>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Validates dotted-decimal notation, prevents leading zero octal ambiguity, enforces contiguous mask bits, and calculates network/broadcast IDs, host capacity, and /31 point-to-point links.
              </p>
            </div>
            <span className="text-[10px] font-mono text-network-600 mt-3 block">RFC 791 / RFC 4632</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-3">
                L3+
              </div>
              <h4 className="text-xs font-bold text-slate-900">Gateway & Locality Routing</h4>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Checks default gateway subnet containment, flags off-subnet gateways causing Layer 2 ARP failure, prevents gateway self-assignment, and classifies direct vs indirect delivery.
              </p>
            </div>
            <span className="text-[10px] font-mono text-network-600 mt-3 block">RFC 1122 / RFC 826 ARP</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                L7
              </div>
              <h4 className="text-xs font-bold text-slate-900">DNS Resolution & Layer Isolation</h4>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Validates resolver IP syntax and isolates cases where raw IP routing works but domain name lookups fail, differentiating DNS server outages from lower-layer network disconnects.
              </p>
            </div>
            <span className="text-[10px] font-mono text-network-600 mt-3 block">RFC 1034 / RFC 1035 DNS</span>
          </div>
        </div>
      </div>

      {/* Recent Diagnoses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-network-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Diagnosis Records</h3>
          </div>
          {history.length > 0 && (
            <Link
              to="/history"
              className="text-xs font-semibold text-network-600 hover:text-network-700 flex items-center space-x-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Network className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No diagnosis records yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Run a new network configuration diagnosis or load one of the built-in example scenarios to see results.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                to="/diagnose"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-network-600 hover:bg-network-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Run New Diagnosis</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsScenarioModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-4 h-4 text-network-600" />
                <span>Load Example</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {history.slice(0, 5).map((diag) => (
              <div
                key={diag.id}
                onClick={() => navigate('/results', { state: { diagnosis: diag } })}
                className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {diag.deviceName || 'Host Device'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        diag.overallStatus === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : diag.overallStatus === 'Critical'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {diag.overallStatus}
                    </span>
                    <BasisBadge basis={diag.diagnosticBasis} />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    IP: {diag.inputConfig?.ip || 'N/A'} | Mask: {diag.inputConfig?.mask || 'N/A'} | GW: {diag.inputConfig?.gateway || 'None'}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-[11px] text-slate-400">
                    {new Date(diag.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="text-network-600 flex items-center text-xs font-semibold">
                    <span>Reopen</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scenario Picker Modal */}
      <ScenarioPickerModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        onSelectScenario={handleSelectScenario}
      />
    </div>
  );
}
