import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getDiagnosisHistory,
  deleteDiagnosis,
  clearDiagnosisHistory,
} from '../utils/storage.js';
import { BasisBadge } from '../components/common/Badge.jsx';
import { Toast } from '../components/common/Toast.jsx';
import {
  History as HistoryIcon,
  Trash2,
  ArrowRight,
  Search,
  AlertCircle,
  PlusCircle,
  ShieldAlert,
  Clock,
  Layers,
} from 'lucide-react';

export function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getDiagnosisHistory());
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteDiagnosis(id);
    loadHistory();
    setToastMessage('Diagnosis record removed.');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all stored diagnosis history?')) {
      clearDiagnosisHistory();
      loadHistory();
      setToastMessage('All history records cleared.');
    }
  };

  const handleReopen = (diag) => {
    navigate('/results', { state: { diagnosis: diag } });
  };

  const filteredHistory = history.filter((item) => {
    const q = searchTerm.toLowerCase();
    const dev = (item.deviceName || '').toLowerCase();
    const ip = (item.inputConfig?.ip || '').toLowerCase();
    const status = (item.overallStatus || '').toLowerCase();
    return dev.includes(q) || ip.includes(q) || status.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Diagnosis History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, reopen, or export past network troubleshooting runs stored in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Browser Storage Privacy Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Client-Side Storage Notice:</strong> Diagnosis records are persisted locally in your browser's <code className="font-mono text-amber-950">localStorage</code> (capped at the latest 20 items). No diagnostic records, IP addresses, or network topography data are transmitted to any external backend server.
        </div>
      </div>

      {/* Search Input */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by device identifier, IPv4 address, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:border-network-500 focus:ring-1 focus:ring-network-500 outline-none transition-all"
          />
        </div>
      )}

      {/* List */}
      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm space-y-3">
          <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No History Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not run any diagnoses yet. Perform a new check or load a benchmark scenario to populate history.
          </p>
          <div className="pt-2">
            <Link
              to="/diagnose"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-network-600 hover:bg-network-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Diagnosis</span>
            </Link>
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          No records matching "{searchTerm}".
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredHistory.map((diag) => (
            <div
              key={diag.id}
              onClick={() => handleReopen(diag)}
              className="p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    {diag.deviceName || 'Host Device'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      diag.overallStatus === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : diag.overallStatus === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {diag.overallStatus}
                  </span>
                  <BasisBadge basis={diag.diagnosticBasis} />
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {diag.id}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>IP: {diag.inputConfig?.ip || 'N/A'}</span>
                  <span>Mask: {diag.inputConfig?.mask || 'N/A'}</span>
                  <span>GW: {diag.inputConfig?.gateway || 'Not set'}</span>
                  <span>DNS: {diag.inputConfig?.primaryDns || 'Not set'}</span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(diag.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>{diag.findings?.length || 0} Findings</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDelete(diag.id, e)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete record"
                  aria-label="Delete diagnosis record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-network-50 text-network-700 font-semibold text-xs border border-network-200">
                  <span>Reopen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
