import React, { useState } from 'react';
import { SeverityBadge, BasisBadge } from '../common/Badge.jsx';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Wrench,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export function FindingCard({ finding, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const borderStyles = {
    Critical: 'border-l-4 border-l-rose-500 border-slate-200',
    High: 'border-l-4 border-l-orange-500 border-slate-200',
    Medium: 'border-l-4 border-l-amber-500 border-slate-200',
    Low: 'border-l-4 border-l-blue-500 border-slate-200',
    Informational: 'border-l-4 border-l-emerald-500 border-slate-200',
  };

  const bgStyles = {
    Critical: 'hover:bg-rose-50/20',
    High: 'hover:bg-orange-50/20',
    Medium: 'hover:bg-amber-50/20',
    Low: 'hover:bg-blue-50/20',
    Informational: 'hover:bg-emerald-50/20',
  };

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm transition-all overflow-hidden ${
        borderStyles[finding.severity] || 'border-slate-200'
      }`}
    >
      {/* Clickable Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none transition-colors ${
          bgStyles[finding.severity] || ''
        }`}
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <SeverityBadge severity={finding.severity} />
            <BasisBadge basis={finding.basis} />
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {finding.id}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              • {finding.category}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {finding.title}
          </h3>

          {!isExpanded && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
              {finding.explanation}
            </p>
          )}
        </div>

        <button
          type="button"
          aria-expanded={isExpanded}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
          aria-label={isExpanded ? 'Collapse finding' : 'Expand finding'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 bg-slate-50/40 text-xs">
          {/* Explanation */}
          <div>
            <span className="font-semibold text-slate-700 block mb-1">Detailed Networking Analysis:</span>
            <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
              {finding.explanation}
            </p>
          </div>

          {/* Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="font-semibold text-slate-700 flex items-center space-x-1.5 mb-1">
                <Search className="w-3.5 h-3.5 text-network-600" />
                <span>Observed Input & Evidence:</span>
              </span>
              <p className="font-mono text-slate-800 text-[11px] break-all">
                {finding.evidence}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="font-semibold text-slate-700 flex items-center space-x-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-network-600" />
                <span>Confidence & Certainty:</span>
              </span>
              <p className="text-slate-800 text-xs">
                {finding.confidence}
              </p>
            </div>
          </div>

          {/* Recommended Fix */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-950 flex items-center space-x-1.5 mb-1.5">
              <Wrench className="w-4 h-4 text-emerald-700" />
              <span>Recommended Action / Corrective Steps:</span>
            </span>
            <div className="text-emerald-900 whitespace-pre-line leading-relaxed">
              {finding.recommendedFix}
            </div>
          </div>

          {/* Educational Concept Card */}
          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-200 text-indigo-950 flex items-start space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Computer Networks Concept Reference:</span>
              <p className="text-[11px] text-indigo-900 mt-0.5">{finding.concept}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
