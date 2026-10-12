import React from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

export function ObservationField({ label, description, value, onChange, id }) {
  const options = [
    {
      val: 'yes',
      label: 'Yes (Success)',
      icon: Check,
      activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
      hoverClass: 'hover:border-emerald-300 hover:bg-emerald-50 text-slate-700',
    },
    {
      val: 'no',
      label: 'No (Failed)',
      icon: X,
      activeClass: 'bg-rose-600 text-white border-rose-600 shadow-sm',
      hoverClass: 'hover:border-rose-300 hover:bg-rose-50 text-slate-700',
    },
    {
      val: 'untested',
      label: 'Not Tested',
      icon: HelpCircle,
      activeClass: 'bg-slate-700 text-white border-slate-700 shadow-sm',
      hoverClass: 'hover:border-slate-300 hover:bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <label htmlFor={id} className="text-xs font-semibold text-slate-800">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-500">{description}</p>
          )}
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5" role="radiogroup" aria-labelledby={id}>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = value === opt.val;
            return (
              <button
                key={opt.val}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(opt.val)}
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  isSelected ? opt.activeClass : `border-transparent ${opt.hoverClass}`
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
