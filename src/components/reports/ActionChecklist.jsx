import React, { useState } from 'react';
import { CheckSquare, Square, Wrench, CheckCircle2 } from 'lucide-react';
import { SeverityBadge } from '../common/Badge.jsx';

export function ActionChecklist({ initialChecklist = [] }) {
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const toggleStep = (stepNumber) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const total = initialChecklist.length;
  const completed = completedSteps.size;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 100;

  if (total === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-network-600" />
            <h3 className="text-base font-bold text-slate-900">Step-by-Step Action Checklist</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Follow these prioritized corrective actions in sequence to resolve identified connectivity issues.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700">
            {completed} of {total} completed ({percent}%)
          </span>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {initialChecklist.map((item) => {
          const isDone = completedSteps.has(item.step);
          return (
            <div
              key={item.step}
              onClick={() => toggleStep(item.step)}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start space-x-3.5 ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-500'
                  : 'bg-white border-slate-200 hover:border-network-300 hover:shadow-sm'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-network-600 focus:outline-none"
                aria-label={`Toggle step ${item.step}`}
              >
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 hover:text-network-500 shrink-0" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    Step {item.step}: {item.title}
                  </span>
                  <SeverityBadge severity={item.severity} />
                </div>

                <div
                  className={`text-xs whitespace-pre-line leading-relaxed ${
                    isDone ? 'text-slate-400' : 'text-slate-600 font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2'
                  }`}
                >
                  {item.action}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
