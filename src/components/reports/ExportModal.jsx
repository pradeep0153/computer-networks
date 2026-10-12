import React from 'react';
import { Modal } from '../common/Modal.jsx';
import {
  exportAsJSON,
  exportAsCSV,
  exportAsText,
} from '../../utils/reportExport.js';
import { FileJson, FileSpreadsheet, FileText, Printer, Download } from 'lucide-react';

export function ExportModal({ isOpen, onClose, diagnosis }) {
  if (!diagnosis) return null;

  const handleExport = (type) => {
    if (type === 'json') exportAsJSON(diagnosis);
    if (type === 'csv') exportAsCSV(diagnosis);
    if (type === 'txt') exportAsText(diagnosis);
    if (type === 'print') window.print();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Diagnostic Report" maxWidth="max-w-lg">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Export this network troubleshooting record for submission, lab reports, or documentation. All exports include full IPv4 configuration, subnet calculations, findings, and diagnostic basis.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* JSON Export */}
          <button
            type="button"
            onClick={() => handleExport('json')}
            className="flex items-start space-x-3 p-4 rounded-xl border border-slate-200 hover:border-network-400 hover:bg-network-50/50 hover:shadow-sm transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Export as JSON</span>
              <span className="text-[11px] text-slate-500">Structured machine-readable data</span>
            </div>
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="flex items-start space-x-3 p-4 rounded-xl border border-slate-200 hover:border-network-400 hover:bg-network-50/50 hover:shadow-sm transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Export as CSV</span>
              <span className="text-[11px] text-slate-500">RFC 4180 spreadsheet table</span>
            </div>
          </button>

          {/* Plain Text Export */}
          <button
            type="button"
            onClick={() => handleExport('txt')}
            className="flex items-start space-x-3 p-4 rounded-xl border border-slate-200 hover:border-network-400 hover:bg-network-50/50 hover:shadow-sm transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Plain Text (.txt)</span>
              <span className="text-[11px] text-slate-500">Readable ASCII lab summary</span>
            </div>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={() => handleExport('print')}
            className="flex items-start space-x-3 p-4 rounded-xl border border-slate-200 hover:border-network-400 hover:bg-network-50/50 hover:shadow-sm transition-all text-left group"
          >
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Print / Save PDF</span>
              <span className="text-[11px] text-slate-500">Native browser print dialog</span>
            </div>
          </button>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed mt-4">
          <strong>Academic Note:</strong> Exported reports explicitly state that findings are produced by static configuration analysis and simulated or user-supplied observations. No live ICMP or raw socket packets were forged.
        </div>
      </div>
    </Modal>
  );
}
